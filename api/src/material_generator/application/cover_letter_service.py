"""Service for generating cover letters."""
from typing import Dict, Any

from langchain.prompts import ChatPromptTemplate
from langchain.schema import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from material_generator.domain.cover_letter import CoverLetter
from material_generator.domain.prompts import COVER_LETTER_SYSTEM_PROMPT, COVER_LETTER_USER_PROMPT
from common.config.base_settings import BaseAgentSettings

settings = BaseAgentSettings()


async def generate_cover_letter(job_description: str, user_name: str) -> CoverLetter:
    """Generate a cover letter based on job description and user name.
    
    Args:
        job_description (str): The job description used to generate the cover letter.
        user_name (str): Name of the user for whom the cover letter is generated.
        
    Returns:
        CoverLetter: A cover letter entity with the generated content.
    """
    # Create a cover letter entity
    cover_letter = CoverLetter(
        job_description=job_description,
        user_name=user_name
    )
    
    # Format the prompt with user inputs
    formatted_prompt = COVER_LETTER_USER_PROMPT.format(
        job_description=job_description,
        user_name=user_name
    )
    
    # Initialize the language model
    llm = ChatGroq(
        model_name=settings.GROQ_LLM_MODEL,
        temperature=0.7,
        api_key=settings.GROQ_API_KEY
    )
    
    # Create messages for the chat model
    messages = [
        SystemMessage(content=COVER_LETTER_SYSTEM_PROMPT),
        HumanMessage(content=formatted_prompt)
    ]
    
    # Generate the cover letter content
    try:
        response = await llm.agenerate([messages])
        generated_content = response.generations[0][0].text
        
        # Update the cover letter entity with the generated content
        cover_letter.content = generated_content
        return cover_letter
    except Exception as e:
        raise Exception(f"Failed to generate cover letter: {str(e)}")
