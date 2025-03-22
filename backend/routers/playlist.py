from fastapi import APIRouter, HTTPException, Request, Query
from backend.routers import spotify, pydantic_models  # Import Spotify router
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
    
def detect_service(url: str):
    url_str = str(url)
    
    if "spotify.com" in url_str:
        return "spotify"
    else:
        return None

@router.get("/get-playlist/", response_model=pydantic_models.Playlist)
async def get_playlist(playlist_url: str = Query(..., description="Playlist URL")):
    logger.info(f"Received playlist URL: {playlist_url}")
    response = None
    data = None
    service = detect_service(playlist_url)

    if not service:
        raise HTTPException(status_code=400, detail="Unsupported playlist service")

    if service == "spotify":
        return await spotify.get_spotify_playlist(playlist_url)
    
    raise HTTPException(status_code=400, detail="Service not implemented yet")

@router.post("/get-playlist/")
async def post_playlist(playlist: pydantic_models.Playlist):
    logger.info(f"Received playlist ID: {playlist.id}")
    playlist_data = await get_playlist(str(playlist.id))

    return playlist_data
