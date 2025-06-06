from langchain_core.documents import Document
from loguru import logger

from career_coaches.config import settings
from common.infrastructure.mongo.client import MongoClientWrapper


async def reset_conversation_state(user_id: str = None) -> dict:
    """Reset the conversation state for career coaches.
    
    Deletes the MongoDB collections used for keeping LangGraph state.
    If user_id is provided, only resets state for that specific user.

    Args:
        user_id: Optional user ID to reset state for specific user only

    Returns:
        dict: A dictionary containing the result of the reset operation.

    Raises:
        Exception: If there is an error resetting the conversation state.
    """
    try:
        # Reset checkpoint collection
        with MongoClientWrapper(
            model=Document,
            collection_name=settings.MONGO_CAREER_STATE_CHECKPOINT_COLLECTION,
            database_name=settings.MONGO_DB_NAME,
            mongodb_uri=settings.MONGO_URI,
            app_name="career_coaches",
        ) as client:
            if user_id:
                # Delete only checkpoints for specific user
                query = {"thread_id": {"$regex": f"^{user_id}_"}}
                result_checkpoints = client.collection.delete_many(query)
                logger.info(f"Deleted {result_checkpoints.deleted_count} checkpoint documents for user {user_id}")
            else:
                # Clear entire collection
                client.clear_collection()
                logger.info("Cleared all career coach checkpoint documents")

        # Reset writes collection
        with MongoClientWrapper(
            model=Document,
            collection_name=settings.MONGO_CAREER_STATE_WRITES_COLLECTION,
            database_name=settings.MONGO_DB_NAME,
            mongodb_uri=settings.MONGO_URI,
            app_name="career_coaches",
        ) as client:
            if user_id:
                # Delete only writes for specific user
                query = {"thread_id": {"$regex": f"^{user_id}_"}}
                result_writes = client.collection.delete_many(query)
                logger.info(f"Deleted {result_writes.deleted_count} write documents for user {user_id}")
            else:
                # Clear entire collection
                client.clear_collection()
                logger.info("Cleared all career coach write documents")

        if user_id:
            return {
                "message": f"Career coach conversation state reset successfully for user {user_id}",
                "user_id": user_id,
                "checkpoints_deleted": result_checkpoints.deleted_count if user_id else "all",
                "writes_deleted": result_writes.deleted_count if user_id else "all",
            }
        else:
            return {
                "message": "Career coach conversation state reset successfully for all users",
                "checkpoints_deleted": "all",
                "writes_deleted": "all",
            }

    except Exception as e:
        logger.error(f"Error resetting career coach conversation state: {e}")
        raise
