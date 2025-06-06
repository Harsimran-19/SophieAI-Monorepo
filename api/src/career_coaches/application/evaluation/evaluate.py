import asyncio

import opik
from loguru import logger
from opik.evaluation import evaluate
from opik.evaluation.metrics import (
    AnswerRelevance,
    Hallucination,
    Moderation,
)

from career_coaches.application.conversation_service.generate_response import get_response
from career_coaches.application.conversation_service.workflow import state_to_str
from career_coaches.config import settings
from career_coaches.domain.coach_factory import CoachFactory


async def career_coach_evaluation_task(x: dict) -> dict:
    """Calls career coach app logic to evaluate coach responses.

    Args:
        x: Dictionary containing evaluation data with the following keys:
            messages: List of conversation messages where all but the last are inputs
                and the last is the expected output
            coach_id: ID of the career coach to use
            user_id: ID of the user for multi-user support

    Returns:
        dict: Dictionary with evaluation results containing:
            input: Original input messages
            context: Context used for generating the response
            output: Generated response from career coach
            expected_output: Expected answer for comparison
    """

    coach_factory = CoachFactory()
    coach = coach_factory.get_coach(x["coach_id"])

    input_messages = x["messages"][:-1]
    expected_output_message = x["messages"][-1]
    user_id = x.get("user_id", "test_user")

    response, latest_state = await get_response(
        messages=input_messages,
        user_id=user_id,
        coach_id=coach.id,
        coach_name=coach.name,
        coach_specialty=coach.specialty,
        coach_approach=coach.approach,
        coach_focus_areas=coach.focus_areas,
        user_context="",
        new_thread=True,
    )
    context = state_to_str(latest_state)

    return {
        "input": input_messages,
        "context": context,
        "output": response,
        "expected_output": expected_output_message,
    }


def get_used_prompts() -> list[opik.Prompt]:
    """Get the prompts used in career coaching for evaluation tracking."""
    client = opik.Opik()

    prompts = [
        client.get_prompt(name="career_coach_character_card"),
        client.get_prompt(name="summary_prompt"),
        client.get_prompt(name="extend_summary_prompt"),
    ]
    prompts = [p for p in prompts if p is not None]

    return prompts


def evaluate_career_coach(
    dataset: opik.Dataset | None,
    workers: int = 2,
    nb_samples: int | None = None,
) -> None:
    """Evaluates a career coach using specified metrics and dataset.

    Runs evaluation using Opik framework with configured metrics for career coaching
    effectiveness including response relevance, actionability, and coaching quality.

    Args:
        dataset: Dataset containing evaluation examples.
            Must contain messages, coach_id, and user_id.
        workers: Number of parallel workers to use for evaluation.
            Defaults to 2.
        nb_samples: Optional number of samples to evaluate.
            If None, evaluates the entire dataset.

    Raises:
        ValueError: If dataset is None
        AssertionError: If COMET_API_KEY is not set

    Returns:
        None
    """

    assert settings.COMET_API_KEY, (
        "COMET_API_KEY is not set. We need it to track the experiment with Opik."
    )

    if not dataset:
        raise ValueError("Dataset is 'None'.")

    logger.info("Starting career coach evaluation...")

    experiment_config = {
        "model_id": settings.GROQ_LLM_MODEL,
        "dataset_name": dataset.name,
        "agent_type": "career_coach",
    }
    used_prompts = get_used_prompts()

    # Career coaching specific metrics
    scoring_metrics = [
        AnswerRelevance(),  # How relevant is the coaching advice
        Hallucination(),    # Accuracy of information provided
        Moderation(),       # Appropriate and professional tone
        # TODO: Add custom metrics for:
        # - Actionability (how actionable is the advice)
        # - Empathy (how supportive and understanding)
        # - Goal alignment (how well advice aligns with career goals)
    ]

    logger.info("Career coach evaluation details:")
    logger.info(f"Dataset: {dataset.name}")
    logger.info(f"Metrics: {[m.__class__.__name__ for m in scoring_metrics]}")

    evaluate(
        dataset=dataset,
        task=lambda x: asyncio.run(career_coach_evaluation_task(x)),
        scoring_metrics=scoring_metrics,
        experiment_config=experiment_config,
        task_threads=workers,
        nb_samples=nb_samples,
        prompts=used_prompts,
    )
