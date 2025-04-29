# Step 1: Build React frontend
FROM node:18 AS frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

# Set environment variable to fix Webpack compatibility
ENV NODE_OPTIONS=--openssl-legacy-provider

COPY frontend/ .
RUN npm run build

# Step 2: Build FastAPI backend
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copy built React frontend into static folder
COPY --from=frontend /app/frontend/build ./static

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]