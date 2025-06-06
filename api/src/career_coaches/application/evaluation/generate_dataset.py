"""Generate evaluation datasets for career coaches."""

import json
from pathlib import Path
from typing import List, Dict

from career_coaches.config import settings
from career_coaches.domain.coach_factory import CoachFactory


def generate_sample_evaluation_dataset() -> List[Dict]:
    """Generate a sample evaluation dataset for career coaches.
    
    Returns:
        List of evaluation examples for different career coaching scenarios.
    """
    
    coach_factory = CoachFactory()
    available_coaches = coach_factory.get_available_coaches()
    
    evaluation_data = []
    
    # Career Assessment scenarios
    career_assessment_scenarios = [
        {
            "user_id": "user_001",
            "coach_id": "career_assessment",
            "messages": [
                {"role": "user", "content": "Hi, I'm feeling lost in my career. I have a degree in marketing but I'm not sure if it's the right path for me."},
                {"role": "assistant", "content": "I understand that feeling of uncertainty can be overwhelming. Let's explore this together. Can you tell me what specifically about marketing feels misaligned? Is it the day-to-day tasks, the industry, or perhaps the work environment?"}
            ],
            "coaching_context": "Recent graduate feeling uncertain about career direction",
            "expected_outcomes": ["skills_assessment", "career_exploration", "goal_setting"]
        },
        {
            "user_id": "user_002", 
            "coach_id": "career_assessment",
            "messages": [
                {"role": "user", "content": "I've been in accounting for 10 years but I'm burned out. I want to change careers but don't know what else I could do."},
                {"role": "assistant", "content": "Career transitions after a decade in one field can feel daunting, but your experience is valuable. Let's start by identifying your transferable skills and what aspects of work energize you. What did you enjoy most about accounting, and what would you want to avoid in your next role?"}
            ],
            "coaching_context": "Mid-career professional seeking career change",
            "expected_outcomes": ["transferable_skills_analysis", "career_transition_planning", "industry_exploration"]
        }
    ]
    
    # Resume Builder scenarios
    resume_builder_scenarios = [
        {
            "user_id": "user_003",
            "coach_id": "resume_builder", 
            "messages": [
                {"role": "user", "content": "I'm applying for software engineering roles but I'm not getting any interviews. I think my resume might be the problem."},
                {"role": "assistant", "content": "Let's optimize your resume for better results. First, are you tailoring your resume for each application? And are you including relevant keywords from the job descriptions? I'd also like to know about your technical projects and quantifiable achievements we can highlight."}
            ],
            "coaching_context": "Software engineer struggling with interview callbacks",
            "expected_outcomes": ["ats_optimization", "keyword_strategy", "achievement_quantification"]
        }
    ]
    
    # LinkedIn Optimizer scenarios  
    linkedin_scenarios = [
        {
            "user_id": "user_004",
            "coach_id": "linkedin_optimizer",
            "messages": [
                {"role": "user", "content": "I want to build my personal brand on LinkedIn but I don't know where to start. My profile is pretty basic."},
                {"role": "assistant", "content": "Building a strong LinkedIn presence is a great career investment. Let's start with your profile foundation. What's your target audience - are you looking to attract recruiters, potential clients, or industry peers? And what unique value or expertise do you want to be known for?"}
            ],
            "coaching_context": "Professional wanting to build LinkedIn presence",
            "expected_outcomes": ["profile_optimization", "content_strategy", "personal_branding"]
        }
    ]
    
    # Networking Strategy scenarios
    networking_scenarios = [
        {
            "user_id": "user_005",
            "coach_id": "networking_strategy",
            "messages": [
                {"role": "user", "content": "I'm an introvert and networking events make me anxious. But I know I need to network for my career. Any advice?"},
                {"role": "assistant", "content": "Networking doesn't have to mean working a room at large events. As an introvert, you can leverage your natural strengths for deeper, one-on-one connections. Let's explore strategies that feel authentic to you - like informational interviews, online networking, or smaller industry meetups. What's your comfort zone, and what specific career goals are driving your networking needs?"}
            ],
            "coaching_context": "Introverted professional needing networking guidance", 
            "expected_outcomes": ["introvert_networking_strategies", "authentic_relationship_building", "networking_goal_setting"]
        }
    ]
    
    # Combine all scenarios
    all_scenarios = (
        career_assessment_scenarios + 
        resume_builder_scenarios + 
        linkedin_scenarios + 
        networking_scenarios
    )
    
    return all_scenarios


def save_evaluation_dataset(dataset: List[Dict], file_path: Path) -> None:
    """Save evaluation dataset to JSON file.
    
    Args:
        dataset: List of evaluation examples
        file_path: Path to save the dataset
    """
    
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)


def load_evaluation_dataset(file_path: Path) -> List[Dict]:
    """Load evaluation dataset from JSON file.
    
    Args:
        file_path: Path to the dataset file
        
    Returns:
        List of evaluation examples
    """
    
    if not file_path.exists():
        raise FileNotFoundError(f"Evaluation dataset not found at {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


if __name__ == "__main__":
    # Generate and save sample dataset
    dataset = generate_sample_evaluation_dataset()
    save_evaluation_dataset(dataset, settings.CAREER_EVALUATION_DATASET_FILE_PATH)
    print(f"Generated evaluation dataset with {len(dataset)} examples")
    print(f"Saved to: {settings.CAREER_EVALUATION_DATASET_FILE_PATH}")
