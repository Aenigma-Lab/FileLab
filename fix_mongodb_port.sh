#!/bin/bash

# =============================================================================
# MongoDB Port Conflict Fix Script with Flexible Port Selection
# Detects and kills processes using MongoDB ports
# Tries ports in order: 27017 → 27018 → 27019
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

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

# Ports to try in order (host ports)
PORTS_TO_TRY=(27017 27018 27019)
SELECTED_PORT=""

# Check if a specific port is in use
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

# Find and kill process using a specific port
kill_port_process() {
    local port=$1
    print_warning "Port ${port} is already in use. Finding and killing the process..."
    
    # Try different methods to find and kill the process
    local killed=false
    
    # Method 1: Using fuser
    if command -v fuser &> /dev/null; then
        local pids=$(fuser ${port}/tcp 2>/dev/null | tr -s ' ' '\n' | grep -E '^[0-9]+$')
        if [ -n "$pids" ]; then
            print_info "Found processes using fuser: $pids"
            for pid in $pids; do
                print_info "Killing process $pid..."
                sudo kill -9 "$pid" 2>/dev/null || sudo kill "$pid" 2>/dev/null || true
            done
            killed=true
            sleep 2
        fi
    fi
    
    # Method 2: Using lsof
    if [ "$killed" = false ] && command -v lsof &> /dev/null; then
        local pids=$(lsof -ti :${port} 2>/dev/null)
        if [ -n "$pids" ]; then
            print_info "Found processes using lsof: $pids"
            for pid in $pids; do
                print_info "Killing process $pid..."
                sudo kill -9 "$pid" 2>/dev/null || sudo kill "$pid" 2>/dev/null || true
            done
            killed=true
            sleep 2
        fi
    fi
    
    # Method 3: Kill any mongod process running
    if [ "$killed" = false ]; then
        print_info "Trying to find mongod processes..."
        local mongod_pids=$(pgrep -x mongod 2>/dev/null || true)
        if [ -n "$mongod_pids" ]; then
            print_info "Found mongod processes: $mongod_pids"
            for pid in $mongod_pids; do
                print_info "Killing mongod process $pid..."
                sudo kill -9 "$pid" 2>/dev/null || sudo kill "$pid" 2>/dev/null || true
            done
            killed=true
            sleep 2
        fi
    fi
    
    # Method 4: Try to kill using pattern matching for MongoDB
    if [ "$killed" = false ]; then
        print_info "Searching for any MongoDB related processes..."
        local mongo_pids=$(pgrep -f "mongo" 2>/dev/null || true)
        if [ -n "$mongo_pids" ]; then
            print_info "Found MongoDB related processes: $mongo_pids"
            for pid in $mongo_pids; do
                print_info "Killing process $pid..."
                sudo kill -9 "$pid" 2>/dev/null || sudo kill "$pid" 2>/dev/null || true
            done
            killed=true
            sleep 2
        fi
    fi
    
    if [ "$killed" = true ]; then
        print_status "Processes killed successfully"
        return 0
    else
        print_warning "Could not automatically identify the process"
        return 1
    fi
}

# Remove stale Docker containers
cleanup_docker() {
    print_step "Checking for stale Docker containers..."
    
    # Check if there's a conflicting container
    if docker ps -a | grep -q "filelab-mongodb"; then
        print_info "Found existing filelab-mongodb container"
        print_info "Removing stale container..."
        docker rm -f filelab-mongodb 2>/dev/null || true
        print_status "Stale container removed"
    fi
    
    # Check for any containers using MongoDB ports
    for port in "${PORTS_TO_TRY[@]}"; do
        local containers=$(docker ps --format '{{.Names}}' | while read name; do
            docker port "$name" 2>/dev/null | grep "${port}" && echo "$name"
        done || true)
        
        if [ -n "$containers" ]; then
            print_warning "Found containers using port ${port}: $containers"
            for container in $containers; do
                print_info "Stopping container $container..."
                docker stop "$container" 2>/dev/null || true
                docker rm "$container" 2>/dev/null || true
            done
        fi
    done
    
    print_status "Conflicting containers cleaned up"
}

# Verify port is now free
verify_port_free() {
    local port=$1
    print_step "Verifying port ${port} is now free..."
    
    sleep 2
    
    if check_port "$port"; then
        print_error "Port ${port} is still in use. Manual intervention may be required."
        print_info "Try running: sudo lsof -i :${port}"
        return 1
    fi
    
    print_status "Port ${port} is now free!"
    return 0
}

# Find available port
find_available_port() {
    print_step "Finding available MongoDB port..."
    
    for port in "${PORTS_TO_TRY[@]}"; do
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
        SELECTED_PORT="$port"
        print_status "Using port ${port}"
        return 0
    done
    
    # All ports are in use
    return 1
}

# Create/update .env file with selected port
update_env_file() {
    local port=$1
    local project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local env_file="${project_dir}/.env"
    
    print_info "Setting MONGODB_HOST_PORT=${port}"
    
    if [ -f "$env_file" ]; then
        # Update existing .env file
        if grep -q "MONGODB_HOST_PORT=" "$env_file"; then
            sed -i "s/MONGODB_HOST_PORT=.*/MONGODB_HOST_PORT=${port}/" "$env_file"
        else
            echo "MONGODB_HOST_PORT=${port}" >> "$env_file"
        fi
    else
        # Create new .env file
        echo "MONGODB_HOST_PORT=${port}" > "$env_file"
    fi
    
    print_status ".env file updated with MONGODB_HOST_PORT=${port}"
}

# Main function
main() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║              MongoDB Port Conflict Resolution Script              ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Clean up Docker containers first
    cleanup_docker
    
    # Find available port
    if ! find_available_port; then
        echo ""
        print_error "All default MongoDB ports (27017, 27018, 27019) are in use!"
        echo ""
        echo "Manual steps to resolve:"
        echo "  1. Find the process: sudo lsof -i :27017"
        echo "  2. Kill the process: sudo kill -9 <PID>"
        echo "  3. Or stop any existing MongoDB service:"
        echo "     - Linux: sudo systemctl stop mongod"
        echo "     - Docker: docker stop \$(docker ps -q --filter ancestor=mongodb)"
        echo ""
        exit 1
    fi
    
    # Verify port is free
    if ! verify_port_free "$SELECTED_PORT"; then
        echo ""
        print_error "Failed to free port ${SELECTED_PORT} automatically."
        echo ""
        echo "Manual steps to resolve:"
        echo "  1. Find the process: sudo lsof -i :${SELECTED_PORT}"
        echo "  2. Kill the process: sudo kill -9 <PID>"
        echo "  3. Or stop any existing MongoDB service:"
        echo "     - Linux: sudo systemctl stop mongod"
        echo "     - Docker: docker stop \$(docker ps -q --filter ancestor=mongodb)"
        echo ""
        exit 1
    fi
    
    # Update .env file with selected port
    update_env_file "$SELECTED_PORT"
    
    echo ""
    print_status "MongoDB port conflict resolved successfully!"
    echo ""
    echo "MongoDB will use port: ${SELECTED_PORT}"
    echo ""
    echo "You can now run the installation script:"
    echo -e "  ${CYAN}./install.sh${NC}"
    echo ""
    
    # Export for current session
    export MONGODB_HOST_PORT="$SELECTED_PORT"
    
    exit 0
}

# Run main function
main

