from fastapi import APIRouter, HTTPException, Request, Query
from backend.routers import spotify  # Import Spotify router
from pydantic import BaseModel, HttpUrl
import re

router = APIRouter()

class PlaylistSchema(BaseModel):
    url: HttpUrl
    name_song: str
    artist: str
    album: str | None
    
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

@router.post("/post-playlist/")
async def post_playlist(playlist: PlaylistSchema):
    return playlist