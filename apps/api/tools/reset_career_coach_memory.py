import asyncio
from functools import wraps

import click

from career_coaches.application.conversation_service.reset_conversation import (
    reset_conversation_state,
)


def async_command(f):
    """Decorator to run an async click command."""

    @wraps(f)
    def wrapper(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))

    return wrapper


@click.command()
@click.option(
    "--user-id",
    type=str,
    default=None,
    help="User ID to reset memory for. If not provided, resets for all users.",
)
@async_command
async def main(user_id: str) -> None:
    """CLI command to reset career coach conversation memory.

    Args:
        user_id: Optional user ID to reset memory for specific user only.
                If not provided, resets memory for all users.
    """

    if user_id:
        print(f"\033[33mResetting career coach memory for user: {user_id}\033[0m")
    else:
        print("\033[33mResetting career coach memory for ALL users\033[0m")
        confirm = input("Are you sure? This will delete all conversation history. (y/N): ")
        if confirm.lower() != 'y':
            print("\033[31mOperation cancelled.\033[0m")
            return

    try:
        result = await reset_conversation_state(user_id=user_id)
        print(f"\033[32m✓ {result['message']}\033[0m")
        print(f"\033[32mCheckpoints deleted: {result['checkpoints_deleted']}\033[0m")
        print(f"\033[32mWrites deleted: {result['writes_deleted']}\033[0m")
    except Exception as e:
        print(f"\033[31m✗ Error resetting memory: {e}\033[0m")


if __name__ == "__main__":
    main()
