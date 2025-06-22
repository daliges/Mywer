import aiohttp, asyncio, io, json, logging, re, zipfile
from fastapi import HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from mywer_models.models import FoundTrack
from typing import Optional

logger = logging.getLogger(__name__)
_illegal = re.compile(r'[<>:"/\\|?*\x00-\x1F]')

def _safe(s: Optional[str], fallback: str) -> str:
    """Return a filesystem-safe string, or a fallback."""
    if not s:
        return fallback
    return _illegal.sub("_", str(s)).strip()[:150] or fallback

async def download_tracks(tracks):

    not_found = []
    matched = []
    # Fix: FastAPI parses JSON body as list of dicts, but if using Pydantic models, you may get list of FoundTrack objects.
    # To support both, use hasattr/t.get fallback.
    for t in tracks:
        # Try attribute access (Pydantic model), else dict access
        get = (lambda k: getattr(t, k, None)) if hasattr(t, "__dict__") else (lambda k: t.get(k))
        audio_url = get("audiodownload") or get("audio")
        name = get("name") or get("song") or "Unknown"
        artists = get("artists") or []
        if not isinstance(artists, list):
            artists = list(artists)
        if audio_url:
            matched.append(t)
        else:
            reason = get("not_found_reason") or "Not found or not copyright free"
            not_found.append({
                "track": f"{name} - {', '.join(artists)}",
                "reason": reason
            })

    if not matched:
        return JSONResponse(
            status_code=400,
            content={
                "detail": "No exact matches found for download.",
                "not_found": not_found
            }
        )

    buf = io.BytesIO()
    try:
        async with aiohttp.ClientSession() as session:
            with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
                for t in matched:
                    get = (lambda k: getattr(t, k, None)) if hasattr(t, "__dict__") else (lambda k: t.get(k))
                    try:
                        download_url = get("audiodownload") or get("audio")
                        name = get("name") or get("song") or "Unknown"
                        artists = get("artists") or []
                        if not isinstance(artists, list):
                            artists = list(artists)
                        if not download_url:
                            not_found.append({
                                "track": f"{name} - {', '.join(artists)}",
                                "reason": "No download URL"
                            })
                            continue

                        async with session.get(str(download_url), timeout=30) as resp:
                            if resp.status != 200:
                                not_found.append({
                                    "track": f"{name} - {', '.join(artists)}",
                                    "reason": f"Download failed (HTTP {resp.status})"
                                })
                                continue
                            data = await resp.read()

                        artist_part = _safe(", ".join(artists), "Unknown Artist")
                        title_part  = _safe(name, "Unknown Title")
                        filename    = f"{artist_part} - {title_part}.mp3"

                        zf.writestr(filename, data)
                        logger.info("Added %s", filename)

                    except Exception as e:
                        logger.exception("Error handling track %s: %s", name, e)
                        not_found.append({
                            "track": f"{name} - {', '.join(artists)}",
                            "reason": "Download error"
                        })
                        continue

                if not zf.namelist():
                    return JSONResponse(
                        status_code=400,
                        content={
                            "detail": "No exact matches found for download.",
                            "not_found": not_found
                        }
                    )
        buf.seek(0)
        headers = {
            "Content-Disposition": 'attachment; filename="selected_tracks.zip"'
        }
        if not_found:
            headers["X-Not-Found"] = json.dumps(not_found, ensure_ascii=True, separators=(',', ':'))
        return StreamingResponse(
            buf,
            media_type="application/zip",
            headers=headers,
        )
    except Exception as e:
        logger.exception("Fatal error in download_tracks: %s", e)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error during download.",
                "not_found": not_found
            }
        )
