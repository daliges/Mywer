from spotify.spotify import extract_playlist_id

def test_extract_playlist_id_basic():
    assert extract_playlist_id("https://open.spotify.com/playlist/xyz789") == "xyz789"
    assert extract_playlist_id("something playlist/12345 else") == "12345"
    assert extract_playlist_id("no_match") is None
    assert extract_playlist_id("") is None
