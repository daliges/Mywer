from fastapi import APIRouter, HTTPException
from backend.routers import pydantic_models
from dotenv import load_dotenv
import requests
import re
import os

load_dotenv()

router = APIRouter()

SPOTIFY_API_URL = "https://api.spotify.com/v1"

# Function to transform API response
def transform_spotify_response(data: dict) -> dict:
    # if "tracks" not in data:
    #     raise HTTPException(status_code=500, detail="Invalid playlist data format")
    
    playlist_name = data.get("name", "Unknown Playlist")
    tracks = []

    for item in data["tracks"]["items"]:
        track_info = item.get("track", {})
        
        # Extracting required fields
        song_name = track_info.get("name", "Unknown Song")
        album_name = track_info.get("album", {}).get("name", "Unknown Album")
        artists = [artist["name"] for artist in track_info.get("artists", [])]

        tracks.append({
            "name": song_name,
            "album": album_name,
            "artists": artists
        })

    return {"name": playlist_name, "tracks": tracks}

def extract_playlist_id(url: str):
    match = re.search(r"playlist/([a-zA-Z0-9]+)", url)
    return match.group(1) if match else None

def get_spotify_token():
    url = "https://accounts.spotify.com/api/token"
    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")

    if not client_id or not client_secret:
        return None  # Ensure environment variables are loaded

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

    transformed_data = transform_spotify_response(response.json())
    return pydantic_models.Playlist(**transformed_data)