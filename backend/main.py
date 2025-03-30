import os
from typing import Dict, Any, Optional
import logging
from fastapi import FastAPI, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.responses import StreamingResponse # type: ignore
from pydantic import BaseModel, Field # type: ignore
from google import genai # type: ignore
from google.genai import types # type: ignore
import spacy # type: ignore
from dotenv import load_dotenv # type: ignore
import re

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize API
app = FastAPI(
    title="Human-Like Writing Generator API",
    description="API for generating human-like content that mimics a user's writing style",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modify in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini API client - updated for new SDK
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

client = genai.Client(api_key=api_key)
MODEL_NAME = "gemini-2.5-pro-exp-03-25"  # Updated to match working example

# Load spaCy model for NLP analysis
nlp = spacy.load("en_core_web_sm")

# Pydantic models
class UserInfo(BaseModel):
    job: str = Field(..., description="User's profession or role")
    
class GenerationRequest(BaseModel):
    user_info: UserInfo
    writing_sample: str = Field(..., description="Sample of user's writing to analyze and mimic")
    prompt: str = Field(..., description="The topic or context for content generation")
    content_type: str = Field("article", description="Type of content to generate (article, blogPost, socialPost, etc.)")
    content_length: str = Field("medium", description="Desired length of the generated content")
    preferred_tone: Optional[str] = Field(None, description="Optional override for tone detection")

class WritingAnalysis(BaseModel):
    tone: str
    vocab_level: str
    avg_sentence_length: float
    sample: str

class GenerationResponse(BaseModel):
    content: str
    analysis: WritingAnalysis

# Mapping for content length to approximate word count
CONTENT_LENGTH_MAP = {
    "very_short": "100-150",
    "short": "200-300",
    "medium": "500-700",
    "long": "1000-1200",
    "very_long": "1500-2000"
}

# Content type formatting guidelines
CONTENT_TYPE_GUIDELINES = {
    "article": "Create a well-structured article with clear sections, informative content, and a professional tone.",
    "blogPost": "Write an engaging blog post with a personal touch, using headings, short paragraphs, and a conversational style.",
    "socialPost": "Create a concise, engaging social media post optimized for sharing and engagement.",
    "linkedinPost": "Create a LinkedIn post announcing a project launch. Include relevant hashtags at the end if appropriate for the writing style.",
    "emailNewsletter": "Draft an email newsletter section that's scannable, informative, and encourages reader engagement.",
    "productDescription": "Create a compelling product description that highlights features, benefits, and value propositions."
}

# Function to analyze user writing sample
def analyze_writing_sample(writing_sample: str) -> Dict[str, Any]:
    """
    Analyze a writing sample to extract stylistic features.
    """
    doc = nlp(writing_sample)
    sentences = list(doc.sents)
    avg_sentence_length = sum(len(sent) for sent in sentences) / len(sentences) if sentences else 0
    vocab = set(token.text.lower() for token in doc if token.is_alpha)
    tone = "casual" if any(token.text in ["I", "'s", "fun"] for token in doc) else "formal"
    vocab_level = "simple" if len(vocab) < 15 else "advanced"
    
    return {
        "tone": tone,
        "vocab_level": vocab_level,
        "avg_sentence_length": avg_sentence_length,
        "sample": writing_sample
    }

# Function to craft system instruction
def create_system_instruction(user_info, writing_analysis, content_type, content_length, prompt, preferred_tone=None):
    # Use preferred tone if provided, otherwise use detected tone
    tone = preferred_tone if preferred_tone else writing_analysis['tone']
    
    # Get formatting guidelines based on content type
    content_guidelines = CONTENT_TYPE_GUIDELINES.get(content_type, "Create well-structured content with clear organization.")
    
    # Get word count range based on length preference
    word_count = CONTENT_LENGTH_MAP.get(content_length, "500-700")
    
    # For LinkedIn posts
    if content_type == "linkedinPost":
        return f"""You are an AI mimicking the writing style of a {user_info['job']}. 

TASK: Write a LinkedIn post about a new project launch exactly as if it was written by this {user_info['job']}.

WRITING STYLE REFERENCE:
"{writing_analysis['sample']}"

CONTENT REQUIREMENTS:
- Follow the exact sentence structure, tone, and vocabulary level shown in the sample
- Ensure the content is naturally flowing and cohesive
- If the sample uses hashtags, include similar ones
- Match their personal/professional tone exactly (first-person vs third-person)
- Match their formality level exactly
- Use the same style of punctuation (formal vs casual)
- Never break or fragment sentences
- The post should announce a new project launch related to: "{prompt}"

TARGET LENGTH: {word_count} words
TONE: {tone} (as detected from the sample)

Write only the LinkedIn post content, nothing else."""
    
    # For other content types
    return f"""You are an AI mimicking the writing style of a {user_info['job']}. 

TASK: Write {content_type} content exactly as if it was written by this {user_info['job']}.

WRITING STYLE REFERENCE:
"{writing_analysis['sample']}"

CONTENT REQUIREMENTS:
- Follow the exact sentence structure, tone, and vocabulary level shown in the sample
- {content_guidelines}
- Ensure the content is naturally flowing and cohesive
- Match their personal/professional tone exactly (first-person vs third-person)
- Match their formality level exactly
- Use the same style of punctuation (formal vs casual)
- Never break or fragment sentences
- The content should address: "{prompt}"

TARGET LENGTH: {word_count} words
TONE: {tone} (as detected from the sample)

Write only the content, nothing else."""


@app.post("/generate", response_model=GenerationResponse)
async def generate_endpoint(request: GenerationRequest) -> GenerationResponse:
    """
    Generate human-like content based on user information and writing sample.
    """
    try:
        # Analyze writing sample
        writing_analysis = analyze_writing_sample(request.writing_sample)
        
        # Craft system instruction with new parameters
        system_instruction = create_system_instruction(
            request.user_info.dict(), 
            writing_analysis,
            request.content_type,
            request.content_length,
            request.prompt,
            request.preferred_tone
        )
        
        # Structure content exactly like working.py
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=request.prompt),
                ],
            ),
        ]
        
        # Use exactly the same format as working.py
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="text/plain",
        )
        
        # Create the system instruction exactly like working.py
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=generate_content_config,
        )
        
        return GenerationResponse(
            content=response.text,
            analysis=WritingAnalysis(**writing_analysis)
        )
    except Exception as e:
        logger.error(f"Error in generation endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/generate/stream")
