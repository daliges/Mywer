FROM python:3.9

WORKDIR /app

COPY download/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY mywer_models ./mywer_models
COPY download/. .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]