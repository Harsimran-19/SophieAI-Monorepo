from functools import lru_cache

from langgraph.graph import END, START, StateGraph

from .edges import should_summarize_conversation
from .nodes import (
    conversation_node,
    summarize_conversation_node,
    connector_node,
)
from .state import CareerCoachState


@lru_cache(maxsize=1)
def create_career_coach_workflow_graph():
    """Create the career coach workflow graph.
    
    This is a simplified workflow without RAG initially:
    START -> conversation_node -> connector_node -> (conditional) summarize or END
    """
    graph_builder = StateGraph(CareerCoachState)

    # Add all nodes
    graph_builder.add_node("conversation_node", conversation_node)
    graph_builder.add_node("summarize_conversation_node", summarize_conversation_node)
    graph_builder.add_node("connector_node", connector_node)
    
    # Define the simplified flow (no RAG tools initially)
    graph_builder.add_edge(START, "conversation_node")
    graph_builder.add_edge("conversation_node", "connector_node")
    graph_builder.add_conditional_edges("connector_node", should_summarize_conversation)
    graph_builder.add_edge("summarize_conversation_node", END)
    
    return graph_builder


# Compiled without a checkpointer. Used for LangGraph Studio
graph = create_career_coach_workflow_graph().compile()
