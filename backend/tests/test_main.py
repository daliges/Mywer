from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from main import app

client = TestClient(app)

def test_root_html(monkeypatch):
    # Patch pathlib to avoid needing the actual file
    fake_html = "<h1>Hello from test</h1>"

    def fake_read_text(*args, **kwargs):
        return fake_html

    monkeypatch.setattr("pathlib.Path.read_text", fake_read_text)
    response = client.get("/")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/html")
    assert fake_html in response.text

def test_cors_headers():
    response = client.options("/", headers={"Origin": "http://localhost:3000"})
    # CORS preflight request should return 200 (or 405 for GET only, depends on FastAPI version)
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"

# def test_static_serving(tmp_path, monkeypatch):
#     # Create a temp static file
#     static_dir = tmp_path / "static"
#     static_dir.mkdir()
#     f = static_dir / "test.js"
#     f.write_text("console.log('ok');")

#     # Patch StaticFiles directory in app.mount
#     monkeypatch.setattr("fastapi.staticfiles.StaticFiles.directory", str(static_dir))
#     # Try to get the static file
#     response = client.get("/static/test.js")
#     assert response.status_code == 200
#     assert "console.log" in response.text
