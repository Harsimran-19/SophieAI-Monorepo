"""Main entry point for the resume editor application."""

import os
import sys
import json
import argparse
import subprocess
import asyncio
from pathlib import Path
from loguru import logger

from .interfaces.api import start_api
from .application.config import ApplicationConfig
from .application.services import ResumeApplicationService
from .infrastructure.repositories import FileResumeRepository, InMemoryChatHistoryRepository
from .infrastructure.llm import LLMService


async def interactive_chat(user_id: str, config_path: str = "./config.json"):
    """Interactive CLI chat with the resume editor agent.
    
    Args:
        user_id: User ID for the chat session
        config_path: Path to the configuration file
    """
    # Load configuration
    config = ApplicationConfig()
    
    # Try to load from config file if it exists
    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                config_data = json.load(f)
            
            # Override with values from config file
            for key, value in config_data.items():
                if hasattr(config, key):
                    setattr(config, key, value)
        except Exception as e:
            logger.error(f"Error loading configuration from {config_path}: {e}")
    
    # Set up services
    resume_repository = FileResumeRepository(config.absolute_data_path)
    chat_history_repository = InMemoryChatHistoryRepository()
    llm_service = LLMService(
        api_key=config.groq_api_key,
        model_name=config.model_name,
        temperature=config.temperature
    )
    
    # Create application service
    app_service = ResumeApplicationService(
        resume_repository=resume_repository,
        chat_history_repository=chat_history_repository,
        llm_service=llm_service
    )
    
    print(f"\nResume Editor Chat - User ID: {user_id}")
    print("Type 'exit' or 'quit' to end the conversation.\n")
    
    # Check if user has a resume
    resume = await app_service.get_resume(user_id)
    if not resume:
        print("No resume found for this user. You can create one during the chat.\n")
    else:
        print("Found existing resume.\n")
    
    # Chat loop
    while True:
        # Get user input
        user_message = input("You: ")
        
        # Check for exit command
        if user_message.lower() in ["exit", "quit"]:
            print("\nGoodbye!")
            break
        
        # Process message
        print("\nAssistant: ", end="", flush=True)
        
        # Get response from agent
        response = await app_service.process_message(user_id, user_message)
        
        # Print response
        print(response)
        print()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Resume Editor Application")
    
    # Create subparsers for different commands
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # API server command
    api_parser = subparsers.add_parser("api", help="Start the API server")
    api_parser.add_argument(
        "--port", type=int, default=8000, help="Port to run the server on"
    )
    
    # Test agent chat command
    chat_parser = subparsers.add_parser("chat", help="Start an interactive chat with the agent")
    chat_parser.add_argument(
        "--user-id", type=str, default="test_user", help="User ID for testing"
    )
    chat_parser.add_argument(
        "--config", type=str, default="./config.json", help="Path to configuration file"
    )
    
    # Streamlit UI command
    streamlit_parser = subparsers.add_parser("streamlit", help="Start the Streamlit UI")
    streamlit_parser.add_argument(
        "--port", type=int, default=8501, help="Port to run Streamlit on"
    )
    streamlit_parser.add_argument(
        "--config", type=str, default="./config.json", help="Path to configuration file"
    )
    
    args = parser.parse_args()
    
    # If no command provided, display help
    if not args.command:
        parser.print_help()
        return
    
    # Run the selected command
    if args.command == "api":
        logger.info(f"Starting Resume Editor API on port {args.port}")
        start_api(args.port)
    
    elif args.command == "chat":
        logger.info(f"Starting interactive chat with user ID: {args.user_id}")
        asyncio.run(interactive_chat(args.user_id, args.config))
    
    elif args.command == "streamlit":
        # Set environment variables for Streamlit
        os.environ["RESUME_CONFIG_PATH"] = args.config
        
        logger.info(f"Starting Streamlit UI on port {args.port}")
        
        # Get the path to the streamlit_app.py file in the interfaces directory
        current_dir = Path(__file__).parent
        streamlit_app_path = current_dir / "interfaces" / "streamlit_app.py"
        
        # Launch Streamlit using subprocess
        streamlit_cmd = [
            "streamlit", "run", str(streamlit_app_path),
            "--server.port", str(args.port),
        ]
        
        try:
            subprocess.run(streamlit_cmd)
        except KeyboardInterrupt:
            logger.info("Streamlit UI stopped by user")
        except Exception as e:
            logger.error(f"Error running Streamlit: {e}")
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
