FROM python:3.9-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r api_gateway/requirements.txt

CMD ["uvicorn", "api_gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]
