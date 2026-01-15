# FileLab Installation Guide

A complete guide to installing and running the FileLab file conversion application.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation Methods](#installation-methods)
   - [Method 1: Docker Compose (Recommended)](#method-1-docker-compose-recommended)
   - [Method 2: Automated Script](#method-2-automated-script)
   - [Method 3: Manual Native Installation](#method-3-manual-native-installation)
4. [Quick Start](#quick-start)
5. [Verifying the Installation](#verifying-the-installation)
6. [Accessing the Application](#accessing-the-application)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [Uninstallation](#uninstallation)

---

## Overview

FileLab is a powerful file conversion application with the following features:

- **Document Conversion**: PDF, DOCX, DOC, PPTX, PPT, XLSX, XLS, TXT
- **PDF Tools**: Merge, Split, Compress, Lock/Unlock, Watermark
- **Image Processing**: Resize, Format Conversion, OCR
- **Web Interface**: Modern React-based UI with real-time preview
- **API Access**: RESTful API with Swagger documentation

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   FileLab Application                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Frontend   │  │   Backend   │  │  MongoDB    │      │
│  │  (React)    │◄─┤ (FastAPI)   │◄─┤ (Database)  │      │
│  │  :3000      │  │   :8001     │  │  :27017     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │ 
│        │                │                                │
│        └───────────────┴────────────────────────┘       │
│                        │                                 │
│                 ┌──────┴──────┐                         │
│                 │   Nginx     │                         │
│                 │ (Reverse    │                         │
│                 │  Proxy)     │                         │
│                 └─────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **Memory** | 4 GB | 8 GB |
| **Disk Space** | 10 GB | 20 GB |
| **Operating System** | Linux, macOS, or Windows | |

### Required Software

#### For Docker Installation

| Software | Minimum Version | Check Command |
|----------|-----------------|---------------|
| Docker Engine | 20.10+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |

#### For Native Installation

| Software | Minimum Version | Check Command |
|----------|-----------------|---------------|
| Python | 3.10+ | `python3 --version` |
| Node.js | 18+ | `node --version` |
| MongoDB | 6.0+ | `mongod --version` |
| curl | Any | `curl --version` |

### Additional Tools (Auto-installed with Docker)

- LibreOffice (document conversion)
- Poppler Utils (PDF processing)
- Tesseract OCR (text extraction)
- ImageMagick (image processing)

---

## Installation Methods

### Method 1: Docker Compose (Recommended)

This method uses Docker containers for all services, ensuring consistency across environments.

#### Step 1: Clone the Repository

```bash
# Clone the repository (replace with your repo URL)
git clone <your-repository-url>
cd filelab
```

#### Step 2: Start All Services

```bash
# Build and start all services in detached mode
sudo docker compose up -d --build
```

**Expected Output:**
```
[+] Running 4/4
 ✔ Network filelab-network    Created
 ✔ Container filelab-mongodb  Started
 ✔ Container filelab-backend  Started
 ✔ Container filelab-frontend Started
```

#### Step 3: Verify Services

```bash
# Check container status
sudo docker compose ps

# Expected status:
# NAME                STATUS    PORTS
# filelab-backend     Up        0.0.0.0:8001->8001/tcp
# filelab-frontend    Up        0.0.0.0:3000->3000/tcp
# filelab-mongodb     Up        0.0.0.0:27017->27017/tcp
```

#### Step 4: View Logs (Optional)

```bash
# Follow all logs
sudo docker compose logs -f

# View specific service logs
sudo docker compose logs -f backend
sudo docker compose logs -f frontend
sudo docker compose logs -f mongodb
```

---

### Method 2: Automated Script

Use the provided installation script for automatic setup.

#### Step 1: Make the Script Executable

```bash
chmod +x install.sh
```

#### Step 2: Run the Installation

```bash
# Interactive installation (recommended)
./install.sh

# Or with options:
./install.sh --build-only    # Build images only, don't start
./install.sh --start         # Start existing containers
./install.sh --stop          # Stop all services
./install.sh --restart       # Restart all services
./install.sh --logs          # Show logs and exit
./install.sh --status        # Show service status
./install.sh --clean         # Stop and remove everything
./install.sh --help          # Show help message
```

---

### Method 3: Manual Native Installation

Follow these steps for a non-Docker installation.

#### Step 1: Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y \
    python3.10 \
    python3.10-venv \
    python3-pip \
    nodejs \
    npm \
    mongodb-org \
    curl \
    wget \
    git \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-all \
    libreoffice \
    imagemagick
```

**macOS (with Homebrew):**
```bash
brew install python@3.10 \
             node \
             mongodb-community@6.0 \
             poppler \
             tesseract \
             libreoffice \
             imagemagick
```

**Windows:**
Download and install from respective websites:
- Python 3.10+: https://python.org
- Node.js: https://nodejs.org
- MongoDB: https://www.mongodb.com
- LibreOffice: https://www.libreoffice.org

#### Step 2: Start MongoDB

```bash
# Create data directory
mkdir -p data/db
mkdir -p logs

# Start MongoDB
mongod --dbpath ./data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath logs/mongodb.log
```

#### Step 3: Set Up Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn server:app --host 127.0.0.1 --port 8001
```

#### Step 4: Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

---

## Quick Start

### Starting the Application (Docker)

```bash
# From the filelab directory
cd filelab

# Start all services
sudo docker compose up -d

# Wait for services to be ready (approximately 2-3 minutes)
sleep 30

# Verify all services are running
sudo docker compose ps
```

### Stopping the Application

```bash
# Stop all services (keep data)
sudo docker compose down

# Stop and remove all data (WARNING: deletes database)
sudo docker compose down -v
```

---

## Verifying the Installation

### 1. Check Service Health

```bash
# Check MongoDB
sudo docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
# Expected: { ok: 1 }

# Check Backend API
curl http://localhost:8001/api
# Expected: {"message":"File Conversion API"}

# Check Frontend
curl http://localhost:3000
# Expected: HTML response with React app
```

### 2. Access API Documentation

Open your browser to: **http://localhost:8001/docs**

You should see the Swagger UI with all available API endpoints.

### 3. Test a Conversion

```bash
# Test PDF to DOCX conversion (using a sample PDF file)
curl -X 'POST' \
  'http://localhost:8001/api/convert/pdf-to-docx' \
  -H 'accept: application/octet-stream' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@sample.pdf;type=application/pdf' \
  --output converted.docx
```

---

## Accessing the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Web UI** | http://localhost:3000 | React frontend interface |
| **Backend API** | http://localhost:8001 | FastAPI backend |
| **API Docs** | http://localhost:8001/docs | Swagger/OpenAPI documentation |
| **MongoDB** | localhost:27017 | MongoDB connection |
| **Health Check** | http://localhost:8001/api | API health endpoint |

---

## Configuration

### Environment Variables

#### Backend Configuration (`backend/.env`)

Create or edit the `backend/.env` file:

```bash
# MongoDB Connection
MONGO_URL=mongodb://mongodb:27017
DB_NAME=filelab

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://frontend:3000

# File Processing
TEMP_DIR=/app/tmp
```

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URL` | `mongodb://mongodb:27017` | MongoDB connection string |
| `DB_NAME` | `filelab` | Database name |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |
| `TEMP_DIR` | `/app/tmp` | Temporary file directory |

#### Frontend Configuration

Environment variables are set in `docker-compose.yml`:

```yaml
frontend:
  environment:
    - REACT_APP_BACKEND_URL=http://localhost:8001
    - BROWSER=none
    - CI=true
```

### Customizing Ports

Edit `docker-compose.yml` to change ports:

```yaml
services:
  frontend:
    ports:
      - "8080:3000"  # Change 8080 to your desired port
  backend:
    ports:
      - "8081:8001"  # Change 8081 to your desired port
  mongodb:
    ports:
      - "27018:27017"  # Change 27018 to your desired port
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error:**
```
pymongo.errors.ServerSelectionTimeoutError: mongodb:27017: timed out
```

**Solutions:**
```bash
# Check if MongoDB container is running
sudo docker compose ps mongodb

# Check MongoDB logs
sudo docker compose logs mongodb

# Restart MongoDB
sudo docker compose restart mongodb
```

#### 2. Backend Not Starting

**Error:**
```
ConnectionRefusedError: [Errno 111] Connection refused
```

**Solutions:**
```bash
# Check backend logs for detailed error
sudo docker compose logs backend

# Ensure MongoDB is healthy before backend starts
sudo docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Rebuild backend container
sudo docker compose up -d --build backend
```

#### 3. Frontend Not Loading

**Error:** White screen or connection refused

**Solutions:**
```bash
# Check frontend logs
sudo docker compose logs frontend

# Verify Nginx is running
sudo docker compose exec frontend nginx -t

# Restart frontend
sudo docker compose restart frontend
```

#### 4. Permission Errors

**Error:** `Permission denied` when accessing files

**Solutions:**
```bash
# Fix temp directory permissions
sudo docker compose exec backend chmod 777 /app/tmp

# Fix logs directory permissions
chmod 777 logs/
```

#### 5. Low Memory Warning

**Error:** Container killed due to memory usage

**Solutions:**
```bash
# Increase Docker memory limit (Docker Desktop)
# Go to Docker Desktop > Settings > Resources > Memory

# Or add swap space (Linux)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 6. Port Already in Use

**Error:** `Port 3000/8001/27017 is already in use`

**Solutions:**
```bash
# Find the process using the port
sudo lsof -i :3000

# Kill the process (replace PID with actual process ID)
sudo kill <PID>

# Or change the port in docker-compose.yml
```

### Viewing Logs

```bash
# All services
sudo docker compose logs

# Specific service
sudo docker compose logs backend
sudo docker compose logs frontend
sudo docker compose logs mongodb

# Follow logs in real-time
sudo docker compose logs -f

# Last 100 lines
sudo docker compose logs --tail 100
```

### Restarting Services

```bash
# Restart all services
sudo docker compose restart

# Restart specific service
sudo docker compose restart backend
sudo docker compose restart frontend
sudo docker compose restart mongodb
```

---

## Uninstallation

### Docker Installation

```bash
# Stop and remove all containers
sudo docker compose down

# Remove all volumes (WARNING: deletes all data)
sudo docker compose down -v

# Remove Docker images (optional)
sudo docker rmi filelab-backend filelab-frontend filelab-mongodb

# Remove Docker network
sudo docker network rm filelab-network
```

### Native Installation

```bash
# Stop all running services (Ctrl+C in terminal)

# Remove virtual environment
rm -rf backend/venv

# Remove node_modules
rm -rf frontend/node_modules

# Remove MongoDB data
rm -rf data/db/

# Remove logs
rm -rf logs/
```

---

## Additional Resources

### Project Structure

```
filelab/
├── docker-compose.yml          # Docker orchestration configuration
├── backend/
│   ├── Dockerfile              # Backend container image
│   ├── requirements.txt        # Python dependencies
│   ├── server.py               # FastAPI application
│   ├── .env                    # Environment variables
│   ├── routes/                 # API route handlers
│   └── services/               # Business logic services
├── frontend/
│   ├── Dockerfile              # Frontend container image
│   ├── nginx.conf              # Nginx configuration
│   ├── package.json            # Node dependencies
│   ├── src/                    # React application source
│   └── public/                 # Static assets
├── data/                       # MongoDB data directory
├── logs/                       # Application logs
└── README.md                   # Project documentation
```

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review application logs: `sudo docker compose logs`
3. Run the test suite: `./test_start.sh`

### Contributing

To contribute to the project:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Submit a pull request

---

## License

This project is part of the FileLab application. All rights reserved.

