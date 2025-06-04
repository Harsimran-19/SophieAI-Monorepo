"""Main router for the material generator module.

This module provides the main router for the material generator API, which can be
imported and included in the main FastAPI application.
"""
from fastapi import APIRouter

from material_generator.infrastructure.api import router as material_generator_router


# Main router for material generator module
router = APIRouter()

# Include the material generator router
router.include_router(material_generator_router)
