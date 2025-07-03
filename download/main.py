from fastapi import FastAPI, Body
from download.download_tracks import download_tracks
from fastapi.responses import StreamingResponse

app = FastAPI()


@app.post("/download")
async def download(tracks=Body(...)):
    return await download_tracks(tracks)
