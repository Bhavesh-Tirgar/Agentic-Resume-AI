# Production Dockerfile for CareerPilot / ResumeAI Backend (Django + Gunicorn + Edge-TTS + Whisper + OCR)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies (ffmpeg for audio, libpq for Postgres, tesseract-ocr for scanned PDFs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    ffmpeg \
    tesseract-ocr \
    tesseract-ocr-eng \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . /app/

# Expose backend port
EXPOSE 8000

# Run migrations cleanly and serve via multi-threaded Gunicorn WSGI
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn Backend.wsgi:application --bind 0.0.0.0:8000 --workers 2 --threads 4 --timeout 120 --access-logfile -"]
