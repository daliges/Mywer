from pydantic import BaseModel, HttpUrl
from typing import List, Dict

class Artist(BaseModel):
    name: str

class Album(BaseModel):
    name: str

class Track(BaseModel):
    name: str
    album: Album
    artists: List[Artist]

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