from fastapi.testclient import TestClient
from spotify.main import app

client = TestClient(app)


def test_playlist_missing_param():
    resp = client.get("/playlist")
    assert resp.status_code == 422
