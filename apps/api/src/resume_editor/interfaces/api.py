"""FastAPI endpoints for the resume editor application."""

from typing import Dict, List, Optional, Any

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger

from ..application.config import ApplicationConfig
from ..application.services import ResumeApplicationService
from ..domain.repositories import ResumeRepository, ChatHistoryRepository
from ..infrastructure.repositories import FileResumeRepository, InMemoryChatHistoryRepository
from ..infrastructure.llm import LLMService


# Pydantic models for the API
class MessageRequest(BaseModel):
    """Request model for sending a message to the agent."""
    
    user_id: str
    message: str


class MessageResponse(BaseModel):
    """Response model for a message from the agent."""
    
    response: str


class ResumeRequest(BaseModel):
    """Request model for creating or updating a resume."""
    
    user_id: str
    resume_data: Dict[str, Any]


class ResumeResponse(BaseModel):
    """Response model for resume operations."""
    
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None


class InitResumeRequest(BaseModel):
    """Request model for initializing a new resume."""
    
    user_id: str
    name: str
    email: str
    title: Optional[str] = None


class AnalyzeResumeRequest(BaseModel):
    """Request model for analyzing a resume."""
    
    user_id: str
    question: Optional[str] = None


# Dependency injection
def get_config():
    """Get application configuration."""
    try:
        return ApplicationConfig()
    except Exception as e:
        logger.error(f"Error loading configuration: {e}")
        # Fallback to default config if environment variables are missing
        return ApplicationConfig.model_construct()


def get_resume_repository(config: ApplicationConfig = Depends(get_config)) -> ResumeRepository:
    """Get resume repository implementation."""
    return FileResumeRepository(config.absolute_data_path)


def get_chat_history_repository() -> ChatHistoryRepository:
    """Get chat history repository implementation."""
    # For now, using in-memory repository
    # In a production system, this could be switched to MongoDB based on config
    return InMemoryChatHistoryRepository()


def get_llm_service(config: ApplicationConfig = Depends(get_config)) -> LLMService:
    """Get LLM service implementation."""
    return LLMService(
        api_key=config.groq_api_key,
        model_name=config.model_name,
        temperature=config.temperature
    )


def get_application_service(
    resume_repository: ResumeRepository = Depends(get_resume_repository),
    chat_history_repository: ChatHistoryRepository = Depends(get_chat_history_repository),
    llm_service: LLMService = Depends(get_llm_service)
) -> ResumeApplicationService:
    """Get application service."""
    return ResumeApplicationService(
        resume_repository=resume_repository,
        chat_history_repository=chat_history_repository,
        llm_service=llm_service
    )


# Create FastAPI app
app = FastAPI(
    title="Resume Editor API",
    description="API for the Resume Editor Application",
    version="0.1.0",
)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Resume Editor API is running"}


@app.post("/chat", response_model=MessageResponse)
async def chat(
    request: MessageRequest,
    app_service: ResumeApplicationService = Depends(get_application_service)
):
    """Chat with the resume editor assistant.
    
    Args:
        request: Message request
        
    Returns:
        Assistant response
    """
    try:
        response = await app_service.process_message(request.user_id, request.message)
        return MessageResponse(response=response)
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/resume/{user_id}", response_model=ResumeResponse)
async def get_resume(
    user_id: str,
    app_service: ResumeApplicationService = Depends(get_application_service)
) -> ResumeResponse:
    """Get a user's resume.
    
    Args:
        user_id: User identifier
        
    Returns:
        Resume data
    """
    try:
        resume = await app_service.get_resume(user_id)
        
        if not resume:
            return ResumeResponse(
                status="error",
                message=f"No resume found for user {user_id}"
            )
        
        return ResumeResponse(
            status="success",
            message="Resume retrieved successfully",
            data=resume
        )
    except Exception as e:
        logger.error(f"Error retrieving resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resume", response_model=ResumeResponse)
async def update_resume(
    request: ResumeRequest,
    app_service: ResumeApplicationService = Depends(get_application_service)
) -> ResumeResponse:
    """Update a user's resume.
    
    Args:
        request: Resume update request
        
    Returns:
        Status response
    """
    try:
        success = await app_service.update_resume(request.user_id, request.resume_data)
        
        if not success:
            return ResumeResponse(
                status="error",
                message="Failed to update resume"
            )
        
        return ResumeResponse(
            status="success",
            message="Resume updated successfully"
        )
    except Exception as e:
        logger.error(f"Error updating resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resume/init", response_model=ResumeResponse)
async def init_resume(
    request: InitResumeRequest,
    app_service: ResumeApplicationService = Depends(get_application_service)
) -> ResumeResponse:
    """Initialize a new resume for a user.
    
    Args:
        request: Resume initialization request
        
    Returns:
        Status and resume data
    """
    try:
        # Check if resume already exists
        existing_resume = await app_service.get_resume(request.user_id)
        if existing_resume:
            return ResumeResponse(
                status="error",
                message=f"Resume already exists for user {request.user_id}"
            )
        
        # Initialize new resume
        resume = await app_service.initialize_resume(
            request.user_id,
            request.name,
            request.email,
            request.title
        )
        
        return ResumeResponse(
            status="success",
            message="Resume initialized successfully",
            data=resume
        )
    except Exception as e:
        logger.error(f"Error initializing resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resume/analyze", response_model=MessageResponse)
async def analyze_resume(
    request: AnalyzeResumeRequest,
    app_service: ResumeApplicationService = Depends(get_application_service)
) -> MessageResponse:
    """Analyze a user's resume.
    
    Args:
        request: Resume analysis request
        
    Returns:
        Analysis response
    """
    try:
        analysis = await app_service.analyze_resume(request.user_id, request.question)
        return MessageResponse(response=analysis)
    except Exception as e:
        logger.error(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("API_PORT", 8000))
    print(f"Starting Resume Editor API on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)