from matching_recommendation.find import is_similar, is_license_allowed, is_duration_similar, is_isrc_match
from matching_recommendation.ai_call import extract_json, sanitize_text, sanitize_playlist

def test_is_similar_case_and_threshold():
    assert is_similar("abcd", "abCD", 0.9)  # very similar
    assert not is_similar("abcd", "xyz", 0.9)

def test_is_license_allowed_edge():
    assert not is_license_allowed(None)
    assert not is_license_allowed("")
    assert is_license_allowed("https://creativecommons.org/whatever")

def test_is_duration_similar_str_input():
    assert is_duration_similar("100", "101")
    assert not is_duration_similar("100", "200")
    assert not is_duration_similar(None, "100")
    assert not is_duration_similar("a", "b")  # should not raise

def test_is_isrc_match_edge():
    assert is_isrc_match(" abC 123 ", "abc123")
    assert not is_isrc_match("", "abc")
    assert not is_isrc_match("abc", "")
    assert not is_isrc_match(None, "abc")

def test_extract_json_variants():
    assert extract_json('```json\n{"a":1}\n```') == '{"a":1}'
    assert extract_json('```\n{"b":2}\n```') == '{"b":2}'
    assert extract_json('{"c":3}') == '{"c":3}'

def test_sanitize_text_edge():
    assert sanitize_text(None) == ""
    assert sanitize_text("   clean   ") == "clean"
    assert sanitize_text("a"*300) == "a"*200
    assert sanitize_text("bad\x01\x02string") == "badstring"

def test_sanitize_playlist_edge():
    playlist_json = '{"items":[{"name":" a \x01", "song":["b\x02", "c"], "artist":" x "}]}' 
    out = sanitize_playlist(playlist_json)
    assert "a" in out and "x" in out  # whitespace/controls removed
