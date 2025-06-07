import json
from typing import Optional, Dict, Any, Union

from common.domain.logger import get_logger
from material_generator.domain.models import JobDetails
from material_generator.application.data_extraction import read_data_from_url
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.language_models.chat_models import BaseChatModel
from material_generator.domain.prompts import JOB_DETAILS_EXTRACTOR
from material_generator.config import settings

class JobProcessor:
    def __init__(self, llm: BaseChatModel):
        self.logger = get_logger(self.__class__.__name__)
        self.llm = llm
    
    def extract_job_details(self, url=None, job_text=None):
        """Common job details extraction logic"""
        self.logger.info("Extracting job details", url=url, has_job_text=bool(job_text))
        
        try:
            if url:
                self.logger.debug("Reading data from URL", url=url)
                job_text = read_data_from_url(url)
            
            json_parser = JsonOutputParser(pydantic_object=JobDetails)
            prompt = PromptTemplate(
                template=JOB_DETAILS_EXTRACTOR,
                input_variables=["job_description"],
                partial_variables={"format_instructions": json_parser.get_format_instructions()}
            ).format(job_description=job_text)

            json_parser = JsonOutputParser(pydantic_object=JobDetails)
            chain = prompt | self.llm | json_parser
            response = chain.invoke({})
            
            # Ensure the response is a dictionary if it's returned as a string
            if isinstance(response, str):
                try:
                    response = json.loads(response)
                except json.JSONDecodeError:
                    self.logger.error("Failed to parse LLM response as JSON")
                    raise
                    
            return response
        
        except Exception as e:
            self.logger.error("Job details extraction failed", error=str(e))
            raise