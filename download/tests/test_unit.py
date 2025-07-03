import pytest
from download.download_tracks import _safe, download_tracks, MAX_TRACKS
from fastapi.responses import JSONResponse, StreamingResponse

def test_safe_basic():
    assert _safe("abc", "fallback") == "abc"
    assert _safe(None, "fallback") == "fallback"
    assert _safe("a/b:c", "fallback") == "a_b_c"

@pytest.mark.asyncio
async def test_download_tracks_empty():
    # No tracks given
    resp = await download_tracks([])
    assert isinstance(resp, JSONResponse)
    assert resp.status_code == 400
    assert "No exact matches" in resp.body.decode()

@pytest.mark.asyncio
async def test_download_tracks_too_many():
    # Exceed the MAX_TRACKS limit
    tracks = [{}] * (MAX_TRACKS + 1)
    resp = await download_tracks(tracks)
    assert isinstance(resp, JSONResponse)
    assert resp.status_code == 400
    assert f"Maximum allowed is {MAX_TRACKS}" in resp.body.decode()

@pytest.mark.asyncio
async def test_download_tracks_not_found_url(monkeypatch):
    # Provide a track without audio url
    tracks = [{"name": "Track1", "artists": ["A"]}]
    resp = await download_tracks(tracks)
    assert isinstance(resp, JSONResponse)
    assert resp.status_code == 400
    assert b"No exact matches" in resp.body

@pytest.mark.asyncio
async def test_download_tracks_http_fail(monkeypatch):
    # Simulate HTTP error when downloading a track
    class FakeSession:
        async def __aenter__(self): return self
        async def __aexit__(self, *a): pass
        async def get(self, url, timeout): return self
        @property
        def status(self): return 404
        async def read(self): return b''
    
    monkeypatch.setattr("aiohttp.ClientSession", lambda: FakeSession())
    tracks = [{"name": "Track1", "artists": ["A"], "audiodownload": "http://fake-url"}]
    resp = await download_tracks(tracks)
    assert isinstance(resp, JSONResponse) or isinstance(resp, StreamingResponse)

@pytest.mark.asyncio
async def test_download_tracks_exception(monkeypatch):
    # Simulate exception inside the download
    class FakeResp:
        async def __aenter__(self): raise Exception("Boom!")
        async def __aexit__(self, *a): pass
    class FakeSession:
        async def __aenter__(self): return self
        async def __aexit__(self, *a): pass
        def get(self, url, timeout): return FakeResp()

    monkeypatch.setattr("aiohttp.ClientSession", lambda: FakeSession())
    tracks = [{"name": "Track1", "artists": ["A"], "audiodownload": "http://fake-url"}]
    resp = await download_tracks(tracks)
    assert isinstance(resp, JSONResponse)
    assert resp.status_code == 400


def test_safe_edge_cases():
    assert _safe("", "fallback") == "fallback"
    assert _safe(":"*200, "fallback").startswith("_")
    assert len(_safe("a"*200, "fallback")) <= 150