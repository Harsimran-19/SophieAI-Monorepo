from langchain_core.messages import RemoveMessage
from langchain_core.runnables import RunnableConfig

from career_coaches.config import settings
from .chains import (
    get_context_summary_chain,
    get_conversation_summary_chain,
    get_career_coach_response_chain,
)
from .state import CareerCoachState


async def conversation_node(state: CareerCoachState, config: RunnableConfig):
    """Main conversation node that generates career coach responses."""
    summary = state.get("summary", "")
    coach_id = state.get("coach_id", "career_assessment")
    conversation_chain = get_career_coach_response_chain(coach_id)

    response = await conversation_chain.ainvoke(
        {
            "messages": state["messages"],
            "summary": summary,
        },
        config,
    )

    return {"messages": response}


async def summarize_conversation_node(state: CareerCoachState):
    """Node that summarizes the conversation when it gets too long."""
    summary = state.get("summary", "")
    summary_chain = get_conversation_summary_chain(summary)

    response = await summary_chain.ainvoke(
        {
            "messages": state["messages"],
            "agent_name": state["coach_name"],  # Using agent_name for compatibility with shared prompts
            "summary": summary,
        }
    )

    # Remove old messages, keeping only the most recent ones
    delete_messages = [
        RemoveMessage(id=m.id)
        for m in state["messages"][: -settings.TOTAL_MESSAGES_AFTER_SUMMARY]
    ]
    return {"summary": response.content, "messages": delete_messages}


async def connector_node(state: CareerCoachState):
    """Connector node for workflow transitions."""
    return {}
