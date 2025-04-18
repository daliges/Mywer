from fastapi.responses import StreamingResponse
from fastapi import HTTPException
from fastapi.responses import FileResponse
from backend.routers.pydantic_models import Playlist
import os
import tempfile
import zipfile
import aiohttp
import aiofiles
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def download_tracks(tracks):
    """
    Download tracks from a playlist.
    """

    logger.info(f"Preparing to download {len(tracks)} selected tracks")

    with tempfile.TemporaryDirectory() as temp_dir:
        file_paths = []

        async with aiohttp.ClientSession() as session:
            for track in tracks:
                song = track.name
                artists = ", ".join(track.artists)
                filename = f"{song} - {artists}.mp3".replace("/", "_")

                url = track.audiodownload or track.audio
                if not url:
                    logger.warning(f"No download URL for '{song}', skipping.")
                    continue

                file_path = os.path.join(temp_dir, filename)

                try:
                    async with session.get(str(url)) as resp:
                        if resp.status != 200:
                            raise Exception(f"Failed to download {filename}, status code: {resp.status}")
                        async with aiofiles.open(file_path, "wb") as f:
                            await f.write(await resp.read())
                        file_paths.append(file_path)
                        logger.info(f"Downloaded: {filename}")
                except Exception as e:
                    logger.error(f"Error downloading {filename}: {e}")

        if not file_paths:
            raise HTTPException(status_code=400, detail="No valid tracks to download.")

        zip_path = os.path.join(temp_dir, "selected_tracks.zip")
        with zipfile.ZipFile(zip_path, "w") as zipf:
            for file_path in file_paths:
                zipf.write(file_path, arcname=os.path.basename(file_path))

        return FileResponse(zip_path, filename="selected_tracks.zip", media_type="application/zip")