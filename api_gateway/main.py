from fastapi import FastAPI, Request
import httpx
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import logging
import traceback
import time
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

# Setup logging
logger = logging.getLogger("api_gateway")
logger.setLevel(logging.INFO)
if not logger.hasHandlers():
    import sys
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        '%(asctime)s %(levelname)s %(name)s: %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# --- Rate Limiting Middleware ---
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "60"))  # requests per window
RATE_WINDOW = int(os.getenv("RATE_WINDOW", "60"))  # seconds
_client_requests = {}


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        ip = request.client.host
        now = int(time.time())
        window = now // RATE_WINDOW
        key = f"{ip}:{window}"
        count = _client_requests.get(key, 0)
        if count >= RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Try again later."}
            )
        _client_requests[key] = count + 1
        # Clean up old windows
        for k in list(_client_requests):
            if int(k.split(":")[1]) < window:
                _client_requests.pop(k)
        return await call_next(request)


app.add_middleware(RateLimitMiddleware)

# Add CORS middleware
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Not-Found"],
)

if "localhost" in CORS_ORIGINS or "*" in CORS_ORIGINS:
    logger.warning(
        "CORS is set to allow localhost or all origins. Do not use in production!")

MATCHING_URL = os.getenv(
    "MATCHING_RECOMMENDATION_URL",
    "http://matching_recommendation:8001")
DOWNLOAD_URL = os.getenv("DOWNLOAD_URL", "http://download:8002")
SPOTIFY_URL = os.getenv("SPOTIFY_URL", "http://spotify:8003")


def cors_json_error(detail, status_code=500):
    # If detail is an Exception, convert to string
    if isinstance(detail, Exception):
        detail = str(detail)
    return JSONResponse(
        status_code=status_code,
        content={"detail": detail},
        headers={
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Expose-Headers": "Content-Disposition, X-Not-Found"
        }
    )


def _clean_headers(headers):
    """Remove headers that should not be forwarded."""
    h = dict(headers)
    h.pop("host", None)
    return h


@app.api_route("/get-playlist/", methods=["GET", "POST"])
async def playlist_proxy(request: Request):
    async with httpx.AsyncClient(timeout=30) as client:
        url = f"{SPOTIFY_URL}/playlist"
        try:
            if request.method == "GET":
                params = dict(request.query_params)
                resp = await client.get(url, params=params)
            else:
                body = await request.body()
                headers = _clean_headers(request.headers)
                resp = await client.post(url, content=body, headers=headers)
            logger.info(
                f"Downstream /playlist response: {resp.status_code} {resp.text[:300]}")
            try:
                return JSONResponse(
                    status_code=resp.status_code,
                    content=resp.json(),
                    headers={
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        "Access-Control-Expose-Headers": "Content-Disposition, X-Not-Found"})
            except Exception as e:
                logger.exception(
                    f"Error parsing downstream /playlist response: {e}")
                return JSONResponse(
                    status_code=resp.status_code,
                    content={
                        "detail": resp.text},
                    headers={
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        "Access-Control-Expose-Headers": "Content-Disposition, X-Not-Found"})
        except Exception as e:
            logger.error(
                f"Exception in /get-playlist/: {e}\n{traceback.format_exc()}")
            return cors_json_error(f"API Gateway error: {e}")


@app.post("/find-tracks/")
async def find_tracks_proxy(request: Request):
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            body = await request.json()
            resp = await client.post(f"{MATCHING_URL}/match", json=body)
            logger.info(
                f"Downstream /match response: {resp.status_code} {resp.text[:300]}")
            try:
                data = resp.json()
            except Exception as e:
                logger.exception(
                    f"Error parsing downstream /match response: {e}")
                data = {"detail": resp.text}
            return JSONResponse(
                status_code=resp.status_code,
                content=data,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Expose-Headers": "Content-Disposition, X-Not-Found"})
        except Exception as e:
            logger.error(
                f"Exception in /find-tracks/: {e}\n{traceback.format_exc()}")
            return cors_json_error(f"API Gateway error: {e}")


@app.post("/recommend/")
async def recommend_proxy(request: Request):
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            body = await request.json()
            resp = await client.post(f"{MATCHING_URL}/recommend", json=body)
            logger.info(
                f"Downstream /recommend response: {resp.status_code} {resp.text[:300]}")
            try:
                data = resp.json()
            except Exception as e:
                logger.exception(
                    f"Error parsing downstream /recommend response: {e}")
                data = {"detail": resp.text}
            return JSONResponse(
                status_code=resp.status_code,
                content=data,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Expose-Headers": "Content-Disposition, X-Not-Found"})
        except Exception as e:
            logger.error(
                f"Exception in /recommend/: {e}\n{traceback.format_exc()}")
            return cors_json_error(f"API Gateway error: {e}")


@app.post("/download-tracks/")
async def download_proxy(request: Request):
    async with httpx.AsyncClient(timeout=60) as client:
        try:
            body = await request.body()
            resp = await client.post(f"{DOWNLOAD_URL}/download", content=body)
            logger.info(
                f"Downstream /download response: {resp.status_code} (headers: {dict(resp.headers)})")
            headers = dict(resp.headers)
            # Remove hop-by-hop headers and set CORS
            headers.pop("transfer-encoding", None)
            headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
            headers["Access-Control-Expose-Headers"] = "Content-Disposition, X-Not-Found"
            return StreamingResponse(
                resp.aiter_bytes(),
                status_code=resp.status_code,
                headers=headers,
                media_type=resp.headers.get("content-type", "application/zip"),
            )
        except Exception as e:
            logger.error(
                f"Exception in /download-tracks/: {e}\n{traceback.format_exc()}")
            return cors_json_error(f"API Gateway error: {str(e)}")
