# Base exceptions for all agent types

class AgentNotFound(Exception):
    """Base exception raised when an agent is not found."""

    def __init__(self, agent_id: str, agent_type: str = "agent"):
        self.message = f"{agent_type.title()} with ID '{agent_id}' not found."
        super().__init__(self.message)


class AgentNameNotFound(Exception):
    """Exception raised when an agent's name is not found."""

    def __init__(self, agent_id: str, agent_type: str = "agent"):
        self.message = f"{agent_type.title()} name for {agent_id} not found."
        super().__init__(self.message)


class AgentConfigurationNotFound(Exception):
    """Exception raised when an agent's configuration is not found."""

    def __init__(self, agent_id: str, config_type: str, agent_type: str = "agent"):
        self.message = f"{agent_type.title()} {config_type} for {agent_id} not found."
        super().__init__(self.message)


# Philosopher-specific exceptions
class PhilosopherNameNotFound(AgentNameNotFound):
    """Exception raised when a philosopher's name is not found."""

    def __init__(self, philosopher_id: str):
        super().__init__(philosopher_id, "philosopher")


class PhilosopherPerspectiveNotFound(AgentConfigurationNotFound):
    """Exception raised when a philosopher's perspective is not found."""

    def __init__(self, philosopher_id: str):
        super().__init__(philosopher_id, "perspective", "philosopher")


class PhilosopherStyleNotFound(AgentConfigurationNotFound):
    """Exception raised when a philosopher's style is not found."""

    def __init__(self, philosopher_id: str):
        super().__init__(philosopher_id, "style", "philosopher")


class PhilosopherContextNotFound(AgentConfigurationNotFound):
    """Exception raised when a philosopher's context is not found."""

    def __init__(self, philosopher_id: str):
        super().__init__(philosopher_id, "context", "philosopher")


# Career coach-specific exceptions
class CoachNameNotFound(AgentNameNotFound):
    """Exception raised when a career coach's name is not found."""

    def __init__(self, coach_id: str):
        super().__init__(coach_id, "career coach")


class CoachSpecialtyNotFound(AgentConfigurationNotFound):
    """Exception raised when a career coach's specialty is not found."""

    def __init__(self, coach_id: str):
        super().__init__(coach_id, "specialty", "career coach")


class CoachApproachNotFound(AgentConfigurationNotFound):
    """Exception raised when a career coach's approach is not found."""

    def __init__(self, coach_id: str):
        super().__init__(coach_id, "approach", "career coach")


class CoachFocusAreasNotFound(AgentConfigurationNotFound):
    """Exception raised when a career coach's focus areas are not found."""

    def __init__(self, coach_id: str):
        super().__init__(coach_id, "focus areas", "career coach")
