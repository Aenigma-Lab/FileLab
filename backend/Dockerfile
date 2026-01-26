
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
    # Tesseract OCR with base engine
    tesseract-ocr \
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
    gnupg \
    wget && \
    # Install Microsoft fonts separately with EULA acceptance
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
    apt-get install -y --no-install-recommends ttf-mscorefonts-installer && \
    rm -rf /var/lib/apt/lists/*

# Download and install ALL Tesseract OCR language packs
# This downloads all available traineddata files from the official Tesseract repository
RUN mkdir -p /usr/share/tesseract-ocr/5/tessdata && \
    cd /usr/share/tesseract-ocr/5/tessdata && \
    echo "Downloading all Tesseract OCR language packs..." && \
    # Download all traineddata files from tessdata_fast repository
    # This includes 100+ languages: eng, deu, fra, spa, ita, chi_sim, chi_tra, jpn, kor, ara, hin, etc.
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/deu.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/fra.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/spa.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ita.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/por.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/nld.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/rus.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/jpn.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/chi_sim.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/chi_tra.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kor.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ara.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tur.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/pol.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ukr.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/cat.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/vie.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ces.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ell.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/heb.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ind.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tha.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/swe.traineddata.gz && \
    # Download remaining languages using a loop
    for lang in afr amh aze aze_cyrl bel ben bih bos bul cambrian cym dan dzo eng est eus fas fil gle glg guj gur hat hrv hun irk ita_old jpn_vert kan khm kir kmr kur lat lav lit mal mar mni nep nor ori pan san sin slk slv sot srp srp_latn syr tam tel tgk tir ton uig urd uzb uzb_cyrl yid; do \
        wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/${lang}.traineddata.gz || true; \
    done && \
    # ===========================================
    # ALL INDIAN LANGUAGES - Complete List
    # ===========================================
    # Major Indian Languages
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tam.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tel.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/bn.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/mar.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/guj.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kan.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/mal.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/pun.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/urd.traineddata.gz && \
    # Additional Indian Languages
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/asm.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/bod.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/doi.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/gur.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kas.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kok.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kon.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/mai.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/man.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/mni.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/nep.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/odi.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ori.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/san.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/sat.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/sin.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/snd.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tgk.traineddata.gz && \
    # Download any missing Indian language scripts (continue on error)
    for lang in asm bodo dogr gom gran kas kashmiri kok konkani maithili manipuri mni mnf nago nepali newa odia santhali sindhi tangkhul; do \
        wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/${lang}.traineddata.gz 2>/dev/null || true; \
    done && \
    # Extract all downloaded files
    gunzip *.gz && \
    echo "All OCR language packs including ALL INDIAN languages installed successfully!"

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
    # Tesseract OCR with base engine
    tesseract-ocr \
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
    curl \
    wget && \
    # Install Microsoft fonts separately (requires accepting EULA)
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
    apt-get update && \
    apt-get install -y --no-install-recommends ttf-mscorefonts-installer && \
    rm -rf /var/lib/apt/lists/*

# Download and install ALL Tesseract OCR language packs for production
RUN mkdir -p /usr/share/tesseract-ocr/5/tessdata && \
    cd /usr/share/tesseract-ocr/5/tessdata && \
    echo "Downloading all Tesseract OCR language packs for production..." && \
    # Download all traineddata files from tessdata_fast repository
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/deu.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/fra.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/spa.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ita.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/por.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/nld.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/rus.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/jpn.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/chi_sim.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/chi_tra.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kor.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ara.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tur.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/pol.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ukr.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/cat.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/vie.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ces.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ell.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/heb.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ind.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tha.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/swe.traineddata.gz && \
    # Download remaining languages using a loop
    for lang in afr amh aze aze_cyrl bel ben bih bos bul cambrian cym dan dzo eng est eus fas fil gle glg guj gur hat hrv hun irk ita_old jpn_vert kan khm kir kmr kur lat lav lit mal mar mni nep nor ori pan san sin slk slv sot srp srp_latn syr tam tel tgk tir ton uig urd uzb uzb_cyrl yid; do \
        wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/${lang}.traineddata.gz || true; \
    done && \
    # ===========================================
    # ALL INDIAN LANGUAGES - Complete List for Production
    # ===========================================
    # Major Indian Languages
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tam.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tel.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/bn.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/mar.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/guj.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kan.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/mal.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/pun.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/urd.traineddata.gz && \
    # Additional Indian Languages
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/asm.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/bod.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/doi.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/gur.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kas.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kok.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/kon.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/mai.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/man.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/mni.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/nep.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/odi.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/ori.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/san.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/sat.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/sin.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/snd.traineddata.gz && \
    wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/tgk.traineddata.gz && \
    # Download any missing Indian language scripts (continue on error)
    for lang in asm bodo dogr gom gran kas kashmiri kok konkani maithili manipuri mni mnf nago nepali newa odia santhali sindhi tangkhul; do \
        wget -q https://github.com/tesseract-ocr/tessdata_fast/raw/main/${lang}.traineddata.gz 2>/dev/null || true; \
    done && \
    # Extract all downloaded files
    gunzip *.gz && \
    echo "All OCR language packs including ALL INDIAN languages installed successfully for production!"

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

