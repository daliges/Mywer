from fastapi import FastAPI, Body, Request, HTTPException
from httpx import request
from download_tracks import download_tracks
from fastapi.responses import StreamingResponse

app = FastAPI()

MAX_TRACKS_PER_DOWNLOAD = 30  # Set your limit here
@app.post("/download")
async def download(request: Request):
    data = await request.json()
    tracks = data.get("tracks") or data
    if isinstance(tracks, dict) and "tracks" in tracks:
        tracks = tracks["tracks"]
    if not isinstance(tracks, list):
        raise HTTPException(status_code=400, detail="Invalid tracks format")
    if len(tracks) > MAX_TRACKS_PER_DOWNLOAD:
        raise HTTPException(
            status_code=413,
            detail=f"Too many tracks requested (max {MAX_TRACKS_PER_DOWNLOAD})"
        )
    return await download_tracks(tracks)
    return await download_tracks(tracks)
