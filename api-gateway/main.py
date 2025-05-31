from fastapi import FastAPI, Request
import httpx
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import logging
import traceback

app = FastAPI()

# Setup logging
logger = logging.getLogger("api-gateway")
logger.setLevel(logging.INFO)
if not logger.hasHandlers():
    import sys
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(name)s: %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Not-Found"],
)

MATCHING_URL = os.getenv("MATCHING_RECOMMENDATION_URL", "http://localhost:8001")
DOWNLOAD_URL = os.getenv("DOWNLOAD_URL", "http://localhost:8002")
SPOTIFY_URL = os.getenv("SPOTIFY_URL", "http://localhost:8003")

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
            logger.info(f"Downstream /playlist response: {resp.status_code} {resp.text[:300]}")
            try:
                return JSONResponse(
                    status_code=resp.status_code,
                    content=resp.json(),
                    headers={
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        "Access-Control-Expose-Headers": "Content-Disposition, X-Not-Found"
                    }
                )
            except Exception as e:
                logger.exception(f"Error parsing downstream /playlist response: {e}")
                return JSONResponse(
                    status_code=resp.status_code,
                    content={"detail": resp.text},
                    headers={
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        "Access-Control-Expose-Headers": "Content-Disposition, X-Not-Found"
                    }
                )
        except Exception as e:
            logger.error(f"Exception in /get-playlist/: {e}\n{traceback.format_exc()}")
            return cors_json_error(f"API Gateway error: {e}")

@app.post("/find-tracks/")
async def find_tracks_proxy(request: Request):
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            body = await request.json()
            resp = await client.post(f"{MATCHING_URL}/match", json=body)
            logger.info(f"Downstream /match response: {resp.status_code} {resp.text[:300]}")
            try:
                data = resp.json()
            except Exception as e:
                logger.exception(f"Error parsing downstream /match response: {e}")
                data = {"detail": resp.text}
            return JSONResponse(
                status_code=resp.status_code,
                content=data,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Expose-Headers": "Content-Disposition, X-Not-Found"
                }
            )
        except Exception as e:
            logger.error(f"Exception in /find-tracks/: {e}\n{traceback.format_exc()}")
            return cors_json_error(f"API Gateway error: {e}")

@app.post("/recommend/")
async def recommend_proxy(request: Request):
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            body = await request.json()
            resp = await client.post(f"{MATCHING_URL}/recommend", json=body)
            logger.info(f"Downstream /recommend response: {resp.status_code} {resp.text[:300]}")
            try:
                data = resp.json()
            except Exception as e:
                logger.exception(f"Error parsing downstream /recommend response: {e}")
                data = {"detail": resp.text}
            return JSONResponse(
                status_code=resp.status_code,
                content=data,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Expose-Headers": "Content-Disposition, X-Not-Found"
                }
            )
        except Exception as e:
            logger.error(f"Exception in /recommend/: {e}\n{traceback.format_exc()}")
            return cors_json_error(f"API Gateway error: {e}")

@app.post("/download-tracks/")
async def download_proxy(request: Request):
    async with httpx.AsyncClient(timeout=60) as client:
        try:
            body = await request.body()
            resp = await client.post(f"{DOWNLOAD_URL}/download", content=body)
            logger.info(f"Downstream /download response: {resp.status_code} (headers: {dict(resp.headers)})")
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
            logger.error(f"Exception in /download-tracks/: {e}\n{traceback.format_exc()}")
            return cors_json_error(f"API Gateway error: {str(e)}")
