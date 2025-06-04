"""Domain services for the resume editor."""

from typing import Optional, Dict, Any, List

from .models import Resume
from .repositories import ResumeRepository


class ResumeDomainService:
    """Domain service for resume operations."""
    
    def __init__(self, repository: ResumeRepository):
        """Initialize the service with a repository.
        
        Args:
            repository: Resume repository
        """
        self.repository = repository
    
    def get_resume(self, user_id: str) -> Optional[Resume]:
        """Get a user's resume.
        
        Args:
            user_id: User identifier
            
        Returns:
            Resume object or None if not found
        """
        return self.repository.get_resume(user_id)
    
    def save_resume(self, user_id: str, resume: Resume) -> bool:
        """Save a user's resume.
        
        Args:
            user_id: User identifier
            resume: Resume object
            
        Returns:
            True if successful, False otherwise
        """
        return self.repository.save_resume(user_id, resume)
    
    def update_section(self, user_id: str, section: str, data: Any) -> bool:
        """Update a specific section of a user's resume.
        
        Args:
            user_id: User identifier
            section: Section name to update
            data: New data for the section
            
        Returns:
            True if successful, False otherwise
        """
        return self.repository.update_section(user_id, section, data)
    
    def initialize_resume(self, user_id: str, name: str, email: str, title: Optional[str] = None) -> Resume:
        """Initialize a new resume for a user.
        
        Args:
            user_id: User identifier
            name: User's name
            email: User's email
            title: Optional professional title
            
        Returns:
            Newly created Resume object
        """
        from .models import Contact
        
        # Create a basic resume with just name, title and contact info
        resume = Resume(
            name=name,
            title=title,
            contact=Contact(
                email=email
            )
        )
        
        # Save the resume
        self.repository.save_resume(user_id, resume)
        
        return resume
