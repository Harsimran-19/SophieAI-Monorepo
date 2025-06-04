from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class BaseAgentSettings(BaseSettings):
    """Base settings shared across all agent types."""
    
    model_config = SettingsConfigDict(
        env_file=".env", extra="ignore", env_file_encoding="utf-8"
    )

    # --- GROQ Configuration ---
    GROQ_API_KEY: str
    GROQ_LLM_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_LLM_MODEL_CONTEXT_SUMMARY: str = "llama-3.1-8b-instant"
    
    # --- OpenAI Configuration (Required for evaluation) ---
    OPENAI_API_KEY: str

    # --- MongoDB Configuration ---
    MONGO_URI: str = Field(
        default="mongodb+srv://harsimran1869:Ao123456@cluster0.2qpf3sr.mongodb.net/",
        description="Connection URI for the local MongoDB Atlas instance.",
    )
    MONGO_DB_NAME: str = "ai_agents"

    # --- Comet ML & Opik Configuration ---
    COMET_API_KEY: str | None = Field(
        default=None, description="API key for Comet ML and Opik services."
    )
    COMET_PROJECT: str = Field(
        default="ai_agents_platform",
        description="Project name for Comet ML and Opik tracking.",
    )

    # --- Agents Configuration ---
    TOTAL_MESSAGES_SUMMARY_TRIGGER: int = 30
    TOTAL_MESSAGES_AFTER_SUMMARY: int = 5

    # --- RAG Configuration ---
    RAG_TEXT_EMBEDDING_MODEL_ID: str = "sentence-transformers/all-MiniLM-L6-v2"
    RAG_TEXT_EMBEDDING_MODEL_DIM: int = 384
    RAG_TOP_K: int = 3
    RAG_DEVICE: str = "cpu"
    RAG_CHUNK_SIZE: int = 256
