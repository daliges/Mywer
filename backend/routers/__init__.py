from fastapi import APIRouter

from backend.routers.fetch import playlist as playlist_router
from backend.routers.fetch import spotify as spotify_router

# structuring all API's in one place

main_router = APIRouter()

main_router.include_router(spotify_router.router)
main_router.include_router(playlist_router.router)