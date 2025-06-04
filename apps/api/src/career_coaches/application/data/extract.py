"""Data extraction utilities for career coaching content."""

from langchain_core.documents import Document
from typing import List, Generator, Tuple


def create_sample_career_documents() -> List[Document]:
    """Create sample career coaching documents for testing and initial setup.
    
    Returns:
        List of Document objects containing career coaching knowledge.
    """
    
    documents = [
        # Career Assessment Documents
        Document(
            page_content="""
            Career assessment is a systematic process of evaluating an individual's skills, interests, 
            values, and personality traits to identify suitable career paths. Key components include:
            
            1. Skills Assessment: Identifying technical and soft skills
            2. Interest Inventory: Understanding what motivates and engages you
            3. Values Clarification: Determining what's important in work and life
            4. Personality Assessment: Understanding work style preferences
            5. Market Analysis: Researching industry trends and opportunities
            
            Popular assessment tools include StrengthsFinder, Myers-Briggs Type Indicator (MBTI), 
            Holland Code (RIASEC), and Values in Action (VIA) Character Strengths.
            """,
            metadata={"source": "career_assessment_guide", "category": "assessment"}
        ),
        
        # Resume Building Documents
        Document(
            page_content="""
            Modern resume writing focuses on ATS (Applicant Tracking System) optimization while 
            maintaining human readability. Key principles include:
            
            1. ATS Optimization: Use standard fonts, clear headings, and relevant keywords
            2. Quantified Achievements: Include specific numbers and metrics
            3. Action Verbs: Start bullet points with strong action words
            4. Tailored Content: Customize for each job application
            5. Clean Format: Use consistent formatting and white space
            
            Resume sections should include: Contact Information, Professional Summary, 
            Work Experience, Education, Skills, and relevant additional sections like 
            Certifications or Projects.
            """,
            metadata={"source": "resume_writing_guide", "category": "resume"}
        ),
        
        # LinkedIn Optimization Documents
        Document(
            page_content="""
            LinkedIn optimization involves creating a compelling professional presence that 
            attracts opportunities. Key strategies include:
            
            1. Professional Headline: Clear, keyword-rich description of your value proposition
            2. Summary Section: Compelling narrative of your professional story
            3. Experience Descriptions: Achievement-focused with quantified results
            4. Skills & Endorsements: Strategic selection of relevant skills
            5. Content Strategy: Regular posting of industry-relevant content
            6. Network Building: Strategic connection requests and engagement
            
            LinkedIn's algorithm favors profiles with complete information, regular activity, 
            and meaningful engagement with others' content.
            """,
            metadata={"source": "linkedin_optimization_guide", "category": "linkedin"}
        ),
        
        # Networking Strategy Documents
        Document(
            page_content="""
            Strategic networking focuses on building authentic professional relationships 
            that provide mutual value. Effective networking strategies include:
            
            1. Goal Setting: Define what you want to achieve through networking
            2. Target Identification: Identify key people and organizations in your field
            3. Value Proposition: Understand what you can offer to others
            4. Multiple Channels: Combine online and offline networking approaches
            5. Follow-up Systems: Maintain relationships through regular contact
            6. Giving First: Offer help and value before asking for assistance
            
            Networking events, industry conferences, professional associations, and 
            informational interviews are all valuable networking opportunities.
            """,
            metadata={"source": "networking_strategy_guide", "category": "networking"}
        ),
        
        # Interview Preparation Documents
        Document(
            page_content="""
            Interview preparation involves researching the company, practicing responses, 
            and preparing thoughtful questions. Key preparation steps include:
            
            1. Company Research: Understand mission, values, recent news, and culture
            2. Role Analysis: Study job description and required qualifications
            3. STAR Method: Prepare situation, task, action, result examples
            4. Common Questions: Practice responses to frequently asked questions
            5. Questions to Ask: Prepare insightful questions about the role and company
            6. Professional Presentation: Plan appropriate attire and materials
            
            Mock interviews and recording practice sessions can help improve 
            confidence and delivery.
            """,
            metadata={"source": "interview_preparation_guide", "category": "interview"}
        ),
    ]
    
    return documents


def get_career_extraction_generator(documents: List[Document]) -> Generator[Tuple[str, List[Document]], None, None]:
    """Generator that yields career coaching documents for processing.
    
    Args:
        documents: List of career coaching documents
        
    Yields:
        Tuple of (category, documents) for each category
    """
    
    # Group documents by category
    categories = {}
    for doc in documents:
        category = doc.metadata.get("category", "general")
        if category not in categories:
            categories[category] = []
        categories[category].append(doc)
    
    # Yield each category
    for category, docs in categories.items():
        yield category, docs
