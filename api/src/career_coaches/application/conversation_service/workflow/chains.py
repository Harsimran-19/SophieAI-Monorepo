from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from langchain.agents import AgentExecutor, create_openai_tools_agent

from career_coaches.config import settings
from career_coaches.domain.prompts import (
    CAREER_ASSESSMENT_PROMPT,
    RESUME_BUILDER_PROMPT,
    LINKEDIN_OPTIMIZER_PROMPT,
    NETWORKING_STRATEGY_PROMPT,
)
from common.domain.prompts import (
    CONTEXT_SUMMARY_PROMPT,
    EXTEND_SUMMARY_PROMPT,
    SUMMARY_PROMPT,
)

# Import the web search tools
from career_coaches.application.conversation_service.workflow.tools import tools as web_tools


def get_chat_model(temperature: float = 0.7, model_name: str = settings.GROQ_LLM_MODEL) -> ChatGroq:
    """Get a configured ChatGroq model instance."""
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model_name=model_name,
        temperature=temperature,
    )


def get_prompt_by_coach_id(coach_id: str):
    """Get the appropriate prompt based on coach ID."""
    prompt_mapping = {
        "career_assessment": CAREER_ASSESSMENT_PROMPT,
        "resume_builder": RESUME_BUILDER_PROMPT,
        "linkedin_optimizer": LINKEDIN_OPTIMIZER_PROMPT,
        "networking_strategy": NETWORKING_STRATEGY_PROMPT,
    }

    return prompt_mapping.get(coach_id.lower(), CAREER_ASSESSMENT_PROMPT)


def get_career_coach_response_chain(coach_id: str = "career_assessment", use_web_tools: bool = False):
    """Create a chain for generating career coach responses.
    
    Args:
        coach_id: The type of coach to use
        use_web_tools: Whether to enable web search capabilities
        
    Returns:
        A chain that can be invoked with messages to get responses
    """
    model = get_chat_model()
    system_message = get_prompt_by_coach_id(coach_id)
    
    if use_web_tools and web_tools:
        # Add web search instructions to the prompt
        web_tools_instruction = """
        
        You now have access to real-time web search tools. Use them when you need current information about:
        - Job market trends and statistics
        - Industry-specific developments
        - Company information
        - Current in-demand skills
        - Recent changes in career fields
        
        When using search tools, form concise, specific queries to get the most relevant results.
        After getting search results, integrate that information naturally into your response.
        Always attribute information from web searches by mentioning "According to recent information..." 
        or similar phrases.
        
        Only use web search when truly necessary - for general career advice or timeless information,
        rely on your existing knowledge.
        """
        system_prompt = system_message.prompt + web_tools_instruction
        
        # Create an agent with web search tools
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                MessagesPlaceholder(variable_name="messages"),
            ],
            template_format="jinja2",
        )
        
        # Create the agent with search tools
        agent = create_openai_tools_agent(model, web_tools, prompt)
        return AgentExecutor(agent=agent, tools=web_tools, handle_parsing_errors=True)
    else:
        # Regular career coach without web tools
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_message.prompt),
                MessagesPlaceholder(variable_name="messages"),
            ],
            template_format="jinja2",
        )
        
        return prompt | model


def get_conversation_summary_chain(summary: str = ""):
    """Create a chain for summarizing conversations."""
    model = get_chat_model(model_name=settings.GROQ_LLM_MODEL_CONTEXT_SUMMARY)

    summary_message = EXTEND_SUMMARY_PROMPT if summary else SUMMARY_PROMPT

    prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="messages"),
            ("human", summary_message.prompt),
        ],
        template_format="jinja2",
    )

    return prompt | model


def get_context_summary_chain():
    """Create a chain for summarizing context information."""
    model = get_chat_model(model_name=settings.GROQ_LLM_MODEL_CONTEXT_SUMMARY)
    prompt = ChatPromptTemplate.from_messages(
        [
            ("human", CONTEXT_SUMMARY_PROMPT.prompt),
        ],
        template_format="jinja2",
    )

    return prompt | model


def get_web_enabled_career_coach_chain(coach_id: str = "career_assessment"):
    """Create a chain for a career coach with web search capabilities.
    
    This is a convenience function that always enables web tools.
    
    Args:
        coach_id: The type of coach to use
        
    Returns:
        A chain with web search capabilities
    """
    return get_career_coach_response_chain(coach_id=coach_id, use_web_tools=True)
