from fastapi import FastAPI
from pydantic import BaseModel, HttpUrl
from backend.routers import limiter, playlist
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import pathlib
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI()

# Serve static files (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Include routers
app.include_router(playlist.router)
# app.include_router(limiter.router)

app.state.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/", response_class=HTMLResponse)
async def root():
    html_file = pathlib.Path("frontend/homepage.html").read_text()
    return HTMLResponse(content=html_file)