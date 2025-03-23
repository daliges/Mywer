from fastapi import FastAPI
from backend.middleware import limiter
from backend.routers import main_router
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import pathlib
import uvicorn

app = FastAPI()

# Serve static files (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Include routers
app.include_router(main_router)
# app.include_router(limiter.router)

# backend.middleware.limiter = limiter

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/", response_class=HTMLResponse)
async def root():
    html_file = pathlib.Path("frontend/homepage.html").read_text()
    return HTMLResponse(content=html_file)

if __name__ == "__main__": # you can run this file directly to start the server (python main.py)
    uvicorn.run("main:app", port=8000, reload=True)