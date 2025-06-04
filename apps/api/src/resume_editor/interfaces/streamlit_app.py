"""Streamlit UI for the resume editor application."""

import os
import json
import asyncio
import datetime
from typing import Dict, Any, Optional

import streamlit as st
import httpx
from loguru import logger

# Set page configuration
st.set_page_config(
    page_title="Resume Editor",
    page_icon="📝",
    layout="wide",
    initial_sidebar_state="expanded"
)


# Configuration
class UIConfig:
    """Configuration for the UI."""
    
    def __init__(self):
        """Initialize the configuration."""
        # Default to localhost:8000 for API
        self.api_url = os.environ.get("RESUME_API_URL", "http://localhost:8000/resume-editor")
        
        # Load from config file if specified
        config_path = os.environ.get("RESUME_CONFIG_PATH")
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, "r") as f:
                    config_data = json.load(f)
                
                # Override with values from config file
                if "api_url" in config_data:
                    self.api_url = config_data["api_url"]
            except Exception as e:
                logger.error(f"Error loading UI config from {config_path}: {e}")


# API client
class APIClient:
    """Client for interacting with the Resume Editor API."""
    
    def __init__(self, api_url: str):
        """Initialize the client.
        
        Args:
            api_url: Base URL for the API
        """
        self.api_url = api_url.rstrip("/")  # Remove trailing slash if present
        self.client = httpx.AsyncClient(timeout=30.0)  # 30 second timeout
    
    async def get_resume(self, user_id: str) -> Dict[str, Any]:
        """Get a user's resume.
        
        Args:
            user_id: User identifier
            
        Returns:
            API response
        """
        url = f"{self.api_url}/resume/{user_id}"
        response = await self.client.get(url)
        return response.json()
    
    async def update_resume(self, user_id: str, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a user's resume.
        
        Args:
            user_id: User identifier
            resume_data: Resume data to update
            
        Returns:
            API response
        """
        url = f"{self.api_url}/resume"
        data = {
            "user_id": user_id,
            "resume_data": resume_data
        }
        response = await self.client.post(url, json=data)
        return response.json()
    
    async def init_resume(self, user_id: str, name: str, email: str, title: Optional[str] = None) -> Dict[str, Any]:
        """Initialize a new resume.
        
        Args:
            user_id: User identifier
            name: User's name
            email: User's email
            title: Optional professional title
            
        Returns:
            API response
        """
        url = f"{self.api_url}/resume/init"
        data = {
            "user_id": user_id,
            "name": name,
            "email": email
        }
        
        if title:
            data["title"] = title
            
        response = await self.client.post(url, json=data)
        return response.json()
    
    async def analyze_resume(self, user_id: str, question: Optional[str] = None) -> Dict[str, Any]:
        """Analyze a resume.
        
        Args:
            user_id: User identifier
            question: Optional specific question
            
        Returns:
            API response
        """
        url = f"{self.api_url}/resume/analyze"
        data = {"user_id": user_id}
        
        if question:
            data["question"] = question
            
        response = await self.client.post(url, json=data)
        return response.json()
    
    async def send_message(self, user_id: str, message: str) -> Dict[str, Any]:
        """Send a message to the assistant.
        
        Args:
            user_id: User identifier
            message: User message
            
        Returns:
            API response
        """
        url = f"{self.api_url}/chat"
        data = {
            "user_id": user_id,
            "message": message
        }
        response = await self.client.post(url, json=data)
        return response.json()
    
    async def check_health(self) -> bool:
        """Check if the API is healthy.
        
        Returns:
            True if healthy, False otherwise
        """
        try:
            url = f"{self.api_url}/health"
            response = await self.client.get(url)
            return response.status_code == 200
        except Exception:
            return False


# Helper functions
def format_date(date_str: Optional[str]) -> str:
    """Format a date string for display.
    
    Args:
        date_str: ISO format date string or None
        
    Returns:
        Formatted date string or empty string
    """
    if not date_str:
        return ""
    
    try:
        date_obj = datetime.date.fromisoformat(date_str)
        return date_obj.strftime("%b %Y")
    except (ValueError, TypeError):
        return date_str


def run_async(func, *args, **kwargs):
    """Run an async function in Streamlit.
    
    Args:
        func: Async function to run
        *args: Arguments for the function
        **kwargs: Keyword arguments for the function
        
    Returns:
        Function result
    """
    # Get the current event loop or create a new one
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        # If there's no event loop in the current thread, create a new one
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    # Run the async function and return the result
    # Don't close the loop after execution
    return loop.run_until_complete(func(*args, **kwargs))


# Main application
def main():
    """Main application function."""
    # Load configuration
    config = UIConfig()
    
    # Initialize API client
    api_client = APIClient(config.api_url)
    
    # Check API health
    api_healthy = run_async(api_client.check_health)
    
    # Set up session state
    if "user_id" not in st.session_state:
        st.session_state.user_id = "test_user"  # Default user ID
    
    if "resume_data" not in st.session_state:
        st.session_state.resume_data = None
    
    if "chat_messages" not in st.session_state:
        st.session_state.chat_messages = []
    
    # Sidebar
    with st.sidebar:
        st.title("Resume Editor")
        
        # API status
        if api_healthy:
            st.success("API Connected")
        else:
            st.error("API Unavailable")
        
        # User ID input
        user_id = st.text_input("User ID", value=st.session_state.user_id)
        if user_id != st.session_state.user_id:
            st.session_state.user_id = user_id
            st.session_state.resume_data = None  # Clear resume data when user changes
            st.rerun()
        
        # Resume operations
        st.subheader("Resume Operations")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("Load Resume"):
                with st.spinner("Loading resume..."):
                    response = run_async(api_client.get_resume, st.session_state.user_id)
                    
                    # Safely handle API response which might not have the expected structure
                    if isinstance(response, dict) and response.get("status") == "success":
                        st.session_state.resume_data = response.get("data", {})
                        st.success("Resume loaded")
                    else:
                        error_msg = response.get("message", "Unexpected API response") if isinstance(response, dict) else "Unexpected API response"
                        st.error(error_msg)
                        st.session_state.resume_data = None
        
        with col2:
            if st.button("New Resume"):
                st.session_state.show_init_form = True
    
    # Initialize resume form
    if "show_init_form" in st.session_state and st.session_state.show_init_form:
        with st.form("init_resume_form"):
            st.subheader("Initialize New Resume")
            name = st.text_input("Full Name")
            email = st.text_input("Email")
            title = st.text_input("Professional Title (Optional)")
            
            submit = st.form_submit_button("Create Resume")
            
            if submit:
                if not name or not email:
                    st.error("Name and email are required")
                else:
                    with st.spinner("Creating resume..."):
                        response = run_async(
                            api_client.init_resume, 
                            st.session_state.user_id, 
                            name, 
                            email, 
                            title if title else None
                        )
                        
                        # Safely handle API response which might not have the expected structure
                        if isinstance(response, dict) and response.get("status") == "success":
                            st.session_state.resume_data = response.get("data", {})
                            st.success("Resume created successfully")
                            st.session_state.show_init_form = False
                            st.rerun()
                        else:
                            error_msg = response.get("message", "Unexpected API response") if isinstance(response, dict) else "Unexpected API response"
                            st.error(error_msg)
    
    # Main content
    col1, col2 = st.columns([2, 3])
    
    # Resume view/edit
    with col1:
        st.header("Resume")
        
        if st.session_state.resume_data:
            resume = st.session_state.resume_data
            
            # Personal information
            st.subheader("Personal Information")
            with st.expander("Edit Personal Information", expanded=True):
                name = st.text_input("Name", value=resume.get("name", ""))
                title = st.text_input("Title", value=resume.get("title", ""))
                
                # Contact information
                contact = resume.get("contact", {})
                email = st.text_input("Email", value=contact.get("email", ""))
                phone = st.text_input("Phone", value=contact.get("phone", ""))
                linkedin = st.text_input("LinkedIn", value=contact.get("linkedin", ""))
                github = st.text_input("GitHub", value=contact.get("github", ""))
                website = st.text_input("Website", value=contact.get("website", ""))
                
                # Summary
                summary = st.text_area("Summary", value=resume.get("summary", ""), height=100)
                
                if st.button("Update Personal Information"):
                    updated_resume = dict(resume)
                    updated_resume["name"] = name
                    updated_resume["title"] = title
                    updated_resume["summary"] = summary
                    updated_resume["contact"] = {
                        "email": email,
                        "phone": phone,
                        "linkedin": linkedin,
                        "github": github,
                        "website": website
                    }
                    
                    with st.spinner("Updating resume..."):
                        response = run_async(
                            api_client.update_resume,
                            st.session_state.user_id,
                            updated_resume
                        )
                        
                        # Safely handle API response
                        if isinstance(response, dict) and response.get("status") == "success":
                            st.session_state.resume_data = updated_resume
                            st.success("Personal information updated")
                        else:
                            error_msg = response.get("message", "Unexpected API response") if isinstance(response, dict) else "Unexpected API response"
                            st.error(error_msg)
            
            # Skills
            st.subheader("Skills")
            with st.expander("Edit Skills", expanded=False):
                skills = resume.get("skills", [])
                skill_names = [skill["name"] for skill in skills]
                skill_text = st.text_area("Skills (one per line)", value="\n".join(skill_names), height=100)
                
                if st.button("Update Skills"):
                    skill_list = [line.strip() for line in skill_text.split("\n") if line.strip()]
                    updated_skills = [{"name": skill} for skill in skill_list]
                    
                    updated_resume = dict(resume)
                    updated_resume["skills"] = updated_skills
                    
                    with st.spinner("Updating skills..."):
                        response = run_async(
                            api_client.update_resume,
                            st.session_state.user_id,
                            updated_resume
                        )
                        
                        # Safely handle API response
                        if isinstance(response, dict) and response.get("status") == "success":
                            st.session_state.resume_data = updated_resume
                            st.success("Skills updated")
                        else:
                            error_msg = response.get("message", "Unexpected API response") if isinstance(response, dict) else "Unexpected API response"
                            st.error(error_msg)
            
            # Education
            st.subheader("Education")
            education = resume.get("education", [])
            
            for i, edu in enumerate(education):
                with st.expander(f"{edu.get('institution', 'Education')} - {edu.get('degree', '')}", expanded=False):
                    st.text(f"Field: {edu.get('field_of_study', '')}")
                    st.text(f"Dates: {format_date(edu.get('start_date'))} - {format_date(edu.get('end_date', ''))}")
                    if edu.get('gpa'):
                        st.text(f"GPA: {edu.get('gpa')}")
                    if edu.get('description'):
                        st.text(edu.get('description'))
            
            # Experience
            st.subheader("Experience")
            experience = resume.get("experience", [])
            
            for i, exp in enumerate(experience):
                with st.expander(f"{exp.get('position', 'Position')} at {exp.get('company', 'Company')}", expanded=False):
                    st.text(f"Dates: {format_date(exp.get('start_date'))} - {format_date(exp.get('end_date', ''))}")
                    if exp.get('description'):
                        st.text(exp.get('description'))
                    
                    highlights = exp.get('highlights', [])
                    if highlights:
                        st.write("Highlights:")
                        for highlight in highlights:
                            st.write(f"• {highlight}")
            
            # Projects
            st.subheader("Projects")
            projects = resume.get("projects", [])
            
            for i, proj in enumerate(projects):
                with st.expander(f"{proj.get('name', 'Project')}", expanded=False):
                    st.text(proj.get('description', ''))
                    if proj.get('url'):
                        st.markdown(f"[Project Link]({proj.get('url')})")
                    
                    highlights = proj.get('highlights', [])
                    if highlights:
                        st.write("Highlights:")
                        for highlight in highlights:
                            st.write(f"• {highlight}")
            
            # Languages
            if resume.get("languages"):
                st.subheader("Languages")
                st.write(", ".join(resume.get("languages", [])))
            
            # Certifications
            if resume.get("certifications"):
                st.subheader("Certifications")
                for cert in resume.get("certifications", []):
                    st.write(f"• {cert}")
        else:
            st.info("No resume loaded. Please load or create a resume using the sidebar.")
    
    # Chat interface
    with col2:
        st.header("Resume Assistant")
        
        # Display chat messages
        for message in st.session_state.chat_messages:
            is_user = message.get("is_user", False)
            content = message.get("content", "")
            
            if is_user:
                st.markdown(f"**You:** {content}")
            else:
                st.markdown(f"**Assistant:** {content}")
        
        # Input for new message
        with st.form("chat_form", clear_on_submit=True):
            user_message = st.text_area("Your message:", height=100)
            submitted = st.form_submit_button("Send")
            
            if submitted and user_message:
                # Add user message to chat
                st.session_state.chat_messages.append({
                    "is_user": True,
                    "content": user_message
                })
                
                # Show processing indicator
                with st.spinner("Assistant is thinking..."):
                    # Send message to API
                    response = run_async(
                        api_client.send_message,
                        st.session_state.user_id,
                        user_message
                    )
                    
                    # Add assistant response to chat
                    st.session_state.chat_messages.append({
                        "is_user": False,
                        "content": response.get("response", "I'm sorry, I couldn't process your request.")
                    })
                
                # Reload resume data if it might have changed
                if any(keyword in user_message.lower() for keyword in ["update", "change", "modify", "add", "remove"]):
                    resume_response = run_async(api_client.get_resume, st.session_state.user_id)
                    # Safely handle API response
                    if isinstance(resume_response, dict) and resume_response.get("status") == "success":
                        st.session_state.resume_data = resume_response.get("data", {})
                
                # Rerun to update UI
                st.rerun()
        
        # Quick actions
        st.subheader("Quick Actions")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("Analyze Resume"):
                if not st.session_state.resume_data:
                    st.error("Please load a resume first")
                else:
                    with st.spinner("Analyzing resume..."):
                        response = run_async(api_client.analyze_resume, st.session_state.user_id)
                        
                        # Add analysis to chat
                        st.session_state.chat_messages.append({
                            "is_user": False,
                            "content": response.get("response", "I couldn't analyze the resume.")
                        })
                        
                        st.rerun()
        
        with col2:
            if st.button("Suggest Improvements"):
                if not st.session_state.resume_data:
                    st.error("Please load a resume first")
                else:
                    with st.spinner("Generating suggestions..."):
                        response = run_async(
                            api_client.analyze_resume, 
                            st.session_state.user_id,
                            "What specific improvements would you suggest for this resume?"
                        )
                        
                        # Add suggestions to chat
                        st.session_state.chat_messages.append({
                            "is_user": False,
                            "content": response.get("response", "I couldn't generate suggestions.")
                        })
                        
                        st.rerun()


if __name__ == "__main__":
    main()
