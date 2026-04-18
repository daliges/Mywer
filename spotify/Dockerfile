FROM python:3.9-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r spotify/requirements.txt

CMD ["sh", "-c", "uvicorn spotify.main:app --host 0.0.0.0 --port ${PORT:-8003}"]
