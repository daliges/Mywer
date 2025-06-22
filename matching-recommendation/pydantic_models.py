from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class Artist(BaseModel):
    name: str

class Album(BaseModel):
    name: str

class Track(BaseModel):
    name: str
    album: Album
    artists: List[Artist]
    albumArt: Optional[str] = None
    duration: Optional[int] = None  # duration in seconds
    isrc: Optional[str] = None      # ISRC code
    external_url: Optional[str] = None

class Item(BaseModel):
    track: Track

class Tracks(BaseModel):
    items: List[Item]

class HttpsUrl(HttpUrl):
    @classmethod
    def validate(cls, value):
        url = super().validate(value)
        if url.scheme != "https":
            raise ValueError("URL must use https")
        return url

class Playlist(BaseModel):
    id: HttpsUrl
    tracks: Tracks

class FoundTrack(BaseModel):
    name: str
    artists: List[str]
    audio: Optional[HttpUrl] = None
    audiodownload: Optional[HttpUrl] = None