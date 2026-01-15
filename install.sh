#!/bin/bash

# =============================================================================
# FileLab Docker Deployment Script
# One-command installation and startup for all services
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"

# Print colored banner
print_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                    ║"
    echo "║                      FileLab Docker Deployer                      ║"
    echo "║               Complete File Conversion Application                ║"
    echo "║                                                                    ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Print colored message
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[→]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_step "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo ""
        echo "Please install Docker first:"
        echo "  • Ubuntu/Debian: sudo apt-get install docker.io docker-compose"
        echo "  • CentOS/RHEL:   sudo yum install docker docker-compose"
        echo "  • macOS:         Download from https://docker.com/products/docker"
        echo "  • Windows:       Download from https://docker.com/products/docker"
        exit 1
    fi
    
    # Check Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running!"
        echo ""
        echo "Please start Docker and try again:"
        echo "  • Linux:         sudo systemctl start docker"
        echo "  • macOS/Windows: Start Docker Desktop application"
        exit 1
    fi
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed!"
        exit 1
    fi
    
    print_status "Docker is installed and running"
}

# Install required system packages
install_system_packages() {
    print_step "Installing required system packages..."

    # Check if running on Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        print_info "Detected Ubuntu/Debian system, installing packages..."

        # Update package list
        sudo apt-get update

        # Install Tesseract OCR with all languages and additional fonts
        sudo apt-get install -y tesseract-ocr-all ttf-mscorefonts-installer fonts-crosextra-carlito fonts-crosextra-caladea

        print_status "System packages installed successfully"
    else
        print_info "Non-Ubuntu/Debian system detected. Please ensure Tesseract OCR and required fonts are installed manually."
    fi
}

# Check system requirements
check_requirements() {
    print_step "Checking system requirements..."

    # Check available memory
    TOTAL_MEM=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || sysctl -n hw.memsize 2>/dev/null | awk '{print $1/1024}')

    if [ -z "$TOTAL_MEM" ]; then
        print_warning "Could not determine available memory"
    elif [ "$TOTAL_MEM" -lt 4096 ]; then
        print_warning "Low memory detected: ${TOTAL_MEM}MB (recommended: 4096MB+)"
    else
        print_status "Memory check passed: ${TOTAL_MEM}MB available"
    fi

    # Check disk space
    DISK_AVAIL=$(df -BG . 2>/dev/null | awk 'NR==2 {print $4}' | sed 's/G//' || echo "10")

    if [ "$DISK_AVAIL" -lt 10 ]; then
        print_error "Insufficient disk space: ${DISK_AVAIL}GB available (minimum: 10GB)"
        exit 1
    fi

    print_status "Disk space check passed: ${DISK_AVAIL}GB available"
}

# Setup environment files
setup_env() {
    print_step "Setting up environment files..."
    
    # Backend .env
    if [ ! -f "${PROJECT_DIR}/backend/.env" ]; then
        if [ -f "${PROJECT_DIR}/backend/.env.example" ]; then
            cp "${PROJECT_DIR}/backend/.env.example" "${PROJECT_DIR}/backend/.env"
            print_status "Created backend/.env from template"
        else
            cat > "${PROJECT_DIR}/backend/.env" << 'EOF'
MONGO_URL=mongodb://mongodb:27017
DB_NAME=filelab
CORS_ORIGINS=http://localhost:3000,http://frontend:3000
TEMP_DIR=/app/tmp
EOF
            print_status "Created default backend/.env"
        fi
    else
        print_info "backend/.env already exists, skipping"
    fi
}

