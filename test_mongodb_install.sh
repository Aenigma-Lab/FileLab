#!/bin/bash

# Test script for MongoDB installation logic from start.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_status() {
    echo -e "${GREEN}[TEST]${NC} $1"
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

# MongoDB installation logic from start.sh
print_info "Checking for MongoDB..."
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
            print_status "MongoDB installed successfully."
        else
            print_error "Failed to install MongoDB."
            exit 1
        fi
    elif command_exists yum; then
        if install_package mongodb-server; then
            print_status "MongoDB installed successfully."
        else
            print_error "Failed to install MongoDB."
            exit 1
        fi
    elif command_exists dnf; then
        if install_package mongodb-server; then
            print_status "MongoDB installed successfully."
        else
            print_error "Failed to install MongoDB."
            exit 1
        fi
    elif command_exists apk; then
        if install_package mongodb; then
            print_status "MongoDB installed successfully."
        else
            print_error "Failed to install MongoDB."
            exit 1
        fi
    else
        print_error "Could not install MongoDB automatically."
        exit 1
    fi
else
    print_status "MongoDB is already installed."
fi

# Verify installation
if command_exists mongod; then
    print_status "MongoDB installation verified. mongod command is available."
    mongod --version
else
    print_error "MongoDB installation failed. mongod command not found."
    exit 1
fi