async def generate_stream_endpoint(
    user_info__job: str, 
    writing_sample: str, 
    prompt: str,
    content_type: str = "article",
    content_length: str = "medium",
    preferred_tone: Optional[str] = None
):
    """
    Stream generated content in real-time.
    """
    async def content_generator():
        try:
            # Create user info dict
            user_info = {"job": user_info__job}
            
            # Analyze writing sample
            writing_analysis = analyze_writing_sample(writing_sample)
            
            # Craft system instruction with new parameters
            system_instruction = create_system_instruction(
                user_info, 
                writing_analysis,
                content_type,
                content_length,
                prompt,
                preferred_tone
            )
            
            # Add system instruction to user prompt
            enhanced_prompt = f"{system_instruction}\n\nUser request: {prompt}"
            
            # Structure content exactly like working.py
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=enhanced_prompt),
                    ],
                ),
            ]
            
            # Use exactly the same format as working.py
            generate_content_config = types.GenerateContentConfig(
                response_mime_type="text/plain",
            )
            
            # Stream the response
            for chunk in client.models.generate_content_stream(
                model=MODEL_NAME,
                contents=contents,
                config=generate_content_config
            ):
                if hasattr(chunk, 'text'):
                    yield f"data: {chunk.text}\n\n"
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            logger.error(f"Error in streaming endpoint: {str(e)}")
            yield f"data: error: {str(e)}\n\n"
    
    return StreamingResponse(
        content_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "Access-Control-Allow-Origin": "*",
        },
    )

if __name__ == "__main__":
    import uvicorn # type: ignore
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)