"""Domain entities for cover letter generation."""
from pydantic import BaseModel, Field


class CoverLetter(BaseModel):
    """Cover letter entity representing a generated cover letter.
    
    Args:
        job_description (str): The job description used to generate the cover letter.
        user_name (str): Name of the user for whom the cover letter is generated.
        content (str): The generated cover letter content.
    """
    
    job_description: str = Field(description="Job description used to generate the cover letter")
    user_name: str = Field(description="Name of the user for whom the cover letter is generated")
    content: str = Field(default="", description="Generated cover letter content")
    
    def __str__(self) -> str:
        return f"CoverLetter(user_name={self.user_name}, content_length={len(self.content)})"
