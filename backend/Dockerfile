
# Backend Dockerfile with FastAPI and document conversion tools
# This includes LibreOffice, Tesseract OCR, and all required Python dependencies

# Build stage
FROM python:3.10-slim-bookworm AS builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Configure apt to use faster, more reliable mirrors
RUN echo 'Acquire::http::Proxy "";' > /etc/apt/apt.conf.d/99no-proxy && \
    echo 'Acquire::https::Proxy "";' >> /etc/apt/apt.conf.d/99no-proxy && \
    # Use Debian CDN mirrors
    cat > /etc/apt/sources.list << 'EOF'
deb http://deb.debian.org/debian bookworm main contrib non-free
deb http://deb.debian.org/debian-security bookworm-security main contrib non-free
deb http://deb.debian.org/debian bookworm-updates main contrib non-free
EOF

# Install system dependencies required for document conversion
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    # LibreOffice for document conversions
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    # Tesseract OCR with language data
    tesseract-ocr \
    tesseract-ocr-eng \
    # Additional fonts
    fonts-crosextra-carlito \
    fonts-crosextra-caladea \
    # Image processing
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    # Font rendering
    fonts-dejavu-core \
    fonts-liberation \
    # File processing
    poppler-utils \
    # Utilities
    curl \
    gnupg && \
    # Install Microsoft fonts separately with EULA acceptance
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
    apt-get install -y --no-install-recommends ttf-mscorefonts-installer && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python packages
RUN pip install -r requirements.txt

# Copy application code
COPY ./ ./

# Create necessary directories
RUN mkdir -p /app/tmp/file_conversions

# Production stage - smaller image
FROM python:3.10-slim-bookworm AS production

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TEMP_DIR=/app/tmp

# Configure apt to use faster, more reliable mirrors
RUN echo 'Acquire::http::Proxy "";' > /etc/apt/apt.conf.d/99no-proxy && \
    echo 'Acquire::https::Proxy "";' >> /etc/apt/apt.conf.d/99no-proxy && \
    cat > /etc/apt/sources.list << 'EOF'
deb http://deb.debian.org/debian bookworm main contrib non-free
deb http://deb.debian.org/debian-security bookworm-security main contrib non-free
deb http://deb.debian.org/debian bookworm-updates main contrib non-free
EOF

# Install only runtime dependencies (lighter image)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    # LibreOffice for document conversions
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    # Tesseract OCR with language data
    tesseract-ocr \
    tesseract-ocr-eng \
    # Additional fonts (accept EULA automatically)
    fonts-crosextra-carlito \
    fonts-crosextra-caladea \
    # Image processing
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    # Font rendering
    fonts-dejavu-core \
    fonts-liberation \
    # Poppler for PDF processing
    poppler-utils \
    # Utilities
    curl && \
    # Install Microsoft fonts separately (requires accepting EULA)
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
    apt-get update && \
    apt-get install -y --no-install-recommends ttf-mscorefonts-installer && \
    rm -rf /var/lib/apt/lists/*

# Create user for security
RUN useradd --create-home --shell /bin/bash appuser

# Set working directory
WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY --from=builder /app/ /app/

# Create directories with correct permissions
RUN mkdir -p /app/tmp/file_conversions && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Start the application
CMD ["python", "server.py"]