# Fix MongoDB port conflicts with flexible port selection
fix_port_conflicts() {
    print_step "Checking for MongoDB port availability..."
    
    # Ports to try in order (host ports)
    local ports_to_try=(27017 27018 27019)
    local selected_port=""
    local port_in_use=false
    
    # Function to check if a port is in use
    check_port() {
        local port=$1
        # Check using ss
        if command -v ss &> /dev/null; then
            if ss -tuln 2>/dev/null | grep -q ":${port} "; then
                return 0  # Port in use
            fi
        fi
        
        # Check using netstat as fallback
        if command -v netstat &> /dev/null; then
            if netstat -tuln 2>/dev/null | grep -q ":${port} "; then
                return 0  # Port in use
            fi
        fi
        
        # Check using lsof as fallback
        if command -v lsof &> /dev/null; then
            if lsof -i :${port} &>/dev/null; then
                return 0  # Port in use
            fi
        fi
        
        # Check using fuser as fallback
        if command -v fuser &> /dev/null; then
            if fuser ${port}/tcp &>/dev/null 2>/dev/null; then
                return 0  # Port in use
            fi
        fi
        
        return 1  # Port is free
    }
    
    # Function to kill process using a port
    kill_port_process() {
        local port=$1
        print_info "Attempting to free port ${port}..."
        
        # Try fuser first
        if command -v fuser &> /dev/null; then
            fuser -k ${port}/tcp 2>/dev/null || true
        fi
        
        # Try lsof
        if command -v lsof &> /dev/null; then
            lsof -ti :${port} 2>/dev/null | xargs -r kill -9 2>/dev/null || true
        fi
        
        # Kill any mongod processes
        pkill -9 mongod 2>/dev/null || true
        
        sleep 2
    }
    
    # Try each port in order
    for port in "${ports_to_try[@]}"; do
        print_info "Checking port ${port}..."
        
        if check_port "$port"; then
            print_warning "Port ${port} is in use, attempting to free it..."
            kill_port_process "$port"
            
            # Check again after killing
            sleep 1
            if check_port "$port"; then
                print_warning "Could not free port ${port}, trying next port..."
                continue
            fi
        fi
        
        # Port is free (or was freed)
        selected_port="$port"
        print_status "Using port ${port}"
        break
    done
    
    # If no port was selected, all ports are in use
    if [ -z "$selected_port" ]; then
        print_error "All default MongoDB ports (27017, 27018, 27017) are in use!"
        print_info "Please manually stop any running MongoDB instances or Docker containers."
        print_info "Commands to stop MongoDB:"
        echo "  • Linux (systemd): sudo systemctl stop mongod"
        echo "  • Docker: docker stop \$(docker ps -q --filter ancestor=mongodb)"
        echo "  • Find process: sudo lsof -i :27017"
        exit 1
    fi
    
    # Export the selected port for docker-compose
    export MONGODB_HOST_PORT="$selected_port"
    
    # Create/update .env file with the selected port
    print_info "Setting MONGODB_HOST_PORT=${selected_port}"
    
    # Update or create .env file for docker-compose
    env_file="${PROJECT_DIR}/.env"
    if [ -f "$env_file" ]; then
        # Update existing .env file
        if grep -q "MONGODB_HOST_PORT=" "$env_file"; then
            sed -i "s/MONGODB_HOST_PORT=.*/MONGODB_HOST_PORT=${selected_port}/" "$env_file"
        else
            echo "MONGODB_HOST_PORT=${selected_port}" >> "$env_file"
        fi
    else
        # Create new .env file
        echo "MONGODB_HOST_PORT=${selected_port}" > "$env_file"
    fi
    
    # Clean up any stale Docker containers
    print_info "Cleaning up stale Docker containers..."
    docker rm -f filelab-mongodb 2>/dev/null || true
    
    print_status "MongoDB will use port ${selected_port}"
}

# Pull and build images
build_images() {
    print_step "Building Docker images (this may take a few minutes)..."
    
    cd "$PROJECT_DIR"
    
    # Pull base images first
    print_info "Pulling base images..."
    sudo docker pull mongodb/mongodb-community-server:6.0.16-ubuntu2204 || true
    sudo docker pull node:20-alpine || true
    sudo docker pull nginx:alpine || true
    
    # Build all services
    print_info "Building service images..."
    sudo docker compose build --no-cache
    
    print_status "All images built successfully"
}

# Start services
start_services() {
    print_step "Starting services..."
    
    cd "$PROJECT_DIR"
    
    # Start MongoDB first (it has a health check)
    print_info "Starting MongoDB..."
    sudo docker compose up -d mongodb
    
    # Wait for MongoDB to be healthy
    print_info "Waiting for MongoDB to be ready..."
    MAX_ATTEMPTS=60
    ATTEMPT=0
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if sudo docker compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet &>/dev/null; then
            print_status "MongoDB is ready!"
            break
        fi
        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 2
    done
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        print_error "MongoDB failed to start. Check logs with: docker compose logs mongodb"
        exit 1
    fi
    echo ""
    
    # Start backend
    print_info "Starting Backend..."
    sudo docker compose up -d backend
    
    # Wait for backend to be ready
    print_info "Waiting for Backend to be ready..."
    ATTEMPT=0
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if sudo docker compose exec -T backend curl -sf http://localhost:8000/api &>/dev/null; then
            print_status "Backend is ready!"
            break
        fi
        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 2
    done
    echo ""
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        print_warning "Backend may not be ready yet. Check logs with: docker compose logs backend"
    fi
    
    # Start frontend
    print_info "Starting Frontend..."
    sudo docker compose up -d frontend
    
    print_status "All services started!"
}

