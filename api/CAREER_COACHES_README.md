# Career Coach Agents

A sophisticated career coaching system built on the same architecture as PhiloAgents, featuring specialized AI coaches with multi-user support, long-term memory, and comprehensive evaluation capabilities.

## 🎯 Overview

The Career Coach Agents system provides four specialized AI coaches, each with unique expertise:

- **Career Assessment Agent** (`career_assessment`) - Sophie
- **Resume Builder Agent** (`resume_builder`) - Sophie
- **LinkedIn Optimizer Agent** (`linkedin_optimizer`) - Sophie
- **Networking Strategy Agent** (`networking_strategy`) - Sophie

## 🏗️ Architecture

### Multi-User Support
- **User ID Integration**: All conversations are isolated by user ID
- **Thread Management**: Conversations tracked as `{user_id}_{coach_id}`
- **Memory Isolation**: Each user maintains separate conversation history

### Core Components

```
src/
├── common/                          # Shared components
│   ├── config/base_settings.py      # Base configuration
│   ├── infrastructure/mongo/        # MongoDB utilities
│   ├── domain/exceptions.py         # Common exceptions
│   └── application/rag/             # Shared RAG components
├── career_coaches/                  # Career coach module
│   ├── domain/                      # Core models and business logic
│   ├── application/                 # Use cases and workflows
│   └── infrastructure/              # API and external integrations
└── main.py                         # Combined API entry point
```

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file with required configuration:

```bash
# LLM Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_LLM_MODEL=llama-3.3-70b-versatile

# Database
MONGO_URI=mongodb://philoagents:philoagents@local_dev_atlas:27017/?directConnection=true
MONGO_DB_NAME=ai_agents

# Monitoring (Optional)
COMET_API_KEY=your_comet_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 2. Test the System

```bash
# Test basic functionality
python test_career_coaches.py

# List available coaches
python tools/list_career_coaches.py

# Test a conversation
python tools/call_career_coach.py \
  --coach-id career_assessment \
  --user-id user_001 \
  --query "I need help with my career direction"
```

### 3. Start the API

```bash
# Combined API (includes both PhiloAgents and Career Coaches)
python src/main.py

# Career Coaches only
python src/career_coaches/infrastructure/api.py
```

## 🤖 Available Coaches

### Sophie - Career Assessment
- **Specialty**: Career Assessment & Path Planning
- **Focus**: MBTI, Strong Interest Inventory, PRINT, Holland Code assessments
- **Approach**: Comprehensive self-discovery through personality and interest assessments

### Sophie - Resume Builder
- **Specialty**: Resume Writing & ATS Optimization
- **Focus**: ATS keyword optimization, tailored resume creation, cover letter crafting
- **Approach**: Job-specific optimization with international student focus

### Sophie - LinkedIn Optimizer
- **Specialty**: LinkedIn Profile & Personal Branding
- **Focus**: Profile optimization, achievement transformation, recruiter visibility
- **Approach**: Keyword-rich content while maintaining authentic voice

### Sophie - Networking Strategy
- **Specialty**: Professional Networking & Relationship Building
- **Focus**: Personalized networking plans, international student strategies
- **Approach**: MBTI-based networking with 1-month, 3-month, 5-month plans

## 📡 API Endpoints

### Combined API (`/`)
- `GET /` - Platform information
- `GET /health` - Health check
- `GET /services` - Available services

### Career Coaches API (`/career-coaches`)
- `POST /career-coaches/chat` - Single message conversation
- `WebSocket /career-coaches/ws/chat` - Streaming conversation
- `GET /career-coaches/coaches` - List available coaches
- `POST /career-coaches/reset-memory` - Reset conversation memory

### Example API Usage

```python
import requests

# Chat with career assessment coach
response = requests.post("http://localhost:8000/career-coaches/chat", json={
    "message": "I'm feeling lost in my career path",
    "coach_id": "career_assessment",
    "user_id": "user_001",
    "user_context": "Recent graduate with marketing degree",
    "session_goals": ["identify_strengths", "explore_options"]
})

print(response.json()["response"])
```

## 🛠️ CLI Tools

### Coach Management
```bash
# List all available coaches
python tools/list_career_coaches.py

# Call a specific coach
python tools/call_career_coach.py \
  --coach-id resume_builder \
  --user-id user_123 \
  --query "Help me optimize my resume for tech roles"
```

### Memory Management
```bash
# Reset memory for specific user
python tools/reset_career_coach_memory.py --user-id user_001

# Reset memory for all users (use with caution)
python tools/reset_career_coach_memory.py
```

### Long-term Memory
```bash
# Create long-term memory with sample data
python tools/create_career_coach_memory.py --use-sample-data
```

### Evaluation
```bash
# Generate evaluation dataset
python tools/generate_career_coach_evaluation_dataset.py

# Run evaluation (requires Opik setup)
python tools/evaluate_career_coach.py --dataset-name career_coach_evaluation
```

## 🧠 Memory System

### Short-term Memory
- **Conversation Context**: Maintains context within sessions
- **Automatic Summarization**: Triggered after 30 messages
- **User-specific**: Isolated per user ID

### Long-term Memory (Future Enhancement)
- **Career Knowledge Base**: Best practices, templates, strategies
- **Vector Search**: Retrieval-augmented generation capabilities
- **User Profiles**: Persistent user career information

## 📊 Evaluation & Monitoring

### Metrics
- **Response Relevance**: How well responses address career needs
- **Actionability**: Practical value of advice provided
- **Expertise Demonstration**: Quality of domain knowledge
- **Empathy & Support**: Supportive coaching approach

### Monitoring
- **Opik Integration**: Conversation tracking and analytics
- **Performance Metrics**: Response times, user satisfaction
- **A/B Testing**: Different coaching approaches

## 🔧 Development

### Adding New Coaches

1. **Update Coach Factory** (`career_coaches/domain/coach_factory.py`)
2. **Add Coach Configuration** (name, specialty, approach, focus areas)
3. **Create Specific Prompts** (`career_coaches/domain/prompts.py`)
4. **Test Integration** with existing workflow

### Extending Functionality

1. **RAG Integration**: Add retrieval tools to workflow
2. **Custom Tools**: Implement coach-specific tools
3. **Advanced Memory**: User profile persistence
4. **Integration APIs**: External career services

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **Environment Variables**: Check `.env` file configuration
3. **Import Errors**: Verify Python path includes `src/` directory
4. **API Keys**: Ensure GROQ_API_KEY is valid

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python tools/call_career_coach.py --coach-id career_assessment --user-id debug_user --query "test"
```

## 🤝 Contributing

1. Follow the existing architecture patterns
2. Maintain multi-user support in all features
3. Add comprehensive tests for new functionality
4. Update documentation for new coaches or features

## 📄 License

Same license as the parent PhiloAgents project.
