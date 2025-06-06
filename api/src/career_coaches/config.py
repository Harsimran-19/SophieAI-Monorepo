from pathlib import Path
from pydantic import Field

from common.config.base_settings import BaseAgentSettings


class CareerCoachSettings(BaseAgentSettings):
    """Settings specific to career coach agents."""

    # --- MongoDB Collections for Career Coaches ---
    MONGO_CAREER_STATE_CHECKPOINT_COLLECTION: str = "career_coach_state_checkpoints"
    MONGO_CAREER_STATE_WRITES_COLLECTION: str = "career_coach_state_writes"
    MONGO_CAREER_LONG_TERM_MEMORY_COLLECTION: str = "career_coach_long_term_memory"

    # --- Career Coach Specific Configuration ---
    CAREER_COACH_PROJECT: str = Field(
        default="career_coaches",
        description="Project name for career coach tracking.",
    )

    # --- Evaluation Dataset Path ---
    CAREER_EVALUATION_DATASET_FILE_PATH: Path = Path("data/career_evaluation_dataset.json")
    CAREER_EXTRACTION_METADATA_FILE_PATH: Path = Path("data/career_extraction_metadata.json")


settings = CareerCoachSettings()