# Display service status
show_status() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    All Services Started!                           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${BLUE}┌─────────────────────────────────────────────────────────┐${NC}"
    echo -e "  ${BLUE}│${NC}  Service       URL                    Status          ${BLUE}│${NC}"
    echo -e "  ${BLUE}├─────────────────────────────────────────────────────────┤${NC}"
    
    # Check each service status
    FRONTEND_STATUS=$(sudo docker compose ps --filter "name=frontend" --format json 2>/dev/null | grep -q "running" && echo -e "${GREEN}● Running${NC}" || echo -e "${YELLOW}● Starting${NC}")
    BACKEND_STATUS=$(sudo docker compose ps --filter "name=backend" --format json 2>/dev/null | grep -q "running" && echo -e "${GREEN}● Running${NC}" || echo -e "${YELLOW}● Starting${NC}")
    MONGODB_STATUS=$(sudo docker compose ps --filter "name=mongodb" --format json 2>/dev/null | grep -q "running" && echo -e "${GREEN}● Running${NC}" || echo -e "${YELLOW}● Starting${NC}")
    
    printf "  ${BLUE}│${NC}  %-12s %-22s %-15s ${BLUE}│${NC}\n" "Frontend" "http://localhost:3000" "$FRONTEND_STATUS"
    printf "  ${BLUE}│${NC}  %-12s %-22s %-15s ${BLUE}│${NC}\n" "Backend" "http://localhost:8000" "$BACKEND_STATUS"
    printf "  ${BLUE}│${NC}  %-12s %-22s %-15s ${BLUE}│${NC}\n" "API Docs" "http://localhost:8000/docs" "$BACKEND_STATUS"
    printf "  ${BLUE}│${NC}  %-12s %-22s %-15s ${BLUE}│${NC}\n" "MongoDB" "localhost:27017" "$MONGODB_STATUS"
    echo -e "  ${BLUE}└─────────────────────────────────────────────────────────┘${NC}"
    echo ""
    echo "  Useful Commands:"
    echo -e "    ${CYAN}• View logs:${NC}      docker compose logs -f"
    echo -e "    ${CYAN}• Stop services:${NC} docker compose down"
    echo -e "    ${CYAN}• Restart:${NC}       docker compose restart"
    echo -e "    ${CYAN}• Full rebuild:${NC}  docker compose up -d --build"
    echo ""
    echo -e "  ${YELLOW}Press Ctrl+C to exit and stop services, or run 'docker compose down' later.${NC}"
    echo ""
}

# Main function
main() {
    print_banner
    
    # Check Docker
    check_docker
    
    # Check system requirements
    check_requirements
    
    # Fix port conflicts before proceeding
    fix_port_conflicts
    
    # Setup environment
    setup_env
    
    # Build and start services
    build_images
    start_services
    
    # Show status
    show_status
    
    # Keep script running
    echo ""
    print_info "Showing live logs... (Press Ctrl+C to stop)"
    echo ""
    
    # Follow logs
    cd "$PROJECT_DIR"
    sudo docker compose logs -f --tail=100
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "FileLab Docker Deployment Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h       Show this help message"
        echo "  --build-only     Only build images, don't start services"
        echo "  --start          Start existing containers"
        echo "  --stop           Stop all services"
        echo "  --restart        Restart all services"
        echo "  --logs           Show logs and exit"
        echo "  --status         Show service status"
        echo "  --clean          Stop and remove all containers and volumes"
        echo ""
        exit 0
        ;;
    --build-only)
        install_system_packages
        check_docker
        check_requirements
        setup_env
        build_images
        print_status "Build complete! Run './install.sh --start' to start services."
        exit 0
        ;;
    --start)
        install_system_packages
        check_docker
        setup_env
        start_services
        show_status
        cd "$PROJECT_DIR"
        sudo docker compose logs -f --tail=50
        ;;
    --stop)
        cd "$PROJECT_DIR"
        print_status "Stopping all services..."
        sudo docker compose down
        print_status "All services stopped."
        exit 0
        ;;
    --restart)
        cd "$PROJECT_DIR"
        print_status "Restarting all services..."
        sudo docker compose restart
        sleep 5
        show_status
        exit 0
        ;;
    --logs)
        cd "$PROJECT_DIR"
        sudo docker compose logs -f --tail=100
        ;;
    --status)
        cd "$PROJECT_DIR"
        sudo docker compose ps
        exit 0
        ;;
    --clean)
        cd "$PROJECT_DIR"
        print_warning "This will remove ALL data including MongoDB database!"
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY =~ ^yes$ ]]; then
            print_status "Stopping and removing all services and volumes..."
            sudo docker compose down -v
            print_status "All services and data removed."
        else
            print_info "Cancelled."
        fi
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Run '$0 --help' for usage information."
        exit 1
        ;;
esac

