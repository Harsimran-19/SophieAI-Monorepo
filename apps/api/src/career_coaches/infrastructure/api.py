from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from opik.integrations.langchain import OpikTracer
from pydantic import BaseModel

from career_coaches.infrastructure.history_api import router as history_router

from career_coaches.application.conversation_service.generate_response import (
    get_response,
    get_streaming_response,
)
from career_coaches.application.conversation_service.reset_conversation import (
    reset_conversation_state,
)
from career_coaches.config import settings
from career_coaches.domain.coach_factory import CoachFactory
from common.infrastructure.opik_utils import configure

configure(settings.COMET_API_KEY, settings.CAREER_COACH_PROJECT)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles startup and shutdown events for the Career Coach API."""
    # Startup code (if any) goes here
    yield
    # Shutdown code goes here
    opik_tracer = OpikTracer()
    opik_tracer.flush()


app = FastAPI(
    title="Career Coach API",
    description="API for career coaching agents with multi-user support",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the history API router
app.include_router(history_router, prefix="/history", tags=["history"])


class ChatMessage(BaseModel):
    message: str
    coach_id: str
    user_id: str
    user_context: str = ""
    session_goals: list[str] = []


class ResetMemoryRequest(BaseModel):
    user_id: str = None  # Optional: if provided, reset only for this user


@app.post("/chat")
async def chat(chat_message: ChatMessage):
    """Chat endpoint for career coaching conversations."""
    try:
        coach_factory = CoachFactory()
        coach = coach_factory.get_coach(chat_message.coach_id)

        response, _ = await get_response(
            messages=chat_message.message,
            user_id=chat_message.user_id,
            coach_id=chat_message.coach_id,
            coach_name=coach.name,
            coach_specialty=coach.specialty,
            coach_approach=coach.approach,
            coach_focus_areas=coach.focus_areas,
            user_context=chat_message.user_context,
            session_goals=chat_message.session_goals,
        )
        return {"response": response}
    except Exception as e:
        opik_tracer = OpikTracer()
        opik_tracer.flush()

        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """WebSocket endpoint for streaming career coaching conversations."""
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()

            required_fields = ["message", "coach_id", "user_id"]
            if not all(field in data for field in required_fields):
                await websocket.send_json(
                    {
                        "error": f"Invalid message format. Required fields: {required_fields}"
                    }
                )
                continue

            try:
                coach_factory = CoachFactory()
                coach = coach_factory.get_coach(data["coach_id"])

                # Use streaming response
                response_stream = get_streaming_response(
                    messages=data["message"],
                    user_id=data["user_id"],
                    coach_id=data["coach_id"],
                    coach_name=coach.name,
                    coach_specialty=coach.specialty,
                    coach_approach=coach.approach,
                    coach_focus_areas=coach.focus_areas,
                    user_context=data.get("user_context", ""),
                    session_goals=data.get("session_goals", []),
                )

                # Send initial message to indicate streaming has started
                await websocket.send_json({"streaming": True})

                # Stream each chunk of the response
                full_response = ""
                async for chunk in response_stream:
                    full_response += chunk
                    await websocket.send_json({"chunk": chunk})

                await websocket.send_json(
                    {"response": full_response, "streaming": False}
                )

            except Exception as e:
                opik_tracer = OpikTracer()
                opik_tracer.flush()

                await websocket.send_json({"error": str(e)})

    except WebSocketDisconnect:
        pass


@app.post("/reset-memory")
async def reset_memory(request: ResetMemoryRequest):
    """Resets the conversation state for career coaches.
    
    Can reset for all users or a specific user.

    Raises:
        HTTPException: If there is an error resetting the conversation state.
    Returns:
        dict: A dictionary containing the result of the reset operation.
    """
    try:
        result = await reset_conversation_state(user_id=request.user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/coaches")
async def get_available_coaches():
    """Get list of available career coaches."""
    try:
        coach_factory = CoachFactory()
        available_coaches = coach_factory.get_available_coaches()
        
        coaches_info = []
        for coach_id in available_coaches:
            coach = coach_factory.get_coach(coach_id)
            coaches_info.append({
                "id": coach.id,
                "name": coach.name,
                "specialty": coach.specialty,
                "focus_areas": coach.focus_areas
            })
        
        return {"coaches": coaches_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "career_coaches"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
