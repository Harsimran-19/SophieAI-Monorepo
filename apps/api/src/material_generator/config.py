from pydantic import Field

from common.config.base_settings import BaseAgentSettings


class MaterialGeneratorSettings(BaseAgentSettings):
    """Settings specific to material generator service."""

    # --- Material Generator Specific Configuration ---
    MATERIAL_GENERATOR_PROJECT: str = Field(
        default="material_generator",
        description="Project name for material generator tracking.",
    )


settings = MaterialGeneratorSettings()
