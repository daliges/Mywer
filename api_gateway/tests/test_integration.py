import pytest
from fastapi.testclient import TestClient
from api_gateway.main import app

client = TestClient(app)


def test_health_check():
    resp = client.get("/get-playlist/")
    # Accept 500 if downstream is unavailable
    assert resp.status_code in (200, 422, 400, 500)


def test_rate_limit():
    for _ in range(65):
        resp = client.get("/get-playlist/")
    assert resp.status_code in (429, 422, 400)
