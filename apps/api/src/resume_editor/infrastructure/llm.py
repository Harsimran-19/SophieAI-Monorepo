"""LLM integration for the resume editor."""

from typing import Dict, List, Optional, Any

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage
from langchain_groq import ChatGroq
from loguru import logger

from ..domain.models import Resume


class LLMService:
    """Service for interacting with language models."""
    
    def __init__(self, api_key: str, model_name: str = "llama-3.3-70b-versatile", temperature: float = 0.3):
        """Initialize the LLM service.
        
        Args:
            api_key: API key for the LLM provider
            model_name: Name of the model to use
            temperature: Temperature for generation
        """
        self.model = ChatGroq(
            api_key=api_key,
            model_name=model_name,
            temperature=temperature,
        )
    
    async def generate_response(self, messages: List[Dict[str, str]], system_prompt: str) -> str:
        """Generate a response from the LLM based on messages.
        
        Args:
            messages: List of message dictionaries with 'role' and 'content' keys
            system_prompt: System prompt to guide the model
            
        Returns:
            Generated response text
        """
        try:
            # Prepare conversation format for the LLM
            conversation = []
            conversation.append({"role": "system", "content": system_prompt})
            
            # Add the messages
            for msg in messages:
                conversation.append(msg)
            
            # Invoke the LLM
            llm_response = self.model.invoke(conversation)
            
            # Extract content from the response
            if hasattr(llm_response, 'content'):
                response_text = llm_response.content
            else:
                response_text = str(llm_response)
            
            return response_text
        except Exception as e:
            logger.error(f"Error generating LLM response: {e}")
            return "I'm sorry, I encountered an error while processing your request."
    
    async def analyze_resume(self, resume: Resume, question: Optional[str] = None) -> str:
        """Analyze a resume and provide feedback or answer a question.
        
        Args:
            resume: Resume object to analyze
            question: Optional specific question about the resume
            
        Returns:
            Analysis or answer text
        """
        try:
            # Convert resume to JSON string for the prompt
            import json
            from datetime import date
            
            def serialize_date(obj):
                if isinstance(obj, date):
                    return obj.isoformat()
                raise TypeError(f"Type {type(obj)} not serializable")
            
            resume_json = json.dumps(resume.model_dump(), default=serialize_date, indent=2)
            
            # Create prompt based on whether there's a specific question
            if question:
                prompt = f"""Analyze the following resume and answer this specific question: {question}
                
Resume:
{resume_json}

Provide a detailed and helpful response."""
            else:
                prompt = f"""Analyze the following resume and provide professional feedback:
                
Resume:
{resume_json}

Focus on:
1. Overall structure and organization
2. Impact and achievements
3. Specific improvement suggestions
4. Skills alignment with career goals (if discernible)

Provide actionable advice that would help strengthen this resume."""
            
            # Generate response
            conversation = [{"role": "user", "content": prompt}]
            return await self.generate_response(conversation, "You are a professional resume reviewer with expertise in career coaching.")
        except Exception as e:
            logger.error(f"Error analyzing resume: {e}")
            return "I'm sorry, I encountered an error while analyzing the resume."
