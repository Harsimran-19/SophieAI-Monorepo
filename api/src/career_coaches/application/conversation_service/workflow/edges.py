from langgraph.graph import END

from career_coaches.config import settings
from .state import CareerCoachState


def should_summarize_conversation(state: CareerCoachState) -> str:
    """Determine if the conversation should be summarized based on message count.
    
    Args:
        state: Current conversation state
        
    Returns:
        str: Next node to execute ("summarize_conversation_node" or END)
    """
    messages = state.get("messages", [])
    
    if len(messages) >= settings.TOTAL_MESSAGES_SUMMARY_TRIGGER:
        return "summarize_conversation_node"
    
    return END
