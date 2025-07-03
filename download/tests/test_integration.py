from fastapi.testclient import TestClient
from download.main import app

client = TestClient(app)


def test_download_empty():
    resp = client.post("/download", json=[])
    assert resp.status_code in (400, 200)
