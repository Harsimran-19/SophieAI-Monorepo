import click
from loguru import logger

from career_coaches.application.evaluation.evaluate import evaluate_career_coach
from career_coaches.config import settings
from common.infrastructure.opik_utils import get_dataset


@click.command()
@click.option(
    "--dataset-name",
    type=str,
    default="career_coach_evaluation",
    help="Name of the evaluation dataset in Opik.",
)
@click.option(
    "--workers",
    type=int,
    default=2,
    help="Number of parallel workers for evaluation.",
)
@click.option(
    "--nb-samples",
    type=int,
    default=None,
    help="Number of samples to evaluate. If not provided, evaluates entire dataset.",
)
def main(dataset_name: str, workers: int, nb_samples: int) -> None:
    """CLI command to evaluate career coach performance.

    Args:
        dataset_name: Name of the evaluation dataset in Opik.
        workers: Number of parallel workers for evaluation.
        nb_samples: Number of samples to evaluate.
    """

    if not settings.COMET_API_KEY:
        print("\033[31m✗ COMET_API_KEY is not set. Please set it to run evaluations.\033[0m")
        return

    logger.info(f"Starting career coach evaluation with dataset: {dataset_name}")

    try:
        # Get dataset from Opik
        dataset = get_dataset(dataset_name)
        
        if not dataset:
            print(f"\033[31m✗ Dataset '{dataset_name}' not found in Opik.\033[0m")
            print("\033[33mTip: Upload your evaluation dataset to Opik first, or use the generate_career_coach_evaluation_dataset.py tool.\033[0m")
            return

        print(f"\033[32m✓ Found dataset '{dataset_name}' with {len(dataset)} examples\033[0m")
        
        if nb_samples:
            print(f"\033[33mEvaluating {nb_samples} samples from the dataset\033[0m")
        else:
            print(f"\033[33mEvaluating entire dataset ({len(dataset)} samples)\033[0m")
            
        print(f"\033[33mUsing {workers} parallel workers\033[0m")
        print()
        
        # Run evaluation
        evaluate_career_coach(
            dataset=dataset,
            workers=workers,
            nb_samples=nb_samples,
        )
        
        print(f"\033[32m✓ Career coach evaluation completed successfully!\033[0m")
        print(f"\033[32mCheck your Opik dashboard for detailed results.\033[0m")

    except Exception as e:
        logger.error(f"Error during career coach evaluation: {e}")
        print(f"\033[31m✗ Error during evaluation: {e}\033[0m")


if __name__ == "__main__":
    main()
