# FileLab - File Conversion & PDF Editor

<div align="center">

![FileLab Logo](https://img.shields.io/badge/FileLab-File%20Conversion%20%26%20PDF%20Editor-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat-square&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)

**A powerful, Docker-based file conversion application with PDF editing capabilities**

[Features](#-features) • [Quick Start](#-quick-start) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 📄 Document Conversion
- **PDF Conversion**: DOCX, DOC, PPTX, PPT, XLSX, XLS, TXT to PDF
- **PDF to Other Formats**: Convert PDF to images, text, and more
- **Batch Processing**: Convert multiple files simultaneously
- **OCR Support**: Extract text from images using Tesseract

### 📝 PDF Editing
- **Merge & Split**: Combine or divide PDF documents
- **Compress**: Reduce PDF file size
- **Watermark**: Add text/image watermarks
- **Lock/Unlock**: Password protect or remove restrictions
- **Annotations**: Add comments, highlights, and notes

### 🖼️ Image Processing
- **Format Conversion**: PNG, JPEG, GIF, WebP, and more
- **Resize & Crop**: Adjust image dimensions
- **Image Enhancement**: Quality adjustments and filters
- **OCR Integration**: Extract text from scanned images

### 🎯 Additional Tools
- **Web Interface**: Modern React-based UI
- **Real-time Preview**: View files before conversion
- **RESTful API**: Full API access with Swagger documentation
- **Docker Support**: Containerized deployment

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FileLab Application                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Frontend   │  │   Backend   │  │  MongoDB    │      │
│  │  (React)    │◄─┤ (FastAPI)   │◄─┤ (Database)  │      │
│  │  :3000      │  │   :8001     │  │  :27017     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│        │               │                        │       │
│        └───────────────┴────────────────────────┘       │
│                        │                                │
│                 ┌──────┴──────┐                         │
│                 │   Nginx     │                         │
│                 │ (Reverse    │                         │
│                 │  Proxy)     │                         │
│                 └─────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **Memory** | 4 GB | 8 GB |
| **Disk Space** | 10 GB | 20 GB |

### Required Software

- **Docker Engine** >= 20.10
- **Docker Compose** >= 2.0 (or Docker Desktop)
- At least **4GB RAM** available for containers

### Start in 3 Steps

```bash
# 1. Clone the repository
git clone https://github.com/Aenigma-Lab/Filelab.git
cd Filelab

# 2. Start all services
sudo docker compose up -d --build

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

---

## 📦 Installation

### Method 1: Docker Compose (Recommended)

```bash
# Clone and navigate to project
git clone https://github.com/Aenigma-Lab/Filelab.git
cd Filelab

# Build and start all services
sudo docker compose up -d --build

# Verify services are running
sudo docker compose ps
```

### Method 2: Automated Script

```bash
# Make script executable
chmod +x install.sh

# Run installation
./install.sh

# Options:
# --build-only    Build images only, don't start
# --start         Start existing containers
# --stop          Stop all services
# --restart       Restart all services
# --status        Show service status
# --clean         Stop and remove everything
# --help          Show help message
```

### Method 3: Manual Native Installation

See [INSTALLATION.md](INSTALLATION.md) for detailed instructions on:
- Installing system dependencies
- Setting up MongoDB
- Configuring backend and frontend
- Running without Docker

---

## 🔧 Configuration

### Environment Variables

#### Backend Configuration

Create `backend/.env` file:

```bash
# MongoDB Connection
MONGO_URL=mongodb://mongodb:27017
DB_NAME=filelab

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://frontend:3000

# File Processing
TEMP_DIR=/app/tmp
MAX_FILE_SIZE_MB=100
```

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URL` | `mongodb://mongodb:27017` | MongoDB connection string |
| `DB_NAME` | `filelab` | Database name |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `TEMP_DIR` | `/app/tmp` | Temporary file directory |
| `MAX_FILE_SIZE_MB` | `100` | Maximum upload size |

### Changing Ports

Edit `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:3000"  # Change 8080 to your desired port
  backend:
    ports:
      - "8081:8000"  # Change 8081 to your desired port
  mongodb:
    ports:
      - "27018:27017"  # Change 27018 to your desired port
```

---

## 📡 API Documentation

Full API documentation is available at **http://localhost:8001/docs** when running the application.

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api` | API health check |
| `POST` | `/api/convert/pdf-to-docx` | Convert PDF to DOCX |
| `POST` | `/api/convert/docx-to-pdf` | Convert DOCX to PDF |
| `POST` | `/api/watermark` | Add watermark to PDF |
| `POST` | `/api/pdf/merge` | Merge PDF files |
| `POST` | `/api/pdf/split` | Split PDF file |

---

## 🛠️ Services Overview

### 1. MongoDB (`mongodb`)
- **Image**: `mongodb/mongodb-community-server:6.0.16-ubuntu2204`
- **Port**: 27017
- **Volume**: `mongodb_data` (persistent)
- **Health Check**: Automatic, waits for database readiness

### 2. Backend (`backend`)
- **Framework**: FastAPI + Uvicorn
- **Port**: 8001
- **Dependencies**: MongoDB (waits for health check)
- **Features**:
  - PDF conversion (DOCX, DOC, PPTX, PPT, XLSX, XLS, TXT)
  - Image processing and OCR
  - Watermarking
  - PDF editing
  - File compression/extraction

### 3. Frontend (`frontend`)
- **Framework**: React + Craco + TailwindCSS
- **Port**: 3000
- **Server**: Nginx (production build)
- **Proxy**: API requests forwarded to backend

---

## 📁 Project Structure

```
filelab/
├── docker-compose.yml          # Main orchestration file
├── install.sh                  # Automated installation script
├── INSTALLATION.md             # Detailed installation guide
├── README.md                   # This file
├── backend/
│   ├── Dockerfile              # Backend container image
│   ├── requirements.txt        # Python dependencies
│   ├── server.py               # FastAPI application
│   ├── .env.example            # Environment variables template
│   ├── routes/                 # API route handlers
│   │   └── pdf_editor_routes.py
│   └── services/               # Business logic services
│       ├── pdf_editor_service.py
│       └── watermark_service.py
├── frontend/
│   ├── Dockerfile              # Frontend container image
│   ├── nginx.conf              # Nginx configuration
│   ├── package.json            # Node.js dependencies
│   ├── craco.config.js         # Craco configuration
│   ├── tailwind.config.js      # TailwindCSS configuration
│   ├── README.md               # Frontend documentation
│   └── src/                    # React application source
│       ├── components/
│       │   ├── layout/         # Navigation components
│       │   └── pdf/            # PDF editing components
│       ├── pages/              # Page components
│       ├── hooks/              # Custom React hooks
│       └── lib/                # Utility functions
├── data/                       # MongoDB data directory
└── logs/                       # Application logs
```

---

## 📝 Commands

### Development

```bash
# Start all services with live logs
sudo docker compose up

# Start in detached mode
sudo docker compose up -d

# Rebuild after code changes
sudo docker compose up -d --build

# View logs
sudo docker compose logs -f

# View specific service logs
sudo docker compose logs -f backend
```

### Maintenance

```bash
# Stop all services
sudo docker compose down

# Stop and remove volumes (data will be lost!)
sudo docker compose down -v

# Restart a specific service
sudo docker compose restart backend

# Restart all services
sudo docker compose restart

# Scale a service (e.g., run 3 backend instances)
sudo docker compose up -d --scale backend=3
```

### Cleanup

```bash
# Remove all containers, networks, and images
sudo docker compose down --rmi all

# Remove unused Docker resources
sudo docker system prune -a
```

---

## 🔍 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB logs
sudo docker compose logs mongodb

# Verify MongoDB is healthy
sudo docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Backend Not Starting

```bash
# Check backend logs
sudo docker compose logs backend

# Verify MongoDB is ready
sudo docker compose exec backend curl -f http://mongodb:27017
```

### Frontend Not Loading

```bash
# Check frontend logs
sudo docker compose logs frontend

# Verify Nginx is running
sudo docker compose exec frontend nginx -t
```

### Permission Errors

```bash
# Fix temp directory permissions
sudo docker compose exec backend chmod 777 /app/tmp
```

### Clear All Data and Restart

```bash
sudo docker compose down -v
sudo docker compose up -d
```

---

## 🧰 Installed Tools

### Document Conversion
- **LibreOffice** - DOCX/DOC/PPT/PPTX/XLS/XLSX to PDF
- **Poppler Utils** - PDF to image conversion
- **Tesseract OCR** - Text extraction from images

### Python Libraries
- FastAPI + Uvicorn
- Motor (async MongoDB)
- Pydantic
- PyPDF2, pdfplumber, pdf2image
- python-docx, python-pptx, openpyxl
- Pillow (PIL)
- ReportLab

### Frontend
- React 19
- TailwindCSS 3.4
- Radix UI components
- Lucide icons
- PDF.js

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is part of the FileLab application. All rights reserved.

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review application logs: `docker compose logs`
3. Run the test suite: `./test_start.sh`
4. Open an issue on GitHub

---

<div align="center">

**Made with ❤️ by the FileLab Team**

</div>

## License

This project is part of the FileLab application. All rights reserved.



