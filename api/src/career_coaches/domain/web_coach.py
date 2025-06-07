"""
Web-Enabled Career Coach Implementation

This module provides a career coach with web search capabilities,
allowing for access to current information about job markets, trends, and career advice.
"""

import os
from typing import List, Dict, Any, Optional

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain.tools import Tool, BaseTool

from career_coaches.config import settings
from career_coaches.domain.coach import Coach
from career_coaches.domain.coach_factory import get_coach_by_id
from career_coaches.application.conversation_service.workflow.tools import (
    get_tavily_search_tool,
    get_serper_search_tool,
    get_duckduckgo_search_tool,
    get_available_web_tools,
)


class WebEnabledCareerCoach:
    """Career coach with web search capabilities"""
    
    def __init__(
        self, 
        coach_type: str = "career_assessment",
        search_tool_name: str = "all"
    ):
        """
        Initialize a career coach with web search capabilities
        
        Args:
            coach_type: Type of career coach (career_assessment, resume_builder, etc.)
            search_tool_name: Name of the search tool to use ('tavily', 'serper', 'ddg', or 'all')
        """
        self.coach = get_coach_by_id(coach_type)
        self.coach_type = coach_type
        self.search_tool_name = search_tool_name
        
        # Create LangChain model from settings
        self.model = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_LLM_MODEL,
            temperature=0.7,
        )
        
        # Set up tools based on the search tool name
        self.tools = self._setup_search_tools(search_tool_name)
    
    def _setup_search_tools(self, tool_name: str) -> List[BaseTool]:
        """
        Set up search tools based on the specified tool name
        
        Args:
            tool_name: 'tavily', 'serper', 'ddg', or 'all'
            
        Returns:
            List of search tools to use
        """
        if tool_name == "tavily":
            tool = get_tavily_search_tool()
            return [tool] if tool else []
        elif tool_name == "serper":
            tool = get_serper_search_tool()
            return [tool] if tool else []
        elif tool_name == "ddg":
            tool = get_duckduckgo_search_tool()
            return [tool] if tool else []
        else:  # "all" or any other value
            return get_available_web_tools()
    
    def search(self, query: str) -> str:
        """
        Perform a web search using the configured search tools
        
        Args:
            query: Search query
            
        Returns:
            Search results as string
        """
        if not self.tools:
            return "No search tools configured or available"
        
        # Use the first available tool for searching
        return self.tools[0].run(query)
    
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
            # No web search tools available, fallback to basic response
            return f"I don't have web search capabilities available at the moment. As a career coach, here's what I can tell you without current web data: {question}"
        
        # Create a prompt that includes access to web search
        if prompt_template is None:
            prompt_template = f"""
            You are a {self.coach.specialty} coach named {self.coach.name}.
            
            Your approach is: {self.coach.approach}
            
            You focus on: {', '.join(self.coach.focus_areas)}
            
            You have access to current information from the web.
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
