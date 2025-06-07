import uuid
from typing import Any, AsyncGenerator, Union

from langchain_core.messages import AIMessage, AIMessageChunk, HumanMessage
from langgraph.checkpoint.mongodb.aio import AsyncMongoDBSaver
from opik.integrations.langchain import OpikTracer

from career_coaches.config import settings
from .workflow.graph import create_career_coach_workflow_graph
from .workflow.state import CareerCoachState


async def get_response(
    messages: str | list[str] | list[dict[str, Any]],
    user_id: str,
    coach_id: str,
    coach_name: str,
    coach_specialty: str,
    coach_approach: str,
    coach_focus_areas: list[str],
    user_context: str = "",
    session_goals: list[str] = None,
    new_thread: bool = False,
    use_web_tools: bool = False,
    search_tool_name: str = "all",
) -> tuple[str, CareerCoachState]:
    """Run a career coaching conversation through the workflow graph.

    Args:
        messages: Initial message to start the conversation.
        user_id: Unique identifier for the user (for multi-user support).
        coach_id: Unique identifier for the career coach.
        coach_name: Name of the career coach.
        coach_specialty: Coach's specialty area.
        coach_approach: Coach's approach and methodology.
        coach_focus_areas: List of coach's focus areas.
        user_context: Additional context about the user's career situation.
        session_goals: Goals for the coaching session.
        new_thread: Whether to create a new conversation thread.

    Returns:
        tuple[str, CareerCoachState]: A tuple containing:
            - The content of the last message in the conversation.
            - The final state after running the workflow.

    Raises:
        RuntimeError: If there's an error running the conversation workflow.
    """
    if session_goals is None:
        session_goals = []

    graph_builder = create_career_coach_workflow_graph()

    try:
        async with AsyncMongoDBSaver.from_conn_string(
            conn_string=settings.MONGO_URI,
            db_name=settings.MONGO_DB_NAME,
            checkpoint_collection_name=settings.MONGO_CAREER_STATE_CHECKPOINT_COLLECTION,
            writes_collection_name=settings.MONGO_CAREER_STATE_WRITES_COLLECTION,
        ) as checkpointer:
            graph = graph_builder.compile(checkpointer=checkpointer)
            opik_tracer = OpikTracer(graph=graph.get_graph(xray=True))

            # Create thread ID with user_id and coach_id for multi-user support
            thread_id = (
                f"{user_id}_{coach_id}" if not new_thread
                else f"{user_id}_{coach_id}_{uuid.uuid4()}"
            )
            config = {
                "configurable": {"thread_id": thread_id},
                "callbacks": [opik_tracer],
            }

            output_state = await graph.ainvoke(
                input={
                    "messages": __format_messages(messages=messages),
                    "user_id": user_id,
                    "coach_id": coach_id,
                    "coach_name": coach_name,
                    "coach_specialty": coach_specialty,
                    "coach_approach": coach_approach,
                    "coach_focus_areas": coach_focus_areas,
                    "user_context": user_context,
                    "session_goals": session_goals,
                    "use_web_tools": use_web_tools,
                    "search_tool_name": search_tool_name,
                },
                config=config,
            )
        last_message = output_state["messages"][-1]
        return last_message.content, CareerCoachState(**output_state)
    except Exception as e:
        raise RuntimeError(f"Error running career coach conversation workflow: {str(e)}") from e


async def get_streaming_response(
    messages: str | list[str] | list[dict[str, Any]],
    user_id: str,
    coach_id: str,
    coach_name: str,
    coach_specialty: str,
    coach_approach: str,
    coach_focus_areas: list[str],
    user_context: str = "",
    session_goals: list[str] = None,
    new_thread: bool = False,
    use_web_tools: bool = False,
    search_tool_name: str = "all",
) -> AsyncGenerator[str, None]:
    """Run a career coaching conversation with streaming response.

    Args:
        messages: Initial message to start the conversation.
        user_id: Unique identifier for the user.
        coach_id: Unique identifier for the career coach.
        coach_name: Name of the career coach.
        coach_specialty: Coach's specialty area.
        coach_approach: Coach's approach and methodology.
        coach_focus_areas: List of coach's focus areas.
        user_context: Additional context about the user's career situation.
        session_goals: Goals for the coaching session.
        new_thread: Whether to create a new conversation thread.

    Yields:
        Chunks of the response as they become available.

    Raises:
        RuntimeError: If there's an error running the conversation workflow.
    """
    if session_goals is None:
        session_goals = []

    graph_builder = create_career_coach_workflow_graph()

    try:
        async with AsyncMongoDBSaver.from_conn_string(
            conn_string=settings.MONGO_URI,
            db_name=settings.MONGO_DB_NAME,
            checkpoint_collection_name=settings.MONGO_CAREER_STATE_CHECKPOINT_COLLECTION,
            writes_collection_name=settings.MONGO_CAREER_STATE_WRITES_COLLECTION,
        ) as checkpointer:
            graph = graph_builder.compile(checkpointer=checkpointer)
            opik_tracer = OpikTracer(graph=graph.get_graph(xray=True))

            # Create thread ID with user_id and coach_id for multi-user support
            thread_id = (
                f"{user_id}_{coach_id}" if not new_thread
                else f"{user_id}_{coach_id}_{uuid.uuid4()}"
            )
            config = {
                "configurable": {"thread_id": thread_id},
                "callbacks": [opik_tracer],
            }

            async for chunk in graph.astream(
                input={
                    "messages": __format_messages(messages=messages),
                    "user_id": user_id,
                    "coach_id": coach_id,
                    "coach_name": coach_name,
                    "coach_specialty": coach_specialty,
                    "coach_approach": coach_approach,
                    "coach_focus_areas": coach_focus_areas,
                    "user_context": user_context,
                    "session_goals": session_goals,
                    "use_web_tools": use_web_tools,
                    "search_tool_name": search_tool_name,
                },
                config=config,
                stream_mode="messages",
            ):
                if chunk[1]["langgraph_node"] == "conversation_node" and isinstance(
                    chunk[0], AIMessageChunk
                ):
                    yield chunk[0].content

    except Exception as e:
        raise RuntimeError(
            f"Error running streaming career coach conversation workflow: {str(e)}"
        ) from e


def __format_messages(
    messages: Union[str, list[dict[str, Any]]],
) -> list[Union[HumanMessage, AIMessage]]:
    """Convert various message formats to a list of LangChain message objects.

    Args:
        messages: Can be one of:
            - A single string message
            - A list of string messages
            - A list of dictionaries with 'role' and 'content' keys

    Returns:
        List[Union[HumanMessage, AIMessage]]: A list of LangChain message objects
    """

    if isinstance(messages, str):
        return [HumanMessage(content=messages)]

    if isinstance(messages, list):
        if not messages:
            return []

        if (
            isinstance(messages[0], dict)
            and "role" in messages[0]
            and "content" in messages[0]
        ):
            result = []
            for msg in messages:
                if msg["role"] == "user":
                    result.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    result.append(AIMessage(content=msg["content"]))
            return result

        return [HumanMessage(content=message) for message in messages]

    return []
