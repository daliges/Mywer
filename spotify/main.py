from fastapi import FastAPI, Query, HTTPException
from spotify import get_spotify_playlist, get_spotify_token
import os
import requests

app = FastAPI()

@app.get("/playlist")
async def get_playlist(playlist_url: str = Query(...)):
    return await get_spotify_playlist(playlist_url)

@app.get("/get-spotify-track/")
def get_spotify_track(name: str, artist: str):
    # Get Spotify token
    token = get_spotify_token()
    if not token:
        raise HTTPException(status_code=500, detail="Spotify auth failed")
    headers = {"Authorization": f"Bearer {token}"}
    q = f'track:{name} artist:{artist}'
    url = "https://api.spotify.com/v1/search"
    params = {"q": q, "type": "track", "limit": 1}
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Spotify API error: {str(e)}")
    try:
        data = resp.json()
        items = data.get("tracks", {}).get("items", [])
        if not items:
            return {"spotify_url": None, "preview_url": None}
        track = items[0]
        return {
            "spotify_url": track.get("external_urls", {}).get("spotify"),
            "preview_url": track.get("preview_url")
        }
    except (ValueError, KeyError):
        raise HTTPException(status_code=502, detail="Invalid Spotify API response")
