"""
Career Coach Web Search Experiment

This notebook tests various web search capabilities for the career coach agents,
comparing different search APIs and evaluating their effectiveness.
"""

import os
import sys
import asyncio
from typing import List, Dict, Any, Optional

# Add parent and src directories to path to allow imports
sys.path.insert(0, os.path.abspath('..'))
sys.path.insert(0, os.path.abspath('../src'))

# Import career coach experiment helper
from career_coach_experiment import CareerCoachExperiment

# Import LangChain tools
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.utilities.serpapi import SerpAPIWrapper
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.tools import Tool

# Import for creating agents with tools
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

# Import for environment variables
from dotenv import load_dotenv

# Load environment variables from .env file (create this file with your API keys)
load_dotenv()

# ===== Web Search Tool Setup =====

# Initialize search tools based on available API keys

# 1. Tavily Search (AI-optimized search)
tavily_api_key = os.getenv("TAVILY_API_KEY")
tavily_search = None
if tavily_api_key:
    tavily_search = TavilySearchResults(api_key=tavily_api_key)
    print("✅ Tavily search initialized")
else:
    print("❌ Tavily search not available (API key missing)")

# 2. Serper API (Google Search alternative)
serper_api_key = os.getenv("SERPER_API_KEY")
serper_search = None
if serper_api_key:
    # Custom implementation for Serper API
    import requests
    
    def serper_search_run(query):
        """Run Serper search and return results"""
        headers = {
            'X-API-KEY': serper_api_key,
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
    
    serper_search = Tool(
        name="Web Search",
        description="Search for current information from the web using Google Search",
        func=serper_search_run
    )
    print("✅ Serper search initialized")
else:
    print("❌ Serper search not available (API key missing)")

# 3. DuckDuckGo Search (no API key needed)
ddg_search = DuckDuckGoSearchRun()
print("✅ DuckDuckGo search initialized")

# ===== Career Coach with Web Search Tools =====

class WebEnabledCareerCoach:
    """Career coach with web search capabilities"""
    
    def __init__(
        self, 
        coach_type: str = "career_assessment",
        search_tool: Optional[Tool] = None,
        search_tool_name: str = "Unknown"
    ):
        """
        Initialize a career coach with web search capabilities
        
        Args:
            coach_type: Type of career coach (career_assessment, resume_builder, etc.)
            search_tool: LangChain search tool to use
            search_tool_name: Name of the search tool for tracking
        """
        self.coach = CareerCoachExperiment(coach_id=coach_type)
        self.search_tool = search_tool
        self.search_tool_name = search_tool_name
        
        # Create LangChain model from settings
        from career_coaches.config import settings
        self.model = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_LLM_MODEL,
            temperature=0.7,
        )
        
        # Set up tools
        self.tools = []
        if self.search_tool is not None:
            self.tools.append(self.search_tool)
    
    def search(self, query: str) -> str:
        """
        Perform a web search using the configured search tool
        
        Args:
            query: Search query
            
        Returns:
            Search results as string
        """
        if self.search_tool is None:
            return "No search tool configured"
        
        return self.search_tool.run(query)
    
    def ask_with_web_search(self, question: str, prompt_template: Optional[str] = None) -> str:
        """
        Ask a question that may require web search to answer
        
        Args:
            question: User question
            prompt_template: Optional prompt template to use
            
        Returns:
            Coach response
        """
        if not self.tools:
            # No web search tools available, use regular career coach
            return self.coach.ask_coach(question)
        
        # Create a prompt that includes access to web search
        if prompt_template is None:
            prompt_template = """
            You are a career coach with access to current information from the web.
            You can search for up-to-date information about job markets, industry trends, and career advice.
            
            When the user asks for information that would benefit from current data, use the search tools available to you.
            Then incorporate that information into your response.
            
            If the information is evergreen or you are confident in your knowledge, you can respond directly.
            
            Use web search for:
            - Current job market trends
            - Latest industry news
            - Recent changes in hiring practices
            - New tools or technologies in specific fields
            - Current salary ranges
            
            Always cite your sources if you use web search results.
            """
        
        # Create an agent with web search tools
        prompt = ChatPromptTemplate.from_template(prompt_template)
        agent = create_openai_tools_agent(self.model, self.tools, prompt)
        agent_executor = AgentExecutor(agent=agent, tools=self.tools, verbose=True)
        
        # Execute the agent with the question
        response = agent_executor.invoke({"input": question})
        return response["output"]

# ===== Test Functions =====

def test_search_tool(search_tool, tool_name: str, query: str) -> None:
    """Test a search tool with a query and print results"""
    print(f"Testing {tool_name} with query: '{query}'")
    try:
        result = search_tool.run(query)
        print(f"Results from {tool_name}:")
        print(result[:1000] + "..." if len(result) > 1000 else result)
        print("-" * 80)
    except Exception as e:
        print(f"Error with {tool_name}: {str(e)}")
        print("-" * 80)

async def test_career_coach_with_search(coach_type: str, search_tool, search_tool_name: str) -> None:
    """Test a career coach with a web search tool"""
    print(f"Testing {coach_type} coach with {search_tool_name}")
    
    coach = WebEnabledCareerCoach(
        coach_type=coach_type,
        search_tool=search_tool,
        search_tool_name=search_tool_name
    )
    
    # Test questions that benefit from web access
    questions = [
        "What are the current trends in tech hiring for entry-level positions?",
        "What skills are most in-demand for data science roles right now?",
        "How has remote work changed the job market for software engineers?",
        "What are the latest developments in AI that are affecting the job market?"
    ]
    
    for question in questions:
        print(f"\nQuestion: {question}")
        try:
            answer = coach.ask_with_web_search(question)
            print(f"Answer:")
            print(answer[:1000] + "..." if len(answer) > 1000 else answer)
        except Exception as e:
            print(f"Error: {str(e)}")
        print("-" * 80)

# ===== Main Testing Code =====

# Uncomment these lines to test individual search tools
'''
print("Testing search tools directly...\n")

search_query = "current tech job market trends 2025"

if tavily_search:
    test_search_tool(tavily_search, "Tavily Search", search_query)
    
if serper_search:
    test_search_tool(serper_search, "Serper API", search_query)

test_search_tool(ddg_search, "DuckDuckGo Search", search_query)
'''

# Test career coach with different search tools
'''
async def run_tests():
    coach_types = ["career_assessment", "resume_builder", "linkedin_optimizer", "networking_strategy"]
    search_tools = []
    
    if tavily_search:
        search_tools.append((tavily_search, "Tavily Search"))
        
    if serper_search:
        search_tools.append((serper_search, "Serper API"))
    
    search_tools.append((ddg_search, "DuckDuckGo Search"))
    
    # Test each combination of coach type and search tool
    for coach_type in coach_types:
        for tool, tool_name in search_tools:
            await test_career_coach_with_search(coach_type, tool, tool_name)
            
# asyncio.run(run_tests())
'''

print("""
To test the web search tools:
1. Create a .env file with your API keys:
   TAVILY_API_KEY=your_tavily_api_key
   SERPER_API_KEY=your_serper_api_key
   
2. Uncomment the testing code at the bottom of this file
3. Run this file as a script or in a Jupyter notebook
""")

# Example usage:
# coach = WebEnabledCareerCoach(coach_type="career_assessment", search_tool=tavily_search, search_tool_name="Tavily")
# response = coach.ask_with_web_search("What are the latest trends in tech hiring?")
# print(response)
