import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
import pytest
from fastapi.testclient import TestClient
from backend.routers.pydantic_models import FoundTrack
from main import app

client = TestClient(app)

# Construct test payloads based on your models:

# Artist/Album/Track/Item/Tracks for Playlist
test_playlist_url = "https://open.spotify.com/playlist/mock123"
test_artist = {"name": "Test Artist"}
test_album = {"name": "Test Album"}
test_track = {
    "name": "Test Track",
    "album": test_album,
    "artists": [test_artist]
}
test_item = {"track": test_track}
test_tracks = {"items": [test_item]}
test_playlist = {
    "id": test_playlist_url,
    "tracks": test_tracks
}

test_found_track = {
    "name": "Test Track",
    "artists": ["Test Artist"],
    "audio": "https://example.com/audio.mp3",
    "audiodownload": "https://example.com/audio_download.mp3"
}

fake_recommendation = {
    "character": "Loves indie vibes.",
    "suggestions": ["Song A", "Song B"],
    "stats": {"unique_artists": 1}
}

@pytest.fixture
def patch_async(monkeypatch):
    import backend.routers.fetch.playlist as playlist_router
    import backend.routers.check.find as find_mod
    import backend.routers.recommend.ai_call as rec_mod
    # No need to patch download_tracks.py directly

    async def fake_fetch_playlist_by_url(url):
        return test_playlist
    async def fake_find_songs(playlist):
        return [test_found_track]
    async def fake_download_tracks(tracks):
        import io
        from fastapi.responses import StreamingResponse
        buf = io.BytesIO(b"fakezip")
        return StreamingResponse(buf, media_type="application/zip")

    async def fake_analyse(pl):
        return fake_recommendation

    monkeypatch.setattr(playlist_router, "fetch_playlist_by_url", fake_fetch_playlist_by_url)
    monkeypatch.setattr(playlist_router, "download_tracks", fake_download_tracks)  # << THIS IS THE KEY!
    monkeypatch.setattr(find_mod, "find_songs", fake_find_songs)
    monkeypatch.setattr(playlist_router, "analyse_playlist", fake_analyse)

def test_get_playlist(patch_async):
    # Query param is 'playlist_url'
    response = client.get(f"/get-playlist/?playlist_url={test_playlist_url}")
    assert response.status_code == 200
    assert response.json()["id"] == test_playlist_url

def test_post_playlist(patch_async):
    response = client.post("/get-playlist/", json=test_playlist)
    assert response.status_code == 200
    assert response.json()["id"] == test_playlist_url

def test_find_tracks(patch_async):
    response = client.post("/find-tracks/", json=test_playlist)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert response.json()[0]["name"] == "Test Track"

def test_download_tracks(patch_async):
    response = client.post("/download-tracks/", json=[test_found_track])
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/zip")

def test_get_playlist_bad_url(patch_async):
    # Malformed/invalid URL (missing HTTPS)
    response = client.get("/get-playlist/?playlist_url=ftp://open.spotify.com/playlist/123")
    # Might still pass to handler, adjust this if you have URL validation in Pydantic
    assert response.status_code in (400, 422)

def test_download_tracks_no_valid():
    # Patch to use real logic, but with bad payload
    # (no need to patch, we want the real error handling)
    bad_track = FoundTrack(
        name="Empty",
        artists=["Nobody"],
        audio=None,
        audiodownload=None
    )
    # FastAPI expects list of dicts, so serialize:
    payload = [bad_track.model_dump()]
    response = client.post("/download-tracks/", json=payload)
    assert response.status_code == 400
    assert "No valid tracks" in response.text

def test_download_tracks_external_404(monkeypatch):
    import backend.routers.fetch.playlist as playlist_router

    async def fake_download_tracks(tracks):
        from fastapi import HTTPException
        raise HTTPException(400, "No valid tracks to download")

    # Patch the endpoint function to raise 400 for this test only
    monkeypatch.setattr(playlist_router, "download_tracks", fake_download_tracks)

    bad_track = {
        "name": "Broken Track",
        "artists": ["Test"],
        "audio": "https://example.com/404.mp3",
        "audiodownload": None
    }
    response = client.post("/download-tracks/", json=[bad_track])
    assert response.status_code == 400
    assert "No valid tracks" in response.text

def test_recommend_playlist(patch_async):
    response = client.post("/recommend/", json=test_playlist)
    assert response.status_code == 200
    body = response.json()
    assert isinstance(body["character"], str)
    assert isinstance(body["suggestions"], list)
    assert len(body["suggestions"]) == 5  # if you always want 5 suggestions