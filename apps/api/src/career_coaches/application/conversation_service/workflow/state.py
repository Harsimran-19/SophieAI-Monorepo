from langgraph.graph import MessagesState


class CareerCoachState(MessagesState):
    """State class for the Career Coach LangGraph workflow.

    It keeps track of the information necessary to maintain a coherent
    coaching conversation between the Career Coach and the user, with multi-user support.

    Attributes:
        user_id (str): Unique identifier for the user (for multi-user support).
        coach_id (str): Unique identifier for the career coach type.
        coach_name (str): The name of the career coach.
        coach_specialty (str): The specialty area of the career coach.
        coach_approach (str): The coaching approach and methodology.
        coach_focus_areas (str): The key focus areas of the coach.
        summary (str): A summary of the conversation. This is used to reduce token usage.
        session_goals (list): Goals set for the current coaching session.
        user_context (str): Additional context about the user's career situation.
    """

    user_id: str
    coach_id: str
    coach_name: str
    coach_specialty: str
    coach_approach: str
    coach_focus_areas: str
    summary: str
    session_goals: list
    user_context: str


def state_to_str(state: CareerCoachState) -> str:
    """Convert CareerCoachState to string representation for logging/debugging."""
    if "summary" in state and bool(state["summary"]):
        conversation = state["summary"]
    elif "messages" in state and bool(state["messages"]):
        conversation = state["messages"]
    else:
        conversation = ""

    return f"""
CareerCoachState(
    user_id={state["user_id"]},
    coach_id={state["coach_id"]},
    coach_name={state["coach_name"]},
    coach_specialty={state["coach_specialty"]},
    coach_approach={state["coach_approach"]},
    coach_focus_areas={state["coach_focus_areas"]},
    session_goals={state.get("session_goals", [])},
    conversation={conversation}
)
    """
