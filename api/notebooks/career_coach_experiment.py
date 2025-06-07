"""
Career Coach Experiments Helper Module

This module provides functions to simplify experiments with the career coach agents.
Import this in your notebook to easily interact with career coaches.
"""

import asyncio
import os
import sys
import uuid
from typing import List, Dict, Any, Optional, Tuple, AsyncGenerator

# Add src directory to path to allow imports
sys.path.insert(0, os.path.abspath('../src'))

# Import career coach functionality
from career_coaches.application.conversation_service.generate_response import (
    get_response, 
    get_streaming_response
)
from career_coaches.application.conversation_service.workflow.state import CareerCoachState
from career_coaches.config import settings

class CareerCoachExperiment:
    """Helper class for experimenting with career coaches in notebooks."""
    
    def __init__(
        self, 
        user_id: str = None,
        coach_id: str = None,
        coach_name: str = "Career Coach",
        coach_specialty: str = "Career development and guidance",
        coach_approach: str = "Supportive and action-oriented approach that combines goal-setting with practical advice",
        coach_focus_areas: List[str] = None,
        user_context: str = "",
        session_goals: List[str] = None,
    ):
        """
        Initialize a career coach experiment.
        
        Args:
            user_id: Unique user identifier (defaults to random UUID if not provided)
            coach_id: Unique coach identifier (defaults to random UUID if not provided)
            coach_name: Name of the coach
            coach_specialty: Area of expertise for the coach
            coach_approach: Coaching methodology and approach
            coach_focus_areas: Specific areas the coach specializes in
            user_context: Background information about the user's career situation
            session_goals: Specific goals for the coaching session
        """
        self.user_id = user_id or f"user_{uuid.uuid4()}"
        self.coach_id = coach_id or f"coach_{uuid.uuid4()}"
        self.coach_name = coach_name
        self.coach_specialty = coach_specialty
        self.coach_approach = coach_approach
        self.coach_focus_areas = coach_focus_areas or ["Career transitions", "Interview preparation", "Resume building"]
        self.user_context = user_context
        self.session_goals = session_goals or []
        self.conversation_history = []
        self.last_state = None
    
    async def get_coach_response(self, message: str, new_thread: bool = False) -> str:
        """
        Get a response from the career coach.
        
        Args:
            message: The message to send to the coach
            new_thread: Whether to start a new conversation thread
            
        Returns:
            The coach's response
        """
        # Add user message to conversation history
        if isinstance(message, str):
            self.conversation_history.append({"role": "user", "content": message})
        
        # Get response from career coach
        response, state = await get_response(
            messages=self.conversation_history,
            user_id=self.user_id,
            coach_id=self.coach_id,
            coach_name=self.coach_name,
            coach_specialty=self.coach_specialty,
            coach_approach=self.coach_approach,
            coach_focus_areas=self.coach_focus_areas,
            user_context=self.user_context,
            session_goals=self.session_goals,
            new_thread=new_thread
        )
        
        # Save state and add coach response to history
        self.last_state = state
        self.conversation_history.append({"role": "assistant", "content": response})
        
        return response
    
    def ask_coach(self, message: str, new_thread: bool = False) -> str:
        """
        Synchronous wrapper for getting a coach response.
        
        Args:
            message: The message to send to the coach
            new_thread: Whether to start a new conversation thread
            
        Returns:
            The coach's response
        """
        try:
            # Get the current event loop if one exists
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # We're in a notebook or similar environment with a running loop
                import nest_asyncio
                nest_asyncio.apply()
                return loop.run_until_complete(self.get_coach_response(message, new_thread))
            else:
                # Standard case - no event loop running yet
                return asyncio.run(self.get_coach_response(message, new_thread))
        except RuntimeError:
            # Fallback if there's an issue with the event loop
            import nest_asyncio
            nest_asyncio.apply()
            loop = asyncio.get_event_loop()
            return loop.run_until_complete(self.get_coach_response(message, new_thread))
    
    async def get_streaming_coach_response(self, message: str, new_thread: bool = False):
        """
        Get a streaming response from the career coach.
        
        Args:
            message: The message to send to the coach
            new_thread: Whether to start a new conversation thread
            
        Returns:
            An async generator yielding chunks of the response
        """
        # Add user message to conversation history
        if isinstance(message, str):
            self.conversation_history.append({"role": "user", "content": message})
        
        # Collect the full response for history
        full_response = ""
        
        # Stream response from career coach
        async for chunk in get_streaming_response(
            messages=self.conversation_history,
            user_id=self.user_id,
            coach_id=self.coach_id,
            coach_name=self.coach_name,
            coach_specialty=self.coach_specialty,
            coach_approach=self.coach_approach,
            coach_focus_areas=self.coach_focus_areas,
            user_context=self.user_context,
            session_goals=self.session_goals,
            new_thread=new_thread
        ):
            full_response += chunk
            yield chunk
        
        # Add coach response to history
        self.conversation_history.append({"role": "assistant", "content": full_response})
    
    def reset_conversation(self):
        """Reset the conversation history."""
        self.conversation_history = []
        self.last_state = None
    
    def set_coach_properties(self, **kwargs):
        """
        Update coach properties.
        
        Example:
            coach.set_coach_properties(
                coach_name="Jane Doe",
                coach_specialty="Tech careers"
            )
        """
        valid_props = [
            "coach_name", "coach_specialty", "coach_approach", 
            "coach_focus_areas", "user_context", "session_goals"
        ]
        
        for prop, value in kwargs.items():
            if prop in valid_props and hasattr(self, prop):
                setattr(self, prop, value)

# Example user contexts for testing
EXAMPLE_USER_CONTEXTS = {
    "new_graduate": """
        Recent computer science graduate with a 3.5 GPA from State University. 
        Completed internship at a small tech startup and looking for entry-level software developer roles.
        Have basic knowledge of Python, Java, and web development.
        No full-time professional experience yet but eager to learn and grow.
    """,
    
    "career_changer": """
        Former elementary school teacher with 8 years of experience.
        Recently completed a 6-month coding bootcamp focusing on full-stack development.
        Looking to transition to a junior developer role.
        Strong soft skills from teaching background including communication, organization, and teamwork.
        Concerned about lack of industry experience compared to younger candidates.
    """,
    
    "mid_career_professional": """
        Software developer with 5 years of experience at a mid-size financial services company.
        Specialized in backend development using Java and Spring.
        Looking to move into a senior role with more leadership responsibilities.
        Interested in fintech or healthtech sectors for next career move.
        Would like advice on negotiating salary and benefits for senior positions.
    """
}

# Function to print streaming output in notebook cells
def display_streaming_response(generator):
    """
    Helper function to display streaming responses in notebook cells.
    
    Args:
        generator: Async generator from get_streaming_coach_response
    """
    import asyncio
    from IPython.display import display, HTML, clear_output
    import time
    
    async def collect_and_display():
        full_response = ""
        try:
            async for chunk in generator:
                full_response += chunk
                clear_output(wait=True)
                display(HTML(f"<p>{full_response.replace(chr(10), '<br>')}</p>"))
                time.sleep(0.01)  # Small delay for smoother display
        except Exception as e:
            print(f"Error during streaming: {e}")
    
    asyncio.run(collect_and_display())
