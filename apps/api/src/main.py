"""
Main API entry point for the Career Coach Agents platform.

This module provides a unified API that combines:
1. Career Coach API
2. Resume Editor API 
3. Job Materials Generator API

All APIs are mounted as sub-applications with their own routes.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the various API modules
from .career_coaches.infrastructure.api import app as career_coach_app
from .resume_editor.interfaces.api import app as resume_editor_app
from .material_generator.infrastructure.api import app as material_generator_app



# Create main FastAPI application
app = FastAPI(
    title="Career Coach Agents Platform API",
    description="Combined API for career coaching, resume editing, and job materials generation",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint for the main API
@app.get("/health")
async def health_check():
    """Health check endpoint for the main API."""
    return {
        "status": "healthy",
        "service": "career_coach_agents_platform",
        "version": "1.0.0"
    }


# Mount all sub-applications
app.mount("/career-coach", career_coach_app)
app.mount("/resume-editor", resume_editor_app)
app.mount("/material-generator", material_generator_app)


# Run the application
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable or use default
    port = int(os.environ.get("API_PORT", 8000))
    
    print(f"Starting Career Coach Agents Platform API on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
