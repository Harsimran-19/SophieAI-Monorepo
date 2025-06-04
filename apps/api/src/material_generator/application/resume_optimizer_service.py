# services/resume/optimizer.py
import json
import concurrent.futures
import os
from typing import Optional, Dict, Any, List

from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel

from material_generator.application.job_processor import JobProcessor
from material_generator.application.resume_data_extractor import ResumeDataExtractionService
from common.domain.logger import get_logger
from material_generator.domain.prompts import EXPERIENCE, SKILLS, PROJECTS, EDUCATIONS, CERTIFICATIONS, ACHIEVEMENTS
from material_generator.domain.models import Experiences, SkillSections, Projects, Educations, Certifications, Achievements
from material_generator.config import settings

section_mapping = {
    "work_experience": {"prompt":EXPERIENCE, "schema": Experiences},
    "skill_section": {"prompt":SKILLS, "schema": SkillSections},
    "projects": {"prompt":PROJECTS, "schema": Projects},
    "education": {"prompt":EDUCATIONS, "schema": Educations},
    "certifications": {"prompt":CERTIFICATIONS, "schema": Certifications},
    "achievements": {"prompt":ACHIEVEMENTS, "schema": Achievements},
}

class ResumeOptimizationService:
    def __init__(self, llm: Optional[BaseChatModel] = None):
        self.logger = get_logger(self.__class__.__name__)
        
        # Initialize ChatGroq model if not provided
        if llm is None:
            try:
                self.llm = ChatGroq(
                    api_key=settings.GROQ_API_KEY,
                    model_name=settings.GROQ_LLM_MODEL,
                    temperature=0.2,
                    max_tokens=4096
                )
                self.logger.info(f"Initialized ChatGroq with model {settings.GROQ_LLM_MODEL}")
            except Exception as e:
                self.logger.error(f"Failed to initialize ChatGroq: {str(e)}")
                raise
        else:
            self.llm = llm
            
        self.job_processor = JobProcessor(self.llm)
        self.data_extractor = ResumeDataExtractionService(self.llm)
    def optimize_resume(self, resume_path, job_description=None, job_url=None, return_latex=False):
        """Full resume optimization pipeline"""
        self.logger.info("Starting resume optimization", resume_path=resume_path)
        
        try:
            # Data extraction
            user_data = self.data_extractor.extract_user_data(resume_path)
            job_details = self.job_processor.extract_job_details(
                url=job_url, 
                job_text=job_description
            )
            # Resume building
            self.logger.debug("Building optimized resume sections")
            resume_content = self._build_resume_sections(job_details, user_data)
            self.logger.debug("Returning LaTeX content")
            return resume_content

        except Exception as e:
            self.logger.error("Resume optimization failed", error=str(e))
            raise

    def _build_resume_sections(self, job_details, user_data):
        """Internal method to build resume sections using multithreading for efficiency"""
        resume_content = {
            "personal": self._get_personal_info(user_data),
            "keywords": ', '.join(job_details.get('keywords', []))
        }

        sections = ['work_experience', 'projects', 'skill_section', 
                    'education', 'certifications', 'achievements']

        results = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(sections)) as executor:
            future_to_section = {
                executor.submit(self._process_section, section, user_data.get(section, []), job_details): section 
                for section in sections
            }
            for future in concurrent.futures.as_completed(future_to_section):
                section = future_to_section[future]
                try:
                    processed = future.result()
                    results[section] = processed
                except Exception as e:
                    self.logger.warning("Section processing failed", section=section, error=str(e))
                    results[section] = None

        for section, processed in results.items():
            if processed:
                if section == "skill_section":
                    resume_content[section] = [item for item in processed 
                                               if len(item.get('skills', [])) > 0]
                else:
                    resume_content[section] = processed

        return resume_content

    def _get_personal_info(self, user_data):
        """Extract personal information from user data"""
        return {
            "name": user_data.get("name", ""),
            "phone": user_data.get("phone", ""),
            "email": user_data.get("email", ""),
            "github": user_data.get("media", {}).get("github", ""),
            "linkedin": user_data.get("media", {}).get("linkedin", "")
        }

    def _process_section(self, section_name, section_data, job_details):
        """Process individual resume section using LLM"""
        schema_config = section_mapping.get(section_name)
        if not schema_config:
            self.logger.warning("Unknown section requested", section=section_name)
            return None

        json_parser = JsonOutputParser(pydantic_object=schema_config["schema"])
        
        prompt = PromptTemplate(
            template=schema_config["prompt"],
            partial_variables={"format_instructions": json_parser.get_format_instructions()}
        ).format(
            section_data=json.dumps(section_data),
            job_description=json.dumps(job_details)
        )

        try:
            self.logger.debug("Generating section content", section=section_name)
            # Use LangChain's ChatGroq to get the response
            chain = prompt | self.llm | json_parser
            response = chain.invoke({})
            
            # Ensure the response is a dictionary
            if isinstance(response, str):
                try:
                    response = json.loads(response)
                except json.JSONDecodeError:
                    self.logger.error("Failed to parse LLM response as JSON", section=section_name)
                    return None
            
            if not response or section_name not in response:
                self.logger.warning("Invalid section response", section=section_name)
                return None
                
            return response[section_name]
            
        except json.JSONDecodeError as e:
            self.logger.error("Failed to parse section JSON", section=section_name, error=str(e))
            return None
        except Exception as e:
            self.logger.error("Section generation failed", section=section_name, error=str(e))
            return None

    def calculate_metrics(self, resume_details, user_data, job_details):
        """Calculate alignment metrics"""
        metrics = {}
        for metric_name in ['jaccard_similarity', 'overlap_coefficient', 'cosine_similarity']:
            try:
                metrics[metric_name] = {
                    "user_personalization": globals()[metric_name](
                        json.dumps(resume_details), 
                        json.dumps(user_data)
                    ),
                    "job_alignment": globals()[metric_name](
                        json.dumps(resume_details), 
                        json.dumps(job_details)
                    ),
                    "job_match": globals()[metric_name](
                        json.dumps(user_data), 
                        json.dumps(job_details)
                    )
                }
            except Exception as e:
                self.logger.warning("Metric calculation failed", metric=metric_name, error=str(e))
                
        return metrics