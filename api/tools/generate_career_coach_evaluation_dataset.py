import click
from loguru import logger

from career_coaches.application.evaluation.generate_dataset import (
    generate_sample_evaluation_dataset,
    save_evaluation_dataset,
)
from career_coaches.config import settings


@click.command()
@click.option(
    "--output-file",
    type=str,
    default=str(settings.CAREER_EVALUATION_DATASET_FILE_PATH),
    help="Output file path for the evaluation dataset.",
)
@click.option(
    "--sample-data",
    is_flag=True,
    default=True,
    help="Generate sample evaluation data.",
)
def main(output_file: str, sample_data: bool) -> None:
    """CLI command to generate evaluation dataset for career coaches.

    Args:
        output_file: Path to save the evaluation dataset.
        sample_data: Whether to generate sample evaluation data.
    """

    logger.info("Generating evaluation dataset for career coaches...")

    try:
        if sample_data:
            logger.info("Generating sample evaluation data...")
            dataset = generate_sample_evaluation_dataset()
            
            logger.info(f"Generated {len(dataset)} evaluation examples")
            
            # Save dataset
            from pathlib import Path
            save_evaluation_dataset(dataset, Path(output_file))
            
            print(f"\033[32m✓ Successfully generated evaluation dataset with {len(dataset)} examples\033[0m")
            print(f"\033[32mSaved to: {output_file}\033[0m")
            
            # Show summary
            coaches_covered = set(item["coach_id"] for item in dataset)
            print(f"\033[32mCoaches covered: {', '.join(coaches_covered)}\033[0m")
            
            print("\033[32mDataset includes scenarios for:\033[0m")
            print("  • Career assessment and guidance")
            print("  • Resume building and optimization") 
            print("  • LinkedIn profile enhancement")
            print("  • Networking strategy development")
            
        else:
            logger.warning("Custom dataset generation not implemented yet. Use --sample-data flag.")
            print("\033[33m⚠ Custom dataset generation not implemented yet. Use --sample-data flag.\033[0m")

    except Exception as e:
        logger.error(f"Error generating evaluation dataset: {e}")
        print(f"\033[31m✗ Error generating evaluation dataset: {e}\033[0m")


if __name__ == "__main__":
    main()
