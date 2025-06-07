import os

import opik
from loguru import logger
from opik.configurator.configure import OpikConfigurator


def configure(api_key: str | None, project: str) -> None:
    """Configure Opik for monitoring and tracking.
    
    Args:
        api_key: Comet API key for Opik
        project: Project name for tracking
    """
    if api_key and project:
        try:
            client = OpikConfigurator(api_key=api_key)
            default_workspace = client._get_default_workspace()
        except Exception:
            logger.warning(
                "Default workspace not found. Setting workspace to None and enabling interactive mode."
            )
            default_workspace = None

        os.environ["OPIK_PROJECT_NAME"] = project

        try:
            opik.configure(
                api_key=api_key,
                workspace=default_workspace,
                use_local=False,
                force=True,
            )
            logger.info(
                f"Opik configured successfully using workspace '{default_workspace}'"
            )
        except Exception:
            logger.warning(
                "Couldn't configure Opik. There is probably a problem with the COMET_API_KEY or COMET_PROJECT environment variables or with the Opik server."
            )
    else:
        logger.warning(
            "COMET_API_KEY and COMET_PROJECT are not set. Set them to enable prompt monitoring with Opik (powered by Comet ML)."
        )


def get_dataset(name: str) -> opik.Dataset | None:
    client = opik.Opik()
    try:
        dataset = client.get_dataset(name=name)
    except Exception:
        dataset = None

    return dataset


def create_dataset(name: str, description: str, items: list[dict]) -> opik.Dataset:
    client = opik.Opik()

    client.delete_dataset(name=name)

    dataset = client.create_dataset(name=name, description=description)
    dataset.insert(items)

    return dataset
