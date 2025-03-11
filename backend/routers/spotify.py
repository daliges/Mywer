from fastapi import APIRouter, HTTPException
import requests
import re
import os

router = APIRouter()

SPOTIFY_API_URL = "https://api.spotify.com/v1"

def extract_playlist_id(url: str):
    match = re.search(r"playlist/([a-zA-Z0-9]+)", url)
    return match.group(1) if match else None

def get_spotify_token():
    url = "https://accounts.spotify.com/api/token"
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")

    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    response = requests.post(url, data=data, headers=headers)
    
    if response.status_code == 200:
        return response.json()["access_token"]
    
    return None

async def get_spotify_playlist(playlist_url: str):
    playlist_id = extract_playlist_id(playlist_url)
    if not playlist_id:
        raise HTTPException(status_code=400, detail="Invalid URL")

    token = get_spotify_token()
    if not token:
        raise HTTPException(status_code=500, detail="Failed to authenticate with Spotify")

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{SPOTIFY_API_URL}/playlists/{playlist_id}", headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch playlist")

    return response.json()