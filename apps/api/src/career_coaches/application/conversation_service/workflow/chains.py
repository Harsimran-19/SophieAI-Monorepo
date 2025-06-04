from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq

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


def get_career_coach_response_chain(coach_id: str = "career_assessment"):
    """Create a chain for generating career coach responses."""
    model = get_chat_model()
    # Note: No tools binding initially since we're not using RAG
    system_message = get_prompt_by_coach_id(coach_id)

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
