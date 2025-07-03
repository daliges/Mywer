from fastapi.testclient import TestClient
from matching_recommendation.main import app

client = TestClient(app)


def test_match_tracks_empty():
    resp = client.post("/match", json={
        "id": "https://open.spotify.com/playlist/123",
        "tracks": {"items": []}
    })
    assert resp.status_code == 404 or resp.status_code == 200
