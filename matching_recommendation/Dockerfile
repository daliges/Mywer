FROM python:3.9-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r matching_recommendation/requirements.txt

CMD ["uvicorn", "matching_recommendation.main:app", "--host", "0.0.0.0", "--port", "8001"]
