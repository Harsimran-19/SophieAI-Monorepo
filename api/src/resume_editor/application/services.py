"""Application services for the resume editor."""

from typing import Dict, List, Optional, Any

from loguru import logger

from ..domain.models import Resume
from ..domain.repositories import ResumeRepository, ChatHistoryRepository
from ..domain.services import ResumeDomainService
from ..infrastructure.llm import LLMService


class ResumeApplicationService:
    """Application service for resume operations."""
    
    def __init__(
        self, 
        resume_repository: ResumeRepository,
        chat_history_repository: ChatHistoryRepository,
        llm_service: LLMService
    ):
        """Initialize the service.
        
        Args:
            resume_repository: Resume repository
            chat_history_repository: Chat history repository
            llm_service: LLM service
        """
        self.resume_domain_service = ResumeDomainService(resume_repository)
        self.chat_history_repository = chat_history_repository
        self.llm_service = llm_service
    
    async def get_resume(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a user's resume.
        
        Args:
            user_id: User identifier
            
        Returns:
            Resume data dictionary or None if not found
        """
        resume = self.resume_domain_service.get_resume(user_id)
        if resume:
            return resume.model_dump()
        return None
    
    async def update_resume(self, user_id: str, resume_data: Dict[str, Any]) -> bool:
        """Update a user's resume.
        
        Args:
            user_id: User identifier
            resume_data: New resume data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            resume = Resume(**resume_data)
            return self.resume_domain_service.save_resume(user_id, resume)
        except Exception as e:
            logger.error(f"Error updating resume for user {user_id}: {e}")
            return False
    
    async def update_section(self, user_id: str, section: str, data: Any) -> bool:
        """Update a specific section of a user's resume.
        
        Args:
            user_id: User identifier
            section: Section name to update
            data: New data for the section
            
        Returns:
            True if successful, False otherwise
        """
        return self.resume_domain_service.update_section(user_id, section, data)
    
    async def initialize_resume(self, user_id: str, name: str, email: str, title: Optional[str] = None) -> Dict[str, Any]:
        """Initialize a new resume for a user.
        
        Args:
            user_id: User identifier
            name: User's name
            email: User's email
            title: Optional professional title
            
        Returns:
            New resume data as a dictionary
        """
        resume = self.resume_domain_service.initialize_resume(user_id, name, email, title)
        return resume.model_dump()
    
    async def process_message(self, user_id: str, message: str) -> str:
        """Process a user message and generate a response.
        
        Args:
            user_id: User identifier
            message: User message
            
        Returns:
            Assistant response
        """
        # Save the user message
        self.chat_history_repository.save_message(user_id, True, message)
        
        # Get the chat history
        history = self.chat_history_repository.get_history(user_id, limit=10)
        
        # Prepare the conversation for the LLM
        conversation = []
        for entry in history:
            role = "user" if entry["is_user"] else "assistant"
            conversation.append({"role": role, "content": entry["content"]})
        
        # Add the current message if not already in history
        if not history or history[-1]["content"] != message:
            conversation.append({"role": "user", "content": message})
        
        # Get the resume for context
        resume = self.resume_domain_service.get_resume(user_id)
        
        # Create system prompt with resume context if available
        system_prompt = """You are a helpful Resume Copilot assistant. You help users improve their resumes by 
        providing suggestions and making updates directly to their resume.

        You have the ability to view and modify the user's resume data. When a user asks you to make changes to their resume, 
        first confirm the specific changes they want, then acknowledge that you'll update their resume.

        Always tell the user what changes you've made to their resume after making them.
        Provide helpful career advice and resume best practices when appropriate.
        
        When making suggestions, be specific and tailor your advice to the user's industry and career level.
        If something is unclear or missing from the resume, ask clarifying questions.

        User ID: {user_id}
        """.format(user_id=user_id)
        
        # Generate response
        response = await self.llm_service.generate_response(conversation, system_prompt)
        
        # Save the assistant's response
        self.chat_history_repository.save_message(user_id, False, response)
        
        return response
    
    async def analyze_resume(self, user_id: str, question: Optional[str] = None) -> str:
        """Analyze a user's resume and provide feedback.
        
        Args:
            user_id: User identifier
            question: Optional specific question about the resume
            
        Returns:
            Analysis text
        """
        resume = self.resume_domain_service.get_resume(user_id)
        if not resume:
            return "No resume found for this user. Please initialize a resume first."
        
        return await self.llm_service.analyze_resume(resume, question)
