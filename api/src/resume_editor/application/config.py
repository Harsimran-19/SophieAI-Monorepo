"""Configuration for the resume editor application."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class ApplicationConfig(BaseSettings):
    """Configuration for the resume editor application."""
    
    model_config = SettingsConfigDict(env_prefix="RESUME_AGENT_")
    
    # LLM configuration
    groq_api_key: str = "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"
    model_name: str = "llama-3.3-70b-versatile"
    temperature: float = 0.3
    
    # MongoDB configuration for chat history (optional)
    mongodb_uri: str = "mongodb+srv://resumeuser:resumepassword@resume-mongodb.mongodb.net/"
    mongodb_db_name: str = "resume_copilot"
    chat_history_collection: str = "chat_histories"
    checkpoints_collection: str = "checkpoints"
    
    # Resume data storage
    resume_data_path: str = "./data"
    
    @property
    def absolute_data_path(self) -> str:
        """Get the absolute path to the resume data directory."""
        path = self.resume_data_path
        if not os.path.isabs(path):
            path = os.path.abspath(path)
        return path
