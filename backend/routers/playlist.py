from fastapi import APIRouter, HTTPException, Request, Query
from backend.routers import spotify, pydantic_models  # Import Spotify router
import json

router = APIRouter()
    
def detect_service(url: str):
    if "spotify.com" in url:
        return "spotify"
    else:
        return None

@router.get("/get-playlist/", response_model=pydantic_models.Playlist)
async def get_playlist(playlist_url: str = Query(..., description="Playlist URL")):
    response = None
    data = None
    service = detect_service(playlist_url)

    if not service:
        raise HTTPException(status_code=400, detail="Unsupported playlist service")

    if service == "spotify":
        response = await spotify.get_spotify_playlist(playlist_url)

        data = spotify.transform_spotify_response(response)

        # Include the user-provided URL as the playlist ID
        return pydantic_models.Playlist(id=playlist_url, **data)



# @router.post("/get-playlist/")
# async def post_playlist(playlist: pydantic_models.Playlist):
#     playlist_data = await get_playlist(playlist.external_urls)

#     if not playlist_data or "tracks" not in playlist_data:
#         raise HTTPException(status_code=400, detail="Invalid playlist data")

#     transformed_data = {
#         "tracks": playlist_data["tracks"]
#     }

#     # Use ** to unpack the dictionary safely
#     playlist_parsed = pydantic_models.Playlist(**transformed_data)

#     return playlist_parsed
