"""Repository implementations for the resume editor."""

import json
from datetime import date, datetime
from pathlib import Path
from typing import Optional, Dict, List, Any

from loguru import logger

from ..domain.models import Resume
from ..domain.repositories import ResumeRepository, ChatHistoryRepository


def _serialize_date(obj):
    """Helper function to serialize date objects to string."""
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


class FileResumeRepository(ResumeRepository):
    """File-based implementation of the resume repository."""
    
    def __init__(self, storage_path: str = "./data"):
        """Initialize the repository.
        
        Args:
            storage_path: Path to store resume data
        """
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True, parents=True)
    
    def _get_resume_path(self, user_id: str) -> Path:
        """Get the path to a user's resume file.
        
        Args:
            user_id: User identifier
            
        Returns:
            Path to the resume file
        """
        return self.storage_path / f"{user_id}.json"
    
    def get_resume(self, user_id: str) -> Optional[Resume]:
        """Get a resume by user ID.
        
        Args:
            user_id: User identifier
            
        Returns:
            Resume object or None if not found
        """
        resume_path = self._get_resume_path(user_id)
        if not resume_path.exists():
            return None
        
        try:
            with open(resume_path, "r") as f:
                resume_data = json.load(f)
            
            # Convert string dates back to date objects
            if "education" in resume_data:
                for edu in resume_data["education"]:
                    if "start_date" in edu:
                        edu["start_date"] = date.fromisoformat(edu["start_date"])
                    if "end_date" in edu and edu["end_date"]:
                        edu["end_date"] = date.fromisoformat(edu["end_date"])
            
            if "experience" in resume_data:
                for exp in resume_data["experience"]:
                    if "start_date" in exp:
                        exp["start_date"] = date.fromisoformat(exp["start_date"])
                    if "end_date" in exp and exp["end_date"]:
                        exp["end_date"] = date.fromisoformat(exp["end_date"])
            
            if "projects" in resume_data:
                for proj in resume_data["projects"]:
                    if "start_date" in proj and proj["start_date"]:
                        proj["start_date"] = date.fromisoformat(proj["start_date"])
                    if "end_date" in proj and proj["end_date"]:
                        proj["end_date"] = date.fromisoformat(proj["end_date"])
                    
            return Resume(**resume_data)
        except Exception as e:
            logger.error(f"Error loading resume for user {user_id}: {e}")
            return None
    
    def save_resume(self, user_id: str, resume: Resume) -> bool:
        """Save a resume for a user.
        
        Args:
            user_id: User identifier
            resume: Resume object
            
        Returns:
            True if successful, False otherwise
        """
        resume_path = self._get_resume_path(user_id)
        try:
            with open(resume_path, "w") as f:
                json.dump(resume.model_dump(), f, default=_serialize_date, indent=2)
            return True
        except Exception as e:
            logger.error(f"Error saving resume for user {user_id}: {e}")
            return False
    
    def update_section(self, user_id: str, section: str, data: Any) -> bool:
        """Update a specific section of the resume.
        
        Args:
            user_id: User identifier
            section: Section name to update
            data: New data for the section
            
        Returns:
            True if successful, False otherwise
        """
        resume = self.get_resume(user_id)
        if not resume:
            return False
        
        try:
            # Convert to a dict for easier manipulation
            resume_dict = resume.model_dump()
            resume_dict[section] = data
            
            # Create a new Resume object and save
            updated_resume = Resume(**resume_dict)
            return self.save_resume(user_id, updated_resume)
        except Exception as e:
            logger.error(f"Error updating resume section {section} for user {user_id}: {e}")
            return False


class InMemoryChatHistoryRepository(ChatHistoryRepository):
    """In-memory implementation of the chat history repository."""
    
    def __init__(self):
        """Initialize the repository."""
        self.histories = {}  # user_id -> list of messages
    
    def save_message(self, user_id: str, is_user: bool, content: str) -> bool:
        """Save a message to the chat history.
        
        Args:
            user_id: User identifier
            is_user: True if message is from user, False if from assistant
            content: Message content
            
        Returns:
            True if successful
        """
        if user_id not in self.histories:
            self.histories[user_id] = []
        
        self.histories[user_id].append({
            "is_user": is_user,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        
        return True
    
    def get_history(self, user_id: str, limit: Optional[int] = None) -> list:
        """Get chat history for a user.
        
        Args:
            user_id: User identifier
            limit: Optional limit on number of messages to retrieve
            
        Returns:
            List of message objects
        """
        if user_id not in self.histories:
            return []
        
        history = self.histories[user_id]
        if limit:
            history = history[-limit:]
        
        return history


# Optional MongoDB implementation if available
try:
    from pymongo import MongoClient
    
    class MongoDBChatHistoryRepository(ChatHistoryRepository):
        """MongoDB implementation of the chat history repository."""
        
        def __init__(self, mongo_uri: str, db_name: str, collection_name: str):
            """Initialize the repository.
            
            Args:
                mongo_uri: MongoDB connection URI
                db_name: Database name
                collection_name: Collection name
            """
            self.client = MongoClient(mongo_uri)
            self.db = self.client[db_name]
            self.collection = self.db[collection_name]
        
        def save_message(self, user_id: str, is_user: bool, content: str) -> bool:
            """Save a message to the chat history.
            
            Args:
                user_id: User identifier
                is_user: True if message is from user, False if from assistant
                content: Message content
                
            Returns:
                True if successful, False otherwise
            """
            try:
                self.collection.insert_one({
                    "user_id": user_id,
                    "is_user": is_user,
                    "content": content,
                    "timestamp": datetime.now()
                })
                return True
            except Exception as e:
                logger.error(f"Error saving message to MongoDB: {e}")
                return False
        
        def get_history(self, user_id: str, limit: Optional[int] = None) -> list:
            """Get chat history for a user.
            
            Args:
                user_id: User identifier
                limit: Optional limit on number of messages to retrieve
                
            Returns:
                List of message objects
            """
            try:
                query = {"user_id": user_id}
                cursor = self.collection.find(query).sort("timestamp", 1)
                
                if limit:
                    cursor = cursor.limit(limit)
                
                return list(cursor)
            except Exception as e:
                logger.error(f"Error retrieving messages from MongoDB: {e}")
                return []
    
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False
