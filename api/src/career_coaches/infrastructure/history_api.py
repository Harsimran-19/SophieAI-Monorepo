from typing import List, Optional, Dict
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from pymongo import MongoClient
from bson.objectid import ObjectId

from career_coaches.config import settings
from career_coaches.domain.coach_factory import CoachFactory

router = APIRouter()


class ChatMessage(BaseModel):
    """Individual chat message in a conversation."""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime


class ChatSession(BaseModel):
    """Complete chat session between a user and coach."""
    session_id: str
    user_id: str
    coach_id: str
    coach_name: str
    start_time: datetime
    end_time: Optional[datetime] = None
    messages: List[ChatMessage]
    

class UserInfo(BaseModel):
    """User information with first seen date."""
    user_id: str
    first_seen: datetime
    coach_sessions: Dict[str, str] = Field(default_factory=dict)  # coach_id -> coach_name


class Coach(BaseModel):
    """Coach information."""
    id: str
    name: str
    specialty: str
    focus_areas: List[str]


@router.get("/users", response_model=List[UserInfo])
async def get_users():
    """Get all users with their first seen date and available coaches."""
    try:
        client = MongoClient(settings.MONGO_URI)
        db = client[settings.MONGO_DB_NAME]
        writes_collection = db[settings.MONGO_CAREER_STATE_WRITES_COLLECTION]
        
        # Get all unique users from thread_id field directly
        # This is a more direct approach since thread_ids are formatted as "user_id_coach_id"
        all_threads = writes_collection.distinct("thread_id")
        
        # Extract unique user IDs from thread IDs
        users_dict = {}
        for thread in all_threads:
            if thread and "_" in thread:
                parts = thread.split("_")
                if len(parts) >= 2:
                    user_id = parts[0]
                    coach_id = parts[1]
                    
                    # Get the earliest record for this user
                    if user_id not in users_dict:
                        # Find the earliest record for this thread
                        earliest = writes_collection.find({"thread_id": thread}).sort("timestamp", 1).limit(1)
                        earliest_doc = next(earliest, None)
                        
                        if earliest_doc:
                            timestamp = earliest_doc.get("timestamp", "")
                            state = earliest_doc.get("state", {})
                            coach_name = state.get("coach_name", f"Coach {coach_id}")
                            
                            users_dict[user_id] = {
                                "user_id": user_id,
                                "first_seen": timestamp,
                                "coach_sessions": {coach_id: coach_name}
                            }
                        else:
                            # Fallback if no document is found
                            users_dict[user_id] = {
                                "user_id": user_id,
                                "first_seen": datetime.now(),
                                "coach_sessions": {coach_id: f"Coach {coach_id}"}
                            }
                    else:
                        # Add this coach to existing user
                        state = writes_collection.find_one(
                            {"thread_id": thread, "state.coach_name": {"$exists": True}},
                            {"state.coach_name": 1}
                        )
                        coach_name = state.get("state", {}).get("coach_name", f"Coach {coach_id}") if state else f"Coach {coach_id}"
                        users_dict[user_id]["coach_sessions"][coach_id] = coach_name
        
        # Convert to list of UserInfo objects
        user_results = list(users_dict.values())
        
        # Format the results
        users = []
        for user in user_results:
            # Create a dictionary of coach_id -> coach_name
            coach_sessions = {}
            if "coach_ids" in user and "coach_names" in user:
                for i, coach_id in enumerate(user.get("coach_ids", [])):
                    if i < len(user.get("coach_names", [])):
                        coach_sessions[coach_id] = user["coach_names"][i]
                    else:
                        coach_sessions[coach_id] = f"Coach {coach_id}"
            
            # Convert timestamp string to datetime
            first_seen = user.get("first_seen")
            if isinstance(first_seen, str):
                first_seen = datetime.fromisoformat(first_seen.replace('Z', '+00:00'))
            
            users.append(UserInfo(
                user_id=user.get("user_id"),
                first_seen=first_seen,
                coach_sessions=coach_sessions
            ))
            
        return sorted(users, key=lambda x: x.first_seen, reverse=True)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")
    finally:
        client.close()


