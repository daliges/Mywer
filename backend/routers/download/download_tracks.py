import aiohttp, asyncio, io, logging, re, zipfile
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

logger = logging.getLogger(__name__)
_illegal = re.compile(r'[<>:"/\\|?*\x00-\x1F]')

def _safe(s: str | None, fallback: str) -> str:
    """Return a filesystem-safe string, or a fallback."""
    if not s:
        return fallback
    return _illegal.sub("_", str(s)).strip()[:150] or fallback

async def download_tracks(tracks):
    buf = io.BytesIO()

    async with aiohttp.ClientSession() as session:
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for t in tracks:
                try:
                    # ---------- choose the URL ----------
                    download_url = t.audiodownload or t.audio
                    if not download_url:
                        logger.warning("Skipping %s – no URL", t.name)
                        continue

                    # ---------- fetch ----------
                    async with session.get(str(download_url), timeout=30) as resp:
                        if resp.status != 200:
                            logger.warning("Skipping %s – HTTP %s",
                                           t.name, resp.status)
                            continue
                        data = await resp.read()

                    # ---------- build a safe filename ----------
                    artist_part = _safe(", ".join(t.artists), "Unknown Artist")
                    title_part  = _safe(t.name, "Unknown Title")
                    filename    = f"{artist_part} - {title_part}.mp3"

                    # ---------- write ----------
                    zf.writestr(filename, data)
                    logger.info("Added %s", filename)

                except Exception as e:
                    logger.exception("Error handling track %s: %s", t.name, e)
                    continue   # move on to next track

            if not zf.namelist():
                raise HTTPException(400, "No valid tracks to download")

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition":
                 'attachment; filename="selected_tracks.zip"'},
    )
