#!/usr/bin/env python
"""
Career Coach Web Tools Demo

This script demonstrates the web-enabled career coach functionality,
which allows the coach to search the web for current information.
"""

import os
import sys
import asyncio
from typing import List, Dict, Any, Optional

# Add the parent directory to Python path so modules can be found
# This is critical to solve the ModuleNotFoundError
sys.path.append(os.path.abspath('..'))
sys.path.append(os.path.abspath('../src'))

# For Jupyter notebooks integration
try:
    import nest_asyncio
    nest_asyncio.apply()
    IN_NOTEBOOK = True
except ImportError:
    IN_NOTEBOOK = False

# Import the WebEnabledCareerCoach class from our implementation
from career_coaches.domain.web_coach import WebEnabledCareerCoach

# Load environment variables for API keys
from dotenv import load_dotenv
load_dotenv()  # Load from .env file

# Check and print available API keys (without showing the actual keys)
print("Tavily API Key:", "✅ Available" if os.getenv("TAVILY_API_KEY") else "❌ Missing")
print("Serper API Key:", "✅ Available" if os.getenv("SERPER_API_KEY") or os.getenv("SERPAPI_API_KEY") else "❌ Missing")
print("DuckDuckGo:", "✅ Available (no API key needed)")

# Create different coach instances for testing
tavily_coach = WebEnabledCareerCoach(search_tool_name="tavily", coach_type="career_assessment")
serper_coach = WebEnabledCareerCoach(search_tool_name="serper", coach_type="career_assessment") 
ddg_coach = WebEnabledCareerCoach(search_tool_name="ddg", coach_type="career_assessment")
all_tools_coach = WebEnabledCareerCoach(search_tool_name="all", coach_type="career_assessment")

def test_question(question: str, coach_name: str = "tavily") -> str:
    """Test a question with a specific coach"""
    print(f"\n🔍 Testing with {coach_name} coach: '{question}'")
    
    if coach_name == "tavily":
        coach = tavily_coach
    elif coach_name == "serper":
        coach = serper_coach
    elif coach_name == "ddg":
        coach = ddg_coach
    else:  # "all"
        coach = all_tools_coach
    
    response = coach.ask_with_web_search(question)
    return response

def test_search_directly(query: str = "current tech job market trends 2023"):
    """Test the search functionality directly without the coach"""
    print(f"\n🔍 Testing search tools directly with query: '{query}'")
    
    print("\n=== Tavily Search ===")
    result = tavily_coach.search(query)
    print(result[:1000] + "..." if len(result) > 1000 else result)
    
    print("\n=== DuckDuckGo Search ===")
    result = ddg_coach.search(query)
    print(result[:1000] + "..." if len(result) > 1000 else result)
    
    print("\n=== All Tools Search (using first available) ===")
    result = all_tools_coach.search(query)
    print(result[:1000] + "..." if len(result) > 1000 else result)

def run_all_tests():
    """Run a series of tests with different coaches and questions"""
    questions = [
        "What are the current trends in tech hiring for entry-level positions in 2025?",
        "How has the job market evolved for data scientists in the last year?",
        "What skills are most in demand for software engineers right now?",
        "What are the best practices for remote job interviews in 2025?"
    ]
    
    # Test with different search tools
    for question in questions:
        for coach_type in ["tavily", "ddg", "all"]:
            response = test_question(question, coach_type)
            print(f"\n=== Response from {coach_type.upper()} ===")
            print(response)
            print("\n" + "-"*80 + "\n")

if __name__ == "__main__":
    # Test with a sample question
    sample_question = "What are the current trends in tech hiring for entry-level positions in 2025?"
    
    # Simple demo with just one question and coach
    response = test_question(sample_question, "tavily")
    print("\n=== Response ===")
    print(response)
    
    # Uncomment to run all tests
    # run_all_tests()
    
    # Uncomment to test search functionality directly
    # test_search_directly()

"""
Note: To use this demo:

1. Make sure you have the necessary API keys in your .env file:
   TAVILY_API_KEY=your_tavily_api_key
   SERPER_API_KEY=your_serper_api_key
   
2. Run this file as a script:
   python career_coach_web_tools_demo.py
   
3. Or import and use in a Jupyter notebook:
   from career_coach_web_tools_demo import test_question
   response = test_question("What are the newest trends in AI jobs?")
"""