@router.get("/sessions/{user_id}", response_model=List[ChatSession])
async def get_user_sessions(user_id: str, coach_id: Optional[str] = None):
    """Get all chat sessions for a specific user, optionally filtered by coach."""
    try:
        client = MongoClient(settings.MONGO_URI)
        db = client[settings.MONGO_DB_NAME]
        writes_collection = db[settings.MONGO_CAREER_STATE_WRITES_COLLECTION]
        
        # Construct the query
        query = {
            "state.user_id": user_id
        }
        
        if coach_id:
            query["state.coach_id"] = coach_id
        
        # Find all writes for this user/coach
        writes = writes_collection.find(query).sort("timestamp", 1)
        
        # Group messages by thread_id (session)
        sessions = {}
        for write in writes:
            thread_id = write.get("thread_id", "")
            if not thread_id:
                continue
                
            # Get timestamp
            timestamp = write.get("timestamp", "")
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            # Process the state to extract messages
            if "state" in write and "messages" in write["state"]:
                state = write["state"]
                user_id = state.get("user_id", "")
                coach_id = state.get("coach_id", "")
                coach_name = state.get("coach_name", f"Coach {coach_id}")
                
                # Initialize session if new
                if thread_id not in sessions:
                    sessions[thread_id] = {
                        "session_id": thread_id,
                        "user_id": user_id,
                        "coach_id": coach_id,
                        "coach_name": coach_name,
                        "start_time": timestamp,
                        "end_time": timestamp,
                        "messages": []
                    }
                
                # Update end time (always the latest timestamp)
                if timestamp > sessions[thread_id]["end_time"]:
                    sessions[thread_id]["end_time"] = timestamp
                
                # Process messages
                messages = []
                for msg in state.get("messages", []):
                    if msg.get("type") in ["human", "ai"]:
                        messages.append({
                            "role": "user" if msg.get("type") == "human" else "assistant",
                            "content": msg.get("content", ""),
                            "timestamp": timestamp
                        })
                
                # Add any new messages (avoid duplicates)
                existing_contents = [m["content"] for m in sessions[thread_id]["messages"]]
                for msg in messages:
                    if msg["content"] not in existing_contents:
                        sessions[thread_id]["messages"].append(msg)
        
        # Convert to list of ChatSession objects
        result = []
        for session_data in sessions.values():
            # Sort messages by timestamp
            sorted_messages = sorted(session_data["messages"], key=lambda x: x["timestamp"])
            
            # Create ChatSession object
            session = ChatSession(
                session_id=session_data["session_id"],
                user_id=session_data["user_id"],
                coach_id=session_data["coach_id"],
                coach_name=session_data["coach_name"],
                start_time=session_data["start_time"],
                end_time=session_data["end_time"],
                messages=[ChatMessage(
                    role=msg["role"],
                    content=msg["content"],
                    timestamp=msg["timestamp"]
                ) for msg in sorted_messages]
            )
            result.append(session)
        
        # Sort sessions by start time (newest first)
        result.sort(key=lambda x: x.start_time, reverse=True)
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat sessions: {str(e)}")
    finally:
        client.close()


@router.get("/coaches", response_model=List[Coach])
async def get_coaches():
    """Get all available coaches."""
    try:
        coach_factory = CoachFactory()
        available_coaches = coach_factory.get_available_coaches()
        
        coaches_info = []
        for coach_id in available_coaches:
            coach = coach_factory.get_coach(coach_id)
            coaches_info.append(Coach(
                id=coach.id,
                name=coach.name,
                specialty=coach.specialty,
                focus_areas=coach.focus_areas
            ))
        
        return coaches_info
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving coaches: {str(e)}")