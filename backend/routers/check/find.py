from fastapi import HTTPException
from dotenv import load_dotenv
from pydantic import ValidationError
from backend.routers import pydantic_models
from difflib import SequenceMatcher
import requests, json, os, logging

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_similar(a, b, threshold=0.6):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio() > threshold

def search_fma_track(title):
    url = "https://archive.org/advancedsearch.php"
    params = {
        "q": f'title:"{title}" AND collection:"freemusicarchive"',
        "fl[]": "identifier,title,creator",
        "output": "json",
        "rows": 5
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        tracks = response.json()["response"]["docs"]

        for t in tracks:
            if t["title"] == title:
                return t
    return None

def search_jamendo(title, artist):
    url = os.getenv("JAMENDO_API_URL") + "/tracks"
    query = f"{title} {artist}".strip()
    params = {
        "client_id": os.getenv("JAMENDO_CLIENT_ID"),
        "format": "json",
        "search": query,
        "limit": 5
    }

    logging.info(f"Jamendo API Request: {params}")
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        results = response.json().get("results", [])

        for result in results:
            title_match = is_similar(result["name"], title)
            artist_match = is_similar(result["artist_name"], artist)
            if title_match and artist_match:
                return result  # Best match

        if results:
            return results[0]  # fallback to first

    except (requests.RequestException, ValueError, KeyError) as e:
        logging.error(f"Jamendo API error: {e}")

    return None

async def find_songs(playlist):

    found_tracks = []

    for item in playlist.tracks.items:
        song = item.track.name
        album = item.track.album.name
        artists = [artist.name for artist in item.track.artists]
        main_artist = artists[0] if artists else ""

        # Search for the song in Jamendo
        founded_song = search_jamendo(song, main_artist)

        # Optional: fallback search logic for FMA (commented out for now)
        # ...

        found_tracks.append({
            "song": song,
            "album": album,
            "artists": artists,
            "found_on_jamendo": founded_song
        })

    if not found_tracks:
        raise HTTPException(status_code=404, detail="No songs found in Free Music Archive or Jamendo")

    return found_tracks