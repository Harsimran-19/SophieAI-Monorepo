"""Domain models for the resume editor."""

from datetime import date
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class Education(BaseModel):
    """Education section of the resume."""

    institution: str
    degree: str
    field_of_study: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    gpa: Optional[float] = None


class Experience(BaseModel):
    """Work experience section of the resume."""

    company: str
    position: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None
    highlights: Optional[List[str]] = Field(default_factory=list)


class Skill(BaseModel):
    """Skill item in the resume."""

    name: str
    level: Optional[str] = None


class Project(BaseModel):
    """Project section of the resume."""

    name: str
    description: str
    url: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    highlights: Optional[List[str]] = Field(default_factory=list)


class Contact(BaseModel):
    """Contact information section of the resume."""

    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None


class Resume(BaseModel):
    """Complete resume model."""

    name: str
    title: Optional[str] = None
    summary: Optional[str] = None
    contact: Contact
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    skills: List[Skill] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    languages: Optional[List[str]] = Field(default_factory=list)
    certifications: Optional[List[str]] = Field(default_factory=list)
    custom_sections: Optional[Dict[str, List[str]]] = Field(default_factory=dict)
