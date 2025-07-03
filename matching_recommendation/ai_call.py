from mywer_models.models import Playlist
from pydantic import BaseModel
from typing import List, Dict

import os
import re
import google.generativeai as genai
import asyncio
from functools import partial
import logging

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
_GEMINI_MODEL = genai.GenerativeModel("gemini-2.0-flash")     # text-only model

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class RecommendationResponse(BaseModel):
    character: str
    suggestions: list[str]
    stats: dict          # any fun numbers you collected


_SYSTEM_MSG = "You are a friendly musicologist and ONLY output JSON."
_PROMPT_TEMPLATE = (
    "Given this JSON list of tracks, 1) describe the listener's personality "
    "in 3-4 sentences, 2) suggest {count} new tracks (as a list of strings, not objects!), "
    "3) output fun stats as JSON. "
    "Return exactly a JSON object with keys: character, suggestions, stats.")


def call_gemini(tracks_json: str, count: int) -> dict:
    try:
        prompt = _PROMPT_TEMPLATE.format(count=count)
        response = _GEMINI_MODEL.generate_content(
            [
                {"role": "user", "parts": [prompt + tracks_json]},
            ],
            generation_config={"temperature": 0.7},
        )
        logger.info(f"Gemini raw response: {response}")
        return response.candidates[0].content.parts[0].text.strip()
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return '{"character": "AI error", "suggestions": [], "stats": {}}'


def extract_json(text: str) -> str:
    match = re.match(r"```json\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    match = re.match(r"```\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text.strip()


def sanitize_text(s):
    # Remove control chars, excessive whitespace, and limit length
    if not isinstance(s, str):
        return ""
    s = re.sub(r"[\x00-\x1f\x7f]", "", s)
    s = s.strip()
    return s[:200]  # Limit to 200 chars


def sanitize_playlist(playlist_json):
    import json
    try:
        data = json.loads(playlist_json)
        for track in data.get("items", []):
            for k in ["name", "song", "artist", "artists", "album"]:
                if k in track:
                    if isinstance(track[k], list):
                        track[k] = [sanitize_text(x) for x in track[k]]
                    else:
                        track[k] = sanitize_text(track[k])
        return json.dumps(data)
    except Exception:
        return playlist_json


async def analyse_with_gemini(tracks_json: str, count: int = 5) -> dict:
    loop = asyncio.get_running_loop()
    raw_json = await loop.run_in_executor(None, partial(call_gemini, tracks_json, count))
    clean_json = extract_json(raw_json)
    return RecommendationResponse.model_validate_json(clean_json).model_dump()
