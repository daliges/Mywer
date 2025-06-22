from fastapi import FastAPI, Request
from find import find_songs
from ai_call import analyse_with_gemini, RecommendationResponse
from mywer_models.models import Playlist
import logging
import json

app = FastAPI()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

@app.post("/match")
async def match_tracks(playlist: Playlist):
    logger.info(f"Received playlist for /match: {playlist.id}")
    return await find_songs(playlist)

@app.post("/recommend")
async def recommend(request: Request):
    # Accepts JSON body with optional "count"
    body = await request.json()
    count = body.get("count", 5)
    # Remove "count" before parsing as Playlist
    playlist_data = {k: v for k, v in body.items() if k != "count"}
    playlist = Playlist(**playlist_data)
    logger.info(f"Received playlist for /recommend: {playlist.id} (count={count})")
    logger.info(f"Tracks: {playlist.tracks.items}")
    data = await analyse_with_gemini(playlist.tracks.model_dump_json(), count)
    logger.info(f"AI response: {data}")
    return RecommendationResponse(**data)
