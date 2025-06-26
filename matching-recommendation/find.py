from fastapi import HTTPException
# from dotenv import load_dotenv
from pydantic import ValidationError
from mywer_models.models import Playlist
from difflib import SequenceMatcher
import requests, json, os, logging

# --- Vault integration ---
import hvac

def get_vault_secret(key):
    # Assumes VAULT_ADDR and VAULT_TOKEN are set in the environment
    client = hvac.Client()
    secret = client.secrets.kv.v2.read_secret_version(path='jamendo')
    return secret['data']['data'].get(key)

# load_dotenv()

# Setup logging
# logging.basicConfig(level=logging.INFO)  # <-- already commented out
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)  # Ensure logger level is INFO

if not logger.hasHandlers():
    import sys
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(name)s: %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

def is_similar(a, b, threshold=0.6):
    from difflib import SequenceMatcher
    return SequenceMatcher(None, a.lower(), b.lower()).ratio() > threshold

def is_license_allowed(license_url):
    return license_url and "creativecommons.org" in license_url

def is_duration_similar(d1, d2, tolerance=1):
    try:
        # Accept only if both durations are present and within 1 second
        if d1 is None or d2 is None:
            return False
        return abs(int(float(d1)) - int(float(d2))) <= tolerance
    except Exception:
        return False

def is_isrc_match(isrc1, isrc2):
    if not isrc1 or not isrc2:
        return False
    return isrc1.strip().upper() == isrc2.strip().upper()

def search_jamendo(title, artist, orig_duration=None, orig_isrc=None):
    logger.info(f"DEBUG: search_jamendo called with title={title}, artist={artist}, duration={orig_duration}, isrc={orig_isrc}")
    # url = os.getenv("JAMENDO_API_URL") + "/tracks"
    url = get_vault_secret("JAMENDO_API_URL") + "/tracks"
    query = f"{title} {artist}".strip()
    params = {
        # "client_id": os.getenv("JAMENDO_CLIENT_ID"),
        "client_id": get_vault_secret("JAMENDO_CLIENT_ID"),
        "format": "json",
        "search": query,
        "limit": 5
    }

    logging.info(f"Jamendo API Request: {params}")
    logging.info(f"Original: title='{title}', artist='{artist}', duration={orig_duration}, isrc={orig_isrc}")
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        results = response.json().get("results", [])
        logging.info(f"Jamendo API raw response: {response.text}")  # <--- ADD THIS LINE

        logging.info(f"Jamendo returned {len(results)} results for '{title}' by '{artist}'")
        for idx, result in enumerate(results):
            logging.info(
                f"Result {idx}: "
                f"title='{result.get('name')}', "
                f"artist='{result.get('artist_name')}', "
                f"duration={result.get('duration')}, "
                f"isrc={result.get('isrc')}, "
                f"license={result.get('license_ccurl')}"
            )

        # 1. Try strictest: ISRC match + license + duration
        if orig_isrc:
            for result in results:
                license_ok = is_license_allowed(result.get("license_ccurl", ""))
                duration_ok = is_duration_similar(result.get("duration"), orig_duration)
                isrc_ok = is_isrc_match(result.get("isrc"), orig_isrc)
                if isrc_ok and license_ok and duration_ok:
                    logging.info(f"Selected by ISRC: {result.get('name')} ({result.get('isrc')})")
                    return result

        # 2. Fallback: title+artist+license+duration
        for result in results:
            title_match = is_similar(result.get("name", ""), title)
            artist_match = is_similar(result.get("artist_name", ""), artist)
            license_ok = is_license_allowed(result.get("license_ccurl", ""))
            duration_ok = is_duration_similar(result.get("duration"), orig_duration)
            logging.info(
                f"Checking: title_match={title_match}, artist_match={artist_match}, "
                f"license_ok={license_ok}, duration_ok={duration_ok}"
            )
            if title_match and artist_match and license_ok and duration_ok:
                logging.info(f"Selected by title/artist: {result.get('name')} by {result.get('artist_name')}")
                return result

        # 3. Fallback: any with allowed license and similar duration
        for result in results:
            license_ok = is_license_allowed(result.get("license_ccurl", ""))
            duration_ok = is_duration_similar(result.get("duration"), orig_duration)
            if license_ok and duration_ok:
                logging.info(f"Selected fallback: {result.get('name')} by {result.get('artist_name')}")
                return result

        logging.info("No suitable Jamendo match found.")

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
        album_art = getattr(item.track, "albumArt", None)
        orig_duration = getattr(item.track, "duration", None)
        orig_isrc = getattr(item.track, "isrc", None)
        # --- Extract Spotify URL robustly ---
        spotify_url = getattr(item.track, "external_url", None)
        # Search for the song in Jamendo with stricter checks
        founded_song = search_jamendo(song, main_artist, orig_duration, orig_isrc)
        jamendo_url = None
        if founded_song and founded_song.get("id"):
            jamendo_url = f"https://www.jamendo.com/track/{founded_song['id']}"
        found_tracks.append({
            "song": song,
            "album": album,
            "artists": artists,
            "albumArt": album_art,
            "found_on_jamendo": founded_song,
            "not_found_reason": None if founded_song else "No copyright-free match found",
            "spotify_url": spotify_url,
            "jamendo_url": jamendo_url
        })
    if not found_tracks:
        raise HTTPException(status_code=404, detail="No songs found in Free Music Archive or Jamendo")
    return found_tracks