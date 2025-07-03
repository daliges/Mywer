import pytest
from api_gateway.main import cors_json_error

from fastapi.responses import JSONResponse


def test_cors_json_error_str():
    resp = cors_json_error("error", status_code=400)
    assert isinstance(resp, JSONResponse)
    assert resp.status_code == 400
    assert resp.body


def test_cors_json_error_exception():
    resp = cors_json_error(Exception("fail"), status_code=500)
    assert resp.status_code == 500
    assert b"fail" in resp.body
