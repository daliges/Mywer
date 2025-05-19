from backend.routers.pydantic_models import Playlist
from pydantic import BaseModel
from typing import List, Dict

import os, re
import google.generativeai as genai
import asyncio
from functools import partial

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_GEMINI_MODEL = genai.GenerativeModel("gemini-2.0-flash")     # text-only model

class RecommendationResponse(BaseModel):
    character: str
    suggestions: list[str]
    stats: dict          # any fun numbers you collected

_SYSTEM_MSG = "You are a friendly musicologist and ONLY output JSON."
_PROMPT = (
    "Given this JSON list of tracks, 1) describe the listener's personality "
    "in 3-4 sentences, 2) suggest 5 new tracks (as a list of strings, not objects!), "
    "3) output fun stats as JSON. "
    "Return exactly a JSON object with keys: character, suggestions, stats."
)

def call_gemini(tracks_json: str) -> dict:
    response = _GEMINI_MODEL.generate_content(
        [
            {"role": "user", "parts": [_PROMPT + tracks_json]},
            # Gemini doesn’t support an explicit “system” role in this SDK,
            # so we prepend system instructions inside the user prompt.
        ],
        generation_config={"temperature": 0.7},
    )
    return response.candidates[0].content.parts[0].text.strip()   # Gemini returns JSON text

def extract_json(text: str) -> str:
    match = re.match(r"```json\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    match = re.match(r"```\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text.strip()

async def analyse_with_gemini(tracks_json: str) -> dict:
    loop = asyncio.get_running_loop()
    raw_json = await loop.run_in_executor(None, partial(call_gemini, tracks_json))
    clean_json = extract_json(raw_json)
    return RecommendationResponse.model_validate_json(clean_json).model_dump()