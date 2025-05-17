from fastapi import APIRouter, HTTPException, Query, Body
from backend.routers.pydantic_models import Playlist, FoundTrack, HttpsUrl  # Import Spotify router
from backend.routers.check import find
from backend.routers.download.download_tracks import download_tracks 
from fastapi.responses import StreamingResponse, FileResponse
from typing import List
import logging

from backend.routers.fetch import spotify

router = APIRouter()

result = None # globall declaration for finding songs and not to call the get_playlist again

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
    
def detect_service(url: str):
    url_str = str(url)

    if "spotify.com" in url_str:
        return "spotify"
    else:
        return None

@router.get("/get-playlist/", response_model=Playlist)
async def get_playlist(playlist_url: HttpsUrl = Query(..., description="Playlist URL")):
    logger.info(f"Received playlist URL: {playlist_url}")
    return await fetch_playlist_by_url(str(playlist_url))

@router.post("/get-playlist/")
async def post_playlist(playlist: Playlist):
    logger.info(f"Received playlist ID: {playlist.id}")
    return await fetch_playlist_by_url(str(playlist.id))  # Use the same helper


# Shared internal function
async def fetch_playlist_by_url(playlist_url: str) -> Playlist:
    service = detect_service(playlist_url)

    if not service:
        raise HTTPException(status_code=400, detail="Unsupported playlist service")

    if service == "spotify":
        result = await spotify.get_spotify_playlist(playlist_url)
        return result

    raise HTTPException(status_code=400, detail="Service not implemented yet")

@router.post("/find-tracks/")
async def find_tracks(playlist: Playlist = Body(...)):
    logger.info(f"Received playlist ID: {playlist.id}")
    return await find.find_songs(playlist)
    
@router.post(
    "/download-tracks/",
    response_model=None,
    response_class=StreamingResponse,
    # tell OpenAPI this returns a ZIP, not JSON
    responses={
        200: {
            "content": {
                "application/zip": {
                    "schema": {"type": "string", "format": "binary"}
                }
            },
            "description": "A zip file containing all selected tracks"
        }
    },
)
async def download_tracks_endpoint(tracks: List[FoundTrack] = Body(...)):
    return await download_tracks(tracks)