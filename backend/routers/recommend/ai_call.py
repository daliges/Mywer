from backend.routers.pydantic_models import Playlist
from pydantic import BaseModel
import openai, os

openai.api_key = os.getenv("OPENAI_API_KEY")

class RecommendationResponse(BaseModel):
    character: str
    suggestions: list[str]
    stats: dict          # any fun numbers you collected

async def analyse_playlist(pl: Playlist) -> RecommendationResponse:
    prompt = (
        "Given this JSON list of tracks, 1) describe the listener's personality "
        "in 3-4 sentences, 2) suggest 5 new tracks, 3) output fun stats as JSON."
    )
    chat = await openai.ChatCompletion.acreate(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Only output JSON."},
            {"role": "user", "content": prompt + pl.tracks.json()},
        ],
    )
    data = chat.choices[0].message.json_loads()
    return RecommendationResponse(**data)