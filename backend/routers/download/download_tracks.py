from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from backend.routers.pydantic_models import Playlist
import io
import tempfile
import zipfile
import aiohttp
import aiofiles
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def download_tracks(tracks):
    """
    Download the selected FoundTrack objects into a single ZIP, streamed back to the client.
    """
    logger.info(f"Preparing to download {len(tracks)} selected tracks")

    # In‑memory buffer for our zip
    buf = io.BytesIO()
    # Open zip in write mode with deflate compression
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        async with aiohttp.ClientSession() as session:
            for t in tracks:
                # build a safe filename
                filename = f"{t.name} - {', '.join(t.artists)}.mp3".replace("/", "_")
                url = t.audiodownload or t.audio
                if not url:
                    logger.warning(f"No URL for {filename}, skipping")
                    continue

                # fetch the MP3 bytes
                async with session.get(str(url)) as resp:
                    if resp.status != 200:
                        logger.error(f"Failed {filename}: HTTP {resp.status}")
                        continue
                    data = await resp.read()
                    # write directly into the ZIP
                    zf.writestr(filename, data)
                    logger.info(f"Added {filename} to ZIP")

    # if nothing downloaded, raise
    if not zipfile.ZipFile(buf).namelist():
        raise HTTPException(status_code=400, detail="No valid tracks to download.")

    # rewind and stream
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=selected_tracks.zip"
        },
    )