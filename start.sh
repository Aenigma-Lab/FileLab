#!/bin/bash

# =============================================================================
# Single Command Deployment Script
# Starts MongoDB, Backend, and Frontend with one command
# =============================================================================

# Don't use set -e globally as it causes early exit on non-critical errors
# Each critical section will have its own error handling

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MONGO_DB_PATH="${MONGO_DB_PATH:-./data/db}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
FRONTEND_DEV_PORT="${FRONTEND_DEV_PORT:-3000}"

# Network configuration - bind to all interfaces for network access
BACKEND_HOST="${BACKEND_HOST:-0.0.0.0}"
FRONTEND_HOST="${FRONTEND_HOST:-0.0.0.0}"

# Project directories
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/venv"

# PIDs for cleanup
MONGO_PID=""
BACKEND_PID=""
FRONTEND_PID=""

# Print colored message
print_status() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Cleanup function - stops all services
cleanup() {
    print_warning "Stopping all services..."
    
    # Kill processes in reverse order
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        print_info "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill "$FRONTEND_PID" 2>/dev/null || true
        wait "$FRONTEND_PID" 2>/dev/null || true
    fi
    
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        print_info "Stopping Backend (PID: $BACKEND_PID)..."
        kill "$BACKEND_PID" 2>/dev/null || true
        wait "$BACKEND_PID" 2>/dev/null || true
    fi
    
    if [ -n "$MONGO_PID" ] && kill -0 "$MONGO_PID" 2>/dev/null; then
        print_info "Stopping MongoDB (PID: $MONGO_PID)..."
        kill "$MONGO_PID" 2>/dev/null || true
        wait "$MONGO_PID" 2>/dev/null || true
    fi
    
    print_status "All services stopped."
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install a package using the system's package manager
install_package() {
    local package="$1"
    print_warning "$package not found. Installing..."
    if command_exists apt-get; then
        sudo apt-get update && sudo apt-get install -y "$package"
    elif command_exists yum; then
        sudo yum install -y "$package"
    elif command_exists dnf; then
        sudo dnf install -y "$package"
    elif command_exists apk; then
        apk add --no-cache "$package"
    else
        print_error "Could not install $package automatically. Please install manually."
        return 1
    fi
    return 0
}

# =============================================================================
# Step 1: Check prerequisites
# =============================================================================
print_status "Checking prerequisites..."

# Check for Node.js
if ! command_exists node; then
    if ! install_package nodejs; then
        exit 1
    fi
    # Also install npm if not included in nodejs package
    if ! command_exists npm; then
        install_package npm || true
    fi
fi

# Check for Python
if ! command_exists python3; then
    if ! install_package python3; then
        exit 1
    fi
    # Also install pip and venv if not included
    if ! command_exists pip3; then
        if ! install_package python3-pip; then
            print_error "Failed to install python3-pip. Please install pip manually."
            exit 1
        fi
    fi
    if ! python3 -c "import venv" 2>/dev/null; then
        if ! install_package python3-venv; then
            print_error "Failed to install python3-venv. Please install venv manually."
            exit 1
        fi
    fi
fi

# Check for curl
if ! command_exists curl; then
    if ! install_package curl; then
        exit 1
    fi
fi

# Check for MongoDB
if ! command_exists mongod; then
    print_warning "MongoDB (mongod) not found in PATH."
    print_info "Attempting to install MongoDB..."
    if command_exists apt-get; then
        # Add MongoDB repository for Ubuntu/Debian
        print_info "Adding MongoDB repository..."
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add - 2>/dev/null || true
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list >/dev/null || true
        sudo apt-get update >/dev/null 2>&1 || true
        if sudo apt-get install -y mongodb-org >/dev/null 2>&1; then
            USE_EXTERNAL_MONGO=false
        else
            print_warning "Failed to install MongoDB. Using external MongoDB..."
            USE_EXTERNAL_MONGO=true
        fi
    elif command_exists yum; then
        if install_package mongodb-server; then
            USE_EXTERNAL_MONGO=false
        else
            print_warning "Failed to install MongoDB. Using external MongoDB..."
            USE_EXTERNAL_MONGO=true
        fi
    elif command_exists dnf; then
        if install_package mongodb-server; then
            USE_EXTERNAL_MONGO=false
        else
            print_warning "Failed to install MongoDB. Using external MongoDB..."
            USE_EXTERNAL_MONGO=true
        fi
    elif command_exists apk; then
        if install_package mongodb; then
            USE_EXTERNAL_MONGO=false
        else
            print_warning "Failed to install MongoDB. Using external MongoDB..."
            USE_EXTERNAL_MONGO=true
        fi
    else
        print_warning "Could not install MongoDB automatically. Using external MongoDB..."
        USE_EXTERNAL_MONGO=true
    fi
else
    USE_EXTERNAL_MONGO=false
fi

# Fix MongoDB port conflicts
fix_port_conflicts() {
    print_info "Checking for MongoDB port conflicts..."
    
    # Check if port 27017 is in use
    local port_in_use=false
    local port_conflict_occurred=false
    
    # Check using ss
    if command -v ss &> /dev/null; then
        if ss -tuln 2>/dev/null | grep -q ":27017 "; then
            port_in_use=true
            port_conflict_occurred=true
        fi
    fi
    
    # Check using netstat as fallback
    if [ "$port_in_use" = false ] && command -v netstat &> /dev/null; then
        if netstat -tuln 2>/dev/null | grep -q ":27017 "; then
            port_in_use=true
            port_conflict_occurred=true
        fi
    fi
    
    # Check using lsof as fallback
    if [ "$port_in_use" = false ] && command -v lsof &> /dev/null; then
        if lsof -i :27017 &>/dev/null; then
            port_in_use=true
            port_conflict_occurred=true
        fi
    fi
    
    # Check using fuser as fallback
    if [ "$port_in_use" = false ] && command -v fuser &> /dev/null; then
        if fuser 27017/tcp &>/dev/null; then
            port_in_use=true
            port_conflict_occurred=true
        fi
    fi
    
    if [ "$port_conflict_occurred" = true ]; then
        print_warning "Port 27017 is already in use!"
        print_info "Please manually stop the conflicting process."
        print_info "Try: sudo lsof -i :27017"
        exit 1
    else
        print_status "Port 27017 is free"
    fi
}

# Check for poppler-utils (required for pdf2image)
if ! command_exists pdftoppm; then
    print_warning "poppler-utils not found. Installing..."
    if command_exists apt-get; then
        sudo apt-get update && sudo apt-get install -y poppler-utils
    elif command_exists yum; then
        sudo yum install -y poppler-utils
    elif command_exists dnf; then
        sudo dnf install -y poppler-utils
    elif command_exists apk; then
        apk add --no-cache poppler-utils
    else
        print_warning "Could not install poppler-utils automatically. Please install manually for PDF to PPT conversion."
    fi
fi

print_status "Prerequisites check passed!"

# =============================================================================
# Step 2: Start MongoDB
# =============================================================================
start_mongodb() {
    if [ "$USE_EXTERNAL_MONGO" = true ]; then
        print_info "Using external MongoDB (set MONGO_URL in backend/.env)"
        print_info "MongoDB configuration loaded from backend/.env"
        return 0
    fi
    
    print_status "Starting MongoDB..."
    
    # Create data directory if it doesn't exist
    mkdir -p "$MONGO_DB_PATH"
    
    # Check if MongoDB is already running
    if pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB is already running. Skipping MongoDB start."
        MONGO_PID=$(pgrep -x mongod)
        return 0
    fi
    
    # Start MongoDB in background
    mongod --dbpath "$MONGO_DB_PATH" --bind_ip 127.0.0.1 --port 27017 --fork --logpath "$PROJECT_DIR/logs/mongodb.log"
    MONGO_PID=$!
    
    # Wait for MongoDB to be ready
    print_info "Waiting for MongoDB to be ready..."
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
            print_info "MongoDB is ready!"
            break
        fi
        print_info "Waiting for MongoDB... (attempt $attempt/$max_attempts)"
        sleep 1
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        print_error "MongoDB failed to start within expected time. Check logs/mongodb.log for details."
        exit 1
    fi
    
    print_status "MongoDB started successfully (PID: $MONGO_PID)"
}

# =============================================================================
# Step 2b: Restart MongoDB (after killing for port conflict)
# =============================================================================
restart_mongodb() {
    if [ "$USE_EXTERNAL_MONGO" = true ]; then
        print_info "Using external MongoDB (set MONGO_URL in backend/.env)"
        print_info "MongoDB configuration loaded from backend/.env"
        return 0
    fi
    
    print_status "Restarting MongoDB..."
    
    # Create data directory if it doesn't exist
    mkdir -p "$MONGO_DB_PATH"
    
    # Start MongoDB in background
    print_info "Starting MongoDB fresh..."
    mongod --dbpath "$MONGO_DB_PATH" --bind_ip 127.0.0.1 --port 27017 --fork --logpath "$PROJECT_DIR/logs/mongodb.log"
    MONGO_PID=$!
    
    # Wait for MongoDB to be ready
    print_info "Waiting for MongoDB to be ready..."
    local max_attempts=30
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        if mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
            print_info "MongoDB is ready!"
            break
        fi
        print_info "Waiting for MongoDB... (attempt $attempt/$max_attempts)"
        sleep 1
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        print_error "MongoDB failed to start within expected time. Check logs/mongodb.log for details."
        exit 1
    fi
    
    print_status "MongoDB restarted successfully (PID: $MONGO_PID)"
}

# =============================================================================
# Step 3: Start Backend
# =============================================================================
start_backend() {
    print_status "Starting Backend..."
    
    cd "$BACKEND_DIR"
    
    # Check if virtual environment exists
    if [ ! -d "$VENV_DIR" ]; then
        print_info "Creating Python virtual environment..."
        python3 -m venv "$VENV_DIR"
    fi

    # Activate virtual environment and install dependencies
    print_info "Installing backend dependencies..."
    source "$VENV_DIR/bin/activate"
    # Use the virtual environment's pip directly to avoid externally-managed-environment error
    "$VENV_DIR/bin/pip" install -q -r requirements.txt
    deactivate
    
    # Start backend in background
    print_info "Starting backend server on $BACKEND_HOST:$BACKEND_PORT (accessible from network)..."
    source "$VENV_DIR/bin/activate"
    python3 -m uvicorn server:app --host "$BACKEND_HOST" --port "$BACKEND_PORT" &
    BACKEND_PID=$!
    deactivate
    
    # Wait for backend to be ready
    print_info "Waiting for backend to be ready..."
    sleep 3
    
    # Verify backend is running
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        print_error "Failed to start backend."
        exit 1
    fi
    
    print_status "Backend started successfully (PID: $BACKEND_PID)"
}

# =============================================================================
# Step 4: Start Frontend
# =============================================================================
start_frontend() {
    print_status "Starting Frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Install frontend dependencies with better error handling
    # Use --legacy-peer-deps for React 19 compatibility with some packages
    print_info "Installing frontend dependencies..."
    if ! npm install --silent --legacy-peer-deps 2>&1; then
        print_warning "npm install had some issues, continuing anyway..."
    fi
    
    # Set the backend URL environment variable (configurable via environment)
    # Use localhost for local development, can be overridden with network IP for remote access
    export REACT_APP_BACKEND_URL="${REACT_APP_BACKEND_URL:-http://127.0.0.1:$BACKEND_PORT}"
    
    # Start frontend in background
    print_info "Starting frontend server on $FRONTEND_HOST:$FRONTEND_PORT (accessible from network)..."
    BROWSER=none npm start -- --host "$FRONTEND_HOST" &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    print_info "Waiting for frontend to be ready..."
    sleep 5
    
    # Verify frontend is running
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
        print_error "Failed to start frontend."
        exit 1
    fi
    
    print_status "Frontend started successfully (PID: $FRONTEND_PID)"
}

# =============================================================================
# Step 5: Display status
# =============================================================================
display_status() {
    # Get local IP address for network access
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-local-ip")
    
    echo ""
    echo "============================================================================="
    echo -e "${GREEN}All services started successfully!${NC}"
    echo "============================================================================="
    echo ""
    echo "Services:"
    if [ "$USE_EXTERNAL_MONGO" = false ]; then
        echo -e "  ${BLUE}MongoDB${NC}:  running on 127.0.0.1:27017"
    else
        echo -e "  ${BLUE}MongoDB${NC}:  using external MongoDB (check backend/.env)"
    fi
    echo -e "  ${BLUE}Backend${NC}:  running on http://$BACKEND_HOST:$BACKEND_PORT"
    echo -e "  ${BLUE}Frontend${NC}: running on http://$FRONTEND_HOST:$FRONTEND_PORT"
    echo ""
    echo "Access from this machine:"
    echo -e "  ${BLUE}Frontend${NC}: http://localhost:$FRONTEND_PORT"
    echo -e "  ${BLUE}API${NC}:      http://localhost:$BACKEND_PORT"
    echo ""
    echo "Access from OTHER DEVICES on the same network:"
    echo -e "  ${BLUE}Frontend${NC}: http://$LOCAL_IP:$FRONTEND_PORT"
    echo -e "  ${BLUE}API${NC}:      http://$LOCAL_IP:$BACKEND_PORT"
    echo ""
    echo "API Documentation:"
    echo -e "  ${BLUE}Swagger UI${NC}: http://localhost:$BACKEND_PORT/docs"
    echo ""
    echo "Press ${YELLOW}Ctrl+C${NC} to stop all services."
    echo "============================================================================="
    echo ""
}

# =============================================================================
# Main execution
# =============================================================================
main() {
    print_status "Starting File Conversion Application..."
    print_info "Project directory: $PROJECT_DIR"
    
    # Create logs directory
    mkdir -p "$PROJECT_DIR/logs"
    
    # Fix port conflicts before starting services
    fix_port_conflicts_result=$(fix_port_conflicts)
    
    # Check if MongoDB was killed during port conflict resolution
    if echo "$fix_port_conflicts_result" | grep -q "MONGO_WAS_KILLED=true"; then
        # MongoDB was killed, so restart it
        restart_mongodb
    else
        # MongoDB wasn't killed, start normally
        start_mongodb
    fi
    
    # Start services
    start_backend
    start_frontend
    
    # Display status
    display_status
    
    # Keep script running and show logs
    echo ""
    print_info "Showing live logs... (Press Ctrl+C to stop)"
    echo ""
    
    # Wait for all processes
    wait
}

# Run main function
main

