from langchain_core.documents import Document
from loguru import logger

from career_coaches.config import settings
from common.application.rag.retrievers import Retriever, get_retriever
from common.application.rag.splitters import Splitter, get_splitter
from common.infrastructure.mongo import MongoClientWrapper, MongoIndex


class CareerCoachLongTermMemoryCreator:
    """Creates and manages long-term memory for career coaches."""
    
    def __init__(self, retriever: Retriever, splitter: Splitter) -> None:
        self.retriever = retriever
        self.splitter = splitter

    @classmethod
    def build_from_settings(cls) -> "CareerCoachLongTermMemoryCreator":
        """Build the memory creator from configuration settings."""
        retriever = get_retriever(
            embedding_model_id=settings.RAG_TEXT_EMBEDDING_MODEL_ID,
            mongo_uri=settings.MONGO_URI,
            db_name=settings.MONGO_DB_NAME,
            collection_name=settings.MONGO_CAREER_LONG_TERM_MEMORY_COLLECTION,
            k=settings.RAG_TOP_K,
            device=settings.RAG_DEVICE,
        )
        splitter = get_splitter(chunk_size=settings.RAG_CHUNK_SIZE)

        return cls(retriever, splitter)

    def create_memory_from_documents(self, documents: list[Document]) -> None:
        """Create long-term memory from a list of documents.
        
        Args:
            documents: List of documents to process and store
        """
        if len(documents) == 0:
            logger.warning("No documents to process for career coach memory. Exiting.")
            return

        # First clear the long term memory collection to avoid duplicates.
        with MongoClientWrapper(
            model=Document, 
            collection_name=settings.MONGO_CAREER_LONG_TERM_MEMORY_COLLECTION,
            database_name=settings.MONGO_DB_NAME,
            mongodb_uri=settings.MONGO_URI,
            app_name="career_coaches",
        ) as client:
            client.clear_collection()

        # Process documents
        chunked_docs = self.splitter.split_documents(documents)
        
        # Add documents to vector store
        self.retriever.vectorstore.add_documents(chunked_docs)
        
        # Create search index
        self.__create_index()

    def __create_index(self) -> None:
        """Create the search index for the memory collection."""
        with MongoClientWrapper(
            model=Document, 
            collection_name=settings.MONGO_CAREER_LONG_TERM_MEMORY_COLLECTION,
            database_name=settings.MONGO_DB_NAME,
            mongodb_uri=settings.MONGO_URI,
            app_name="career_coaches",
        ) as client:
            self.index = MongoIndex(
                retriever=self.retriever,
                mongodb_client=client,
            )
            self.index.create(
                is_hybrid=True, embedding_dim=settings.RAG_TEXT_EMBEDDING_MODEL_DIM
            )


class CareerCoachLongTermMemoryRetriever:
    """Retrieves information from career coach long-term memory."""
    
    def __init__(self, retriever: Retriever) -> None:
        self.retriever = retriever

    @classmethod
    def build_from_settings(cls) -> "CareerCoachLongTermMemoryRetriever":
        """Build the memory retriever from configuration settings."""
        retriever = get_retriever(
            embedding_model_id=settings.RAG_TEXT_EMBEDDING_MODEL_ID,
            mongo_uri=settings.MONGO_URI,
            db_name=settings.MONGO_DB_NAME,
            collection_name=settings.MONGO_CAREER_LONG_TERM_MEMORY_COLLECTION,
            k=settings.RAG_TOP_K,
            device=settings.RAG_DEVICE,
        )

        return cls(retriever)

    def retrieve(self, query: str, user_id: str = None) -> list[Document]:
        """Retrieve relevant documents from long-term memory.
        
        Args:
            query: Search query
            user_id: Optional user ID for user-specific retrieval
            
        Returns:
            List of relevant documents
        """
        # For now, we don't filter by user_id, but this can be added later
        # when we implement user-specific memory
        return self.retriever.invoke(query)
