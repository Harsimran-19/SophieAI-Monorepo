"""Repository interfaces for the resume editor domain."""

from abc import ABC, abstractmethod
from typing import Optional, Any

from .models import Resume


class ResumeRepository(ABC):
    """Interface for resume storage operations."""
    
    @abstractmethod
    def get_resume(self, user_id: str) -> Optional[Resume]:
        """Get a resume by user ID.
        
        Args:
            user_id: User identifier
            
        Returns:
            Resume object or None if not found
        """
        pass
    
    @abstractmethod
    def save_resume(self, user_id: str, resume: Resume) -> bool:
        """Save a resume for a user.
        
        Args:
            user_id: User identifier
            resume: Resume object
            
        Returns:
            True if successful, False otherwise
        """
        pass
    
    @abstractmethod
    def update_section(self, user_id: str, section: str, data: Any) -> bool:
        """Update a specific section of the resume.
        
        Args:
            user_id: User identifier
            section: Section name to update
            data: New data for the section
            
        Returns:
            True if successful, False otherwise
        """
        pass


class ChatHistoryRepository(ABC):
    """Interface for chat history storage operations."""
    
    @abstractmethod
    def save_message(self, user_id: str, is_user: bool, content: str) -> bool:
        """Save a message to the chat history.
        
        Args:
            user_id: User identifier
            is_user: True if message is from user, False if from assistant
            content: Message content
            
        Returns:
            True if successful, False otherwise
        """
        pass
    
    @abstractmethod
    def get_history(self, user_id: str, limit: Optional[int] = None) -> list:
        """Get chat history for a user.
        
        Args:
            user_id: User identifier
            limit: Optional limit on number of messages to retrieve
            
        Returns:
            List of message objects
        """
        pass
