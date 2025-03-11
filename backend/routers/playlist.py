from fastapi import APIRouter, HTTPException, Query
from backend.routers import spotify  # Import Spotify router
import re

router = APIRouter()

def detect_service(url: str):
    if "spotify.com" in url:
        return "spotify"
    else:
        return None

@router.get("/get-playlist/")
async def get_playlist(playlist_url: str = Query(..., description="Playlist URL")):
    service = detect_service(playlist_url)
    if not service:
        raise HTTPException(status_code=400, detail="Unsupported playlist service")

    if service == "spotify":
        return await spotify.get_spotify_playlist(playlist_url)
    
    raise HTTPException(status_code=400, detail="Service not implemented yet")