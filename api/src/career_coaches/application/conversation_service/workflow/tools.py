"""
Career coach tools for web access and information retrieval.
This module provides tools for accessing real-time information from the web
to enhance the career coach's capabilities.
"""

import os
from typing import List, Optional

from langchain.tools import Tool
from langchain_core.tools import BaseTool

# Web Search Tools
try:
    from langchain_community.tools.tavily_search import TavilySearchResults
    from langchain_community.utilities.serpapi import SerpAPIWrapper
    from langchain_community.tools import DuckDuckGoSearchRun
except ImportError:
    pass  # Optional dependencies - will be handled gracefully at runtime


def get_tavily_search_tool() -> Optional[BaseTool]:
    """
    Get Tavily search tool if API key is available.
    Returns None if not available.
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return None
    
    try:
        return TavilySearchResults(
            api_key=api_key,
            max_results=3,
            description="Search the web for current information about career trends, job markets, and industry news",
        )
    except (NameError, ImportError):
        return None


def get_serper_search_tool() -> Optional[BaseTool]:
    """
    Get Serper (Google Search API alternative) tool if API key is available.
    Returns None if not available.
    """
    api_key = os.getenv("SERPER_API_KEY")
    if not api_key:
        return None
    
    try:
        import requests
        
        def serper_search_run(query):
            """Run Serper search and return results"""
            headers = {
                'X-API-KEY': api_key,
                'Content-Type': 'application/json'
            }
            payload = {
                'q': query,
                'num': 5  # Number of search results
            }
            
            response = requests.post('https://google.serper.dev/search', 
                                    headers=headers, 
                                    json=payload)
            response_data = response.json()
            
            # Format results as a readable string
            results = []
            if 'organic' in response_data:
                for item in response_data['organic'][:5]:  # Take top 5 results
                    title = item.get('title', 'No title')
                    link = item.get('link', 'No link')
                    snippet = item.get('snippet', 'No snippet')
                    results.append(f"Title: {title}\nURL: {link}\nDescription: {snippet}\n")
            
            return "\n\n".join(results) if results else "No results found"
        
        return Tool(
            name="WebSearch",
            func=serper_search_run,
            description="Search the web for current information about career trends, job markets, and industry news",
        )
    except (NameError, ImportError, Exception) as e:
        print(f"Error creating Serper search tool: {e}")
        return None


def get_duckduckgo_search_tool() -> Optional[BaseTool]:
    """
    Get DuckDuckGo search tool (no API key required).
    Returns None if not available.
    """
    try:
        return DuckDuckGoSearchRun(
            name="DuckDuckGoSearch",
            description="Search the web using DuckDuckGo for current information about career trends, job markets, and industry news",
        )
    except (NameError, ImportError):
        return None


def get_available_web_tools() -> List[BaseTool]:
    """
    Get all available web search tools.
    Gracefully handles missing API keys or dependencies.
    """
    available_tools = []
    
    # Try to set up each search tool
    tavily = get_tavily_search_tool()
    if tavily:
        available_tools.append(tavily)
        
    serper = get_serper_search_tool()
    if serper:
        available_tools.append(serper)
        
    ddg = get_duckduckgo_search_tool()
    if ddg:
        available_tools.append(ddg)
    
    return available_tools


# Export available tools
tools = get_available_web_tools()
