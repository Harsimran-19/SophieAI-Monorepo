from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_mongodb.retrievers import (
    MongoDBAtlasHybridSearchRetriever,
)
from loguru import logger

from .embeddings import get_embedding_model

Retriever = MongoDBAtlasHybridSearchRetriever


def get_retriever(
    embedding_model_id: str,
    mongo_uri: str,
    db_name: str,
    collection_name: str,
    k: int = 3,
    device: str = "cpu",
) -> Retriever:
    """Creates and returns a hybrid search retriever with the specified embedding model.

    Args:
        embedding_model_id (str): The identifier for the embedding model to use.
        mongo_uri (str): MongoDB connection URI.
        db_name (str): Database name.
        collection_name (str): Collection name for long-term memory.
        k (int, optional): Number of documents to retrieve. Defaults to 3.
        device (str, optional): Device to run the embedding model on. Defaults to "cpu".

    Returns:
        Retriever: A configured hybrid search retriever.
    """
    logger.info(
        f"Initializing retriever | model: {embedding_model_id} | device: {device} | top_k: {k}"
    )

    embedding_model = get_embedding_model(embedding_model_id, device)

    return get_hybrid_search_retriever(
        embedding_model, k, mongo_uri, db_name, collection_name
    )


def get_hybrid_search_retriever(
    embedding_model: HuggingFaceEmbeddings, 
    k: int,
    mongo_uri: str,
    db_name: str,
    collection_name: str,
) -> MongoDBAtlasHybridSearchRetriever:
    """Creates a MongoDB Atlas hybrid search retriever with the given embedding model.

    Args:
        embedding_model (HuggingFaceEmbeddings): The embedding model to use for vector search.
        k (int): Number of documents to retrieve.
        mongo_uri (str): MongoDB connection URI.
        db_name (str): Database name.
        collection_name (str): Collection name for long-term memory.

    Returns:
        MongoDBAtlasHybridSearchRetriever: A configured hybrid search retriever using both
            vector and text search capabilities.
    """
    vectorstore = MongoDBAtlasVectorSearch.from_connection_string(
        connection_string=mongo_uri,
        embedding=embedding_model,
        namespace=f"{db_name}.{collection_name}",
        text_key="chunk",
        embedding_key="embedding",
        relevance_score_fn="dotProduct",
    )

    retriever = MongoDBAtlasHybridSearchRetriever(
        vectorstore=vectorstore,
        search_index_name="hybrid_search_index",
        top_k=k,
        vector_penalty=50,
        fulltext_penalty=50,
    )

    return retriever
