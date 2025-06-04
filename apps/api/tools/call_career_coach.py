import asyncio
from functools import wraps

import click

from career_coaches.application.conversation_service.generate_response import (
    get_streaming_response,
)
from career_coaches.domain.coach_factory import CoachFactory


def async_command(f):
    """Decorator to run an async click command."""

    @wraps(f)
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))

    return wrapper


@click.command()
@click.option(
    "--coach-id",
    type=str,
    required=True,
    help="ID of the career coach to call.",
)
@click.option(
    "--user-id",
    type=str,
    required=True,
    help="ID of the user for multi-user support.",
)
@click.option(
    "--query",
    type=str,
    required=True,
    help="Query to call the career coach with.",
)
@click.option(
    "--user-context",
    type=str,
    default="",
    help="Additional context about the user's career situation.",
)
@async_command
async def main(coach_id: str, user_id: str, query: str, user_context: str) -> None:
    """CLI command to query a career coach.

    Args:
        coach_id: ID of the career coach to call.
        user_id: ID of the user for multi-user support.
        query: Query to call the career coach with.
        user_context: Additional context about the user's career situation.
    """

    coach_factory = CoachFactory()
    coach = coach_factory.get_coach(coach_id)

    print(
        f"\033[32mCalling career coach with coach_id: `{coach_id}`, user_id: `{user_id}`, and query: `{query}`\033[0m"
    )
    print(f"\033[32mCoach: {coach.name} - {coach.specialty}\033[0m")
    print("\033[32mResponse:\033[0m")
    print("\033[32m--------------------------------\033[0m")
    
    async for chunk in get_streaming_response(
        messages=query,
        user_id=user_id,
        coach_id=coach_id,
        coach_name=coach.name,
        coach_specialty=coach.specialty,
        coach_approach=coach.approach,
        coach_focus_areas=coach.focus_areas,
        user_context=user_context,
    ):
        print(f"\033[32m{chunk}\033[0m", end="", flush=True)
    print("\n\033[32m--------------------------------\033[0m")


if __name__ == "__main__":
    main()
