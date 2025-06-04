"""API endpoints for material generator module."""
import os
import tempfile
import shutil
import uuid
import subprocess
import jinja2
from typing import Optional, List, Dict, Any, Union

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, Field

from langchain_groq import ChatGroq

from material_generator.application.cover_letter_service import generate_cover_letter
from material_generator.application.resume_optimizer_service import ResumeOptimizationService
from material_generator.application.resume_data_extractor import ResumeDataExtractionService
from common.domain.logger import get_logger
from material_generator.config import settings


# Initialize FastAPI app
app = FastAPI(
    title="Material Generator API",
    description="API for generating cover letters, optimizing resumes, and extracting resume data.",
    version="1.0.0",
    responses={404: {"description": "Not found"}},
)

# Mount the material-generator routes with a prefix
# If you want all routes in this file to be under /material-generator
# we'll keep a router for that specific prefix and include it in the main app.
# For now, I will assume the routes should be at the root of this app instance.

# If you intend this to be a sub-application mounted elsewhere with /material-generator prefix,
# then APIRouter was correct. But based on the request to change to 'app',
# I'm making it a root FastAPI app.


# Initialize logger
logger = get_logger(__name__)


class CoverLetterRequest(BaseModel):
    """Request model for cover letter generation."""
    
    job_description: str = Field(description="Job description to base the cover letter on")
    user_name: str = Field(description="Name of the user for whom the cover letter is generated")


class CoverLetterResponse(BaseModel):
    """Response model for cover letter generation."""
    
    content: str = Field(description="Generated cover letter content")


@app.post("/cover-letter", response_model=CoverLetterResponse)
async def create_cover_letter(request: CoverLetterRequest):
    """Generate a cover letter based on job description and user name.
    
    Args:
        request (CoverLetterRequest): Request containing job description and user name.
        
    Returns:
        CoverLetterResponse: Response containing the generated cover letter.
        
    Raises:
        HTTPException: If there is an error generating the cover letter.
    """
    try:
        cover_letter = await generate_cover_letter(
            job_description=request.job_description,
            user_name=request.user_name
        )
        return CoverLetterResponse(content=cover_letter.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ResumeOptimizationRequest(BaseModel):
    """Request model for resume optimization."""
    
    job_description: Optional[str] = Field(None, description="Job description to optimize the resume for")
    job_url: Optional[str] = Field(None, description="URL of the job posting to optimize the resume for")


class ResumeOptimizationResponse(BaseModel):
    """Response model for resume optimization."""
    
    resume_content: Dict[str, Any] = Field(description="Optimized resume content in structured format")


def get_llm_client():
    """Get LLM client instance - now returns ChatGroq"""
    try:
        return ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_LLM_MODEL,
            temperature=0.2,
            max_tokens=4096
        )
    except Exception as e:
        logger.error(f"Failed to initialize ChatGroq: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to initialize LLM client"
        )


class ResumeData(BaseModel):
    """Model for resume data"""
    resume: Dict[str, Any]

