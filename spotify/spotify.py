from fastapi import APIRouter, HTTPException
from mywer_models.models import Playlist
from dotenv import load_dotenv
import requests
import re
import os

load_dotenv()

router = APIRouter()

SPOTIFY_API_URL = "https://api.spotify.com/v1"

# Function to transform API response
def transform_spotify_response(data: dict) -> dict:
    playlist_name = data.get("name", "Unknown Playlist")
    tracks = []

    for item in data["tracks"]["items"]:
        track_info = item.get("track", {})
        
        # Extracting required fields
        song_name = track_info.get("name", "Unknown Song")
        album_info = track_info.get("album", {})
        album_name = album_info.get("name", "Unknown Album")
        artists = [{"name": artist["name"]} for artist in track_info.get("artists", [])]
        # Get album art (prefer medium size, fallback to first)
        album_images = album_info.get("images", [])
        album_art = None
        if album_images:
            album_art = album_images[1]["url"] if len(album_images) > 1 else album_images[0]["url"]
        duration = track_info.get("duration_ms")
        isrc = None
        # ISRC is under external_ids if present
        if "external_ids" in track_info:
            isrc = track_info["external_ids"].get("isrc")
        # --- Add external_url (Spotify track URL) ---
        external_url = None
        if "external_urls" in track_info and "spotify" in track_info["external_urls"]:
            external_url = track_info["external_urls"]["spotify"]
        tracks.append({
            "track": {
                "name": song_name,
                "album": {"name": album_name},
                "artists": artists,
                "albumArt": album_art,  # <-- add albumArt here
                "duration": int(duration / 1000) if duration else None,
                "isrc": isrc,
                "external_url": external_url  # <-- ensure this is always present
            }
        })

    return {"id": data["external_urls"]["spotify"], "tracks": {"items": tracks}}

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

    transformed_data.pop("id", None)  # Removes Spotify's 'id' if it exists
    return Playlist(id=playlist_url, **transformed_data)