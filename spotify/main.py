from fastapi import FastAPI, Query, HTTPException
from spotify import get_spotify_playlist

app = FastAPI()

@app.get("/playlist")
async def get_playlist(playlist_url: str = Query(...)):
    return await get_spotify_playlist(playlist_url)
