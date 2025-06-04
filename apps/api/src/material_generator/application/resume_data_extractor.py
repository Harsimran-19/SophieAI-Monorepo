# services/resume/data_extraction.py
import os
import json
import validators
from typing import Dict, Any, Optional

from common.domain.logger import get_logger
from material_generator.domain.models import ResumeSchema
from material_generator.application.data_extraction import extract_text
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.language_models.chat_models import BaseChatModel
from material_generator.domain.prompts import RESUME_DETAILS_EXTRACTOR
from material_generator.config import settings

class ResumeDataExtractionService:
    def __init__(self, llm: BaseChatModel):
        self.logger = get_logger(self.__class__.__name__)
        self.llm = llm

    def resume_to_json(self, pdf_path):
        """Converts a resume PDF to structured JSON"""
        self.logger.info("Converting resume to JSON", path=pdf_path)
        
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"File not found: {pdf_path}")
            
        if not pdf_path.lower().endswith('.pdf'):
            raise ValueError("File must be a PDF")
        
        try:
            resume_text = extract_text(pdf_path)
            if not resume_text:
                raise ValueError("No text could be extracted from PDF")
                
            json_parser = JsonOutputParser(pydantic_object=ResumeSchema)
            
            prompt = PromptTemplate(
                template=RESUME_DETAILS_EXTRACTOR,
                input_variables=["resume_text"],
                partial_variables={"format_instructions": json_parser.get_format_instructions()}
            )
            
            json_parser = JsonOutputParser(pydantic_object=ResumeSchema)
            chain = prompt | self.llm | json_parser
            response = chain.invoke({"resume_text": resume_text})
            
            # Ensure the response is a dictionary if it's returned as a string
            if isinstance(response, str):
                try:
                    response = json.loads(response)
                except json.JSONDecodeError:
                    self.logger.error("Failed to parse LLM response as JSON")
                    raise
                    
            return response
            
        except Exception as e:
            self.logger.error("Resume conversion failed", error=str(e))
            raise

    def extract_user_data(self, input_path):
        """Unified user data extraction from multiple sources"""
        self.logger.info("Extracting user data", path=input_path)
        
        if not input_path:
            raise ValueError("Input path cannot be empty")
            
        try:
            input_path = str(input_path).strip()
            
            # Handle PDF files
            if input_path.lower().endswith(".pdf"):
                return self.resume_to_json(input_path)
                
            # Handle JSON files    
            elif input_path.lower().endswith(".json"):
                if not os.path.exists(input_path):
                    raise FileNotFoundError(f"JSON file not found: {input_path}")
                return utils.read_json(input_path)
                
            # Handle URLs
            elif validators.url(input_path):
                return read_data_from_url([input_path])
                
            else:
                supported_formats = [".pdf", ".json", "valid URL"]
                raise ValueError(
                    f"Unsupported file format. Supported formats are: {', '.join(supported_formats)}"
                )
                
        except Exception as e:
            self.logger.error("User data extraction failed", error=str(e))
            raise