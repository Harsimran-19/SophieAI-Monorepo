from typing import List
from pydantic import BaseModel, Field


class Coach(BaseModel):
    """A class representing a career coach agent with specialized expertise.

    Args:
        id (str): Unique identifier for the career coach.
        name (str): Name of the career coach.
        specialty (str): The coach's area of expertise and specialization.
        approach (str): Description of the coach's methodology and coaching style.
        focus_areas (List[str]): Key areas of focus and expertise.
    """

    id: str = Field(description="Unique identifier for the career coach")
    name: str = Field(description="Name of the career coach")
    specialty: str = Field(description="The coach's area of expertise and specialization")
    approach: str = Field(description="Description of the coach's methodology and coaching style")
    focus_areas: List[str] = Field(description="Key areas of focus and expertise")

    def __str__(self) -> str:
        return f"Coach(id={self.id}, name={self.name}, specialty={self.specialty}, approach={self.approach}, focus_areas={self.focus_areas})"
