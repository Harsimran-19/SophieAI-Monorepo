from pydantic import BaseModel, Field
from typing import List, Optional


class CareerCoachEvaluationMetrics(BaseModel):
    """Evaluation metrics specific to career coaching effectiveness."""
    
    response_relevance: float = Field(
        description="How relevant the coach's response is to the user's career question"
    )
    actionability: float = Field(
        description="How actionable and practical the advice provided is"
    )
    expertise_demonstration: float = Field(
        description="How well the coach demonstrates domain expertise"
    )
    empathy_and_support: float = Field(
        description="How supportive and empathetic the coach's response is"
    )
    goal_alignment: float = Field(
        description="How well the advice aligns with stated career goals"
    )


class CareerCoachingSession(BaseModel):
    """Represents a career coaching session for evaluation."""
    
    user_id: str = Field(description="Unique identifier for the user")
    coach_id: str = Field(description="Identifier for the career coach")
    session_id: str = Field(description="Unique session identifier")
    user_query: str = Field(description="User's question or request")
    coach_response: str = Field(description="Coach's response")
    user_satisfaction: Optional[float] = Field(
        default=None, description="User satisfaction rating (1-5)"
    )
    session_goals: List[str] = Field(
        default=[], description="Goals set for this coaching session"
    )
    goals_achieved: List[str] = Field(
        default=[], description="Goals achieved during the session"
    )
    follow_up_actions: List[str] = Field(
        default=[], description="Action items identified for the user"
    )


class CareerCoachEvaluationDataset(BaseModel):
    """Dataset for evaluating career coach performance."""
    
    coach_id: str = Field(description="Career coach being evaluated")
    user_id: str = Field(description="User in the conversation")
    messages: List[dict] = Field(description="Conversation messages")
    expected_outcomes: List[str] = Field(
        description="Expected coaching outcomes"
    )
    coaching_context: str = Field(
        description="Context about the user's career situation"
    )