def escape_for_latex(data):
    if isinstance(data, dict):
        return {key: escape_for_latex(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [escape_for_latex(item) for item in data]
    elif isinstance(data, str):
        latex_special_chars = {
            "&": r"\&",
            "%": r"\%",
            "$": r"\$",
            "#": r"\#",
            "_": r"\_",
            "{": r"\{",
            "}": r"\}",
            "~": r"\textasciitilde{}",
            "^": r"\^{}",
            "\\": r"\textbackslash{}",
            "\n": "\\newline%\n",
            "-": r"{-}",
            "\xA0": "~",
            "[": r"{[}",
            "]": r"{]}",
        }
        return "".join([latex_special_chars.get(c, c) for c in data])
    return data

def setup_jinja_env(templates_path: str) -> jinja2.Environment:
    return jinja2.Environment(
        block_start_string="\BLOCK{",
        block_end_string="}",
        variable_start_string="\VAR{",
        variable_end_string="}",
        comment_start_string="\#{",
        comment_end_string="}",
        line_statement_prefix="%-",
        line_comment_prefix="%#",
        trim_blocks=True,
        autoescape=False,
        loader=jinja2.FileSystemLoader(templates_path)
    )

def generate_latex(json_resume: dict, templates_path: str) -> str:
    try:
        latex_jinja_env = setup_jinja_env(templates_path)
        escaped_json_resume = escape_for_latex(json_resume)
        template = latex_jinja_env.get_template("resume.tex.jinja")
        return template.render(escaped_json_resume)
    except Exception as e:
        raise Exception(f"Failed to generate LaTeX: {str(e)}")

def compile_latex_to_pdf(tex_content: str, temp_dir: str) -> str:
    try:
        # Write LaTeX content to temporary file
        tex_path = os.path.join(temp_dir, "resume.tex")
        with open(tex_path, "w", encoding='utf-8') as f:
            f.write(tex_content)

        # Run pdflatex twice to ensure proper compilation
        for _ in range(2):
            result = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", tex_path],
                cwd=temp_dir,
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                raise Exception(f"PDFLaTeX Error: {result.stderr}")

        pdf_path = os.path.join(temp_dir, "resume.pdf")
        if not os.path.exists(pdf_path):
            raise Exception("PDF file was not generated")
        
        return pdf_path
    except Exception as e:
        raise Exception(f"Failed to compile PDF: {str(e)}")

@app.post("/convert/resume-to-pdf")
async def convert_resume_to_pdf(data: ResumeData):
    try:
        # Create temporary directory for compilation
        with tempfile.TemporaryDirectory() as temp_dir:
            # Copy template files to temp directory
            templates_path = "/app/src/templates"  # Update this path
            required_files = ["resume.cls", "resume.tex.jinja"]
            
            for file in required_files:
                src_path = os.path.join(templates_path, file)
                if not os.path.exists(src_path):
                    raise HTTPException(
                        status_code=500,
                        detail=f"Required template file {file} not found"
                    )
                shutil.copy(src_path, temp_dir)
            print(data)
            # Generate LaTeX from JSON
            # latex_content = generate_latex(data.resume, temp_dir)
            # pdf_path = compile_latex_to_pdf(latex_content, temp_dir)
            # with open(pdf_path, "rb") as f:
            #     pdf_content = f.read()
            # filename = f"resume_{uuid.uuid4()}.pdf"
            # return Response(
            #     content=pdf_content,
            #     media_type="application/pdf",
            #     headers={"Content-Disposition": f"attachment; filename={filename}"}
            # )
            latex_content = generate_latex(data.resume, temp_dir)
            
            # # Compile LaTeX to PDF
            pdf_path = compile_latex_to_pdf(latex_content, temp_dir)
            with open(pdf_path, "rb") as f:
                pdf_content = f.read()
            
            # # Create response file
            filename = f"resume_{uuid.uuid4()}.pdf"
            # response_path = os.path.join(temp_dir, filename)
            # shutil.copy2(pdf_path, response_path)
            
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error converting resume to PDF: {str(e)}"
        )

@app.post("/optimize-resume")
async def optimize_resume(
    resume_file: UploadFile = File(...),
    job_url: str = Form(None),
    job_text: str = Form(None),
    return_latex: bool = Form(False)
):
    """Optimize resume based on job requirements"""
    if not resume_file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided"
        )
    if not resume_file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are supported"
        )

    try:
        # Get ChatGroq LLM client
        llm = get_llm_client()
        optimizer = ResumeOptimizationService(llm)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            content = await resume_file.read()
            if not content:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded file is empty"
                )
            tmp.write(content)
            result = optimizer.optimize_resume(
                tmp.name,
                job_description=job_text,
                job_url=job_url,
                return_latex=return_latex
            )

        return {
            "result": result}
    except Exception as e:
        logger.error("Resume optimization failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Resume optimization failed: {str(e)}"
        ) 
# Note: Removed VertexGemini and Settings dependencies as we're using ChatGroq now

@app.post("/extract-resume-data")
async def extract_resume_data(file: UploadFile = File(...)):
    """Analyze and extract structured data from resume PDF"""
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided"
        )
        
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    try:
        # Get ChatGroq LLM client
        llm = get_llm_client()
        extractor = ResumeDataExtractionService(llm)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            content = await file.read()
            if not content:
                raise HTTPException(
                    status_code=400,
                    detail="Uploaded file is empty"
                )
            tmp.write(content)
            resume_data = extractor.extract_user_data(tmp.name)
            
        return resume_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Resume analysis failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Resume analysis failed: {str(e)}"
        ) 


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "material_generator"}
