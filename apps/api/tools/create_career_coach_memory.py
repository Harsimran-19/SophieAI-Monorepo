import click
from loguru import logger

from career_coaches.application.data.extract import create_sample_career_documents
from career_coaches.application.long_term_memory import CareerCoachLongTermMemoryCreator


@click.command()
@click.option(
    "--use-sample-data",
    is_flag=True,
    default=True,
    help="Use sample career coaching data to create memory.",
)
def main(use_sample_data: bool) -> None:
    """CLI command to create long-term memory for career coaches.

    Args:
        use_sample_data: Whether to use sample career coaching data.
    """

    logger.info("Creating long-term memory for career coaches...")

    try:
        # Create memory creator
        memory_creator = CareerCoachLongTermMemoryCreator.build_from_settings()

        if use_sample_data:
            logger.info("Using sample career coaching data...")
            documents = create_sample_career_documents()
            
            logger.info(f"Processing {len(documents)} sample documents...")
            memory_creator.create_memory_from_documents(documents)
            
            print(f"\033[32m✓ Successfully created career coach long-term memory with {len(documents)} sample documents\033[0m")
            print("\033[32mSample data includes:\033[0m")
            print("  • Career assessment guidance")
            print("  • Resume writing best practices")
            print("  • LinkedIn optimization strategies")
            print("  • Networking techniques")
            print("  • Interview preparation tips")
        else:
            logger.warning("Custom data loading not implemented yet. Use --use-sample-data flag.")
            print("\033[33m⚠ Custom data loading not implemented yet. Use --use-sample-data flag.\033[0m")

    except Exception as e:
        logger.error(f"Error creating career coach memory: {e}")
        print(f"\033[31m✗ Error creating career coach memory: {e}\033[0m")


if __name__ == "__main__":
    main()
