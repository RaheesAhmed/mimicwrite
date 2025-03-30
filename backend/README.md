# Human-Like Writing Generator - Backend

A FastAPI-based backend service for generating human-like content by mimicking a user's writing style while avoiding detection by AI content detectors.

## Tech Stack

- **API Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **AI Model**: Google's gemini-2.5-pro-exp-03-25
- **NLP Processing**: spaCy with en_core_web_sm model
- **Environment**: Python 3.9+ with virtual environment

## Features

- Writing style analysis using NLP (tone, vocabulary level, sentence structure)
- Content generation with customizable parameters:
  - Content type (article, blog post, social media post, etc.)
  - Content length (very short to very long)
  - Optional tone override
- Both synchronous and streaming response endpoints
- Integration with Google's Gemini API for high-quality text generation
- CORS support for frontend integration

## API Endpoints

- **POST /generate** - Generate content synchronously
- **GET /generate/stream** - Generate content with streaming response

## Getting Started

1. **Set up a virtual environment**:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. **Install dependencies**:

```bash
pip install fastapi uvicorn google-generativeai spacy python-dotenv
python -m spacy download en_core_web_sm
```

3. **Set up environment variables**:

Create a `.env` file with:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run the server**:

```bash
uvicorn main:app --reload
```

5. The API will be available at [http://localhost:8000](http://localhost:8000)

## API Documentation

Once the server is running, you can access the auto-generated API documentation:

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Request Example

```json
{
  "user_info": {
    "job": "software engineer"
  },
  "writing_sample": "I love coding because it's fun and challenging. When I solve a problem, I feel accomplished.",
  "prompt": "Benefits of learning to code",
  "content_type": "blogPost",
  "content_length": "medium"
}
```

## Development

- The main application is defined in `main.py`

## Learn More

This project is part of the Human-Like Writing Generator system that helps content creators avoid false positives in AI detection systems while maintaining their authentic writing voice.

For more information about the overall project, check the main [README.md](../README.md) in the root directory.
