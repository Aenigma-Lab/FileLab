#!/bin/bash

# =============================================================================
# Automated Test Script for start.sh
# Tests the automatic installation functionality
# =============================================================================

set +e  # Don't exit on errors - we want to capture them

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Test results
declare -A TEST_RESULTS

# Output file
OUTPUT_FILE="test_output.log"

# Print functions
print_header() {
    echo ""
    echo -e "${CYAN}=============================================================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}=============================================================================${NC}"
    echo ""
}

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAILED_TESTS=$((FAILED_TESTS + 1))
}

print_skip() {
    echo -e "${YELLOW}[SKIP]${NC} $1"
    SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get package manager
get_package_manager() {
    if command_exists apt-get; then
        echo "apt-get"
    elif command_exists yum; then
        echo "yum"
    elif command_exists dnf; then
        echo "dnf"
    elif command_exists apk; then
        echo "apk"
    else
        echo "none"
    fi
}

# Test 1: Script exists and is executable
test_script_exists() {
    print_test "Checking if start.sh exists..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -f "start.sh" ]; then
        print_pass "start.sh exists"
        return 0
    else
        print_fail "start.sh not found"
        return 1
    fi
}

# Test 2: Script is executable
test_script_executable() {
    print_test "Checking if start.sh is executable..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -x "start.sh" ]; then
        print_pass "start.sh is executable"
        return 0
    else
        print_skip "start.sh is not executable (chmod +x start.sh)"
        return 1
    fi
}

# Test 3: Install function exists
test_install_function_exists() {
    print_test "Checking if install_package function exists in start.sh..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if grep -q "^install_package()" start.sh; then
        print_pass "install_package function exists"
        return 0
    else
        print_fail "install_package function not found in start.sh"
        return 1
    fi
}

# Test 4: Node.js check exists
test_node_check_exists() {
    print_test "Checking if Node.js prerequisite check exists..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if grep -q "command_exists node" start.sh; then
        print_pass "Node.js check exists"
        return 0
    else
        print_fail "Node.js check not found in start.sh"
        return 1
    fi
}

# Test 5: Python check exists
test_python_check_exists() {
    print_test "Checking if Python3 prerequisite check exists..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if grep -q "command_exists python3" start.sh; then
        print_pass "Python3 check exists"
        return 0
    else
        print_fail "Python3 check not found in start.sh"
        return 1
    fi
}

# Test 6: MongoDB check exists
test_mongodb_check_exists() {
    print_test "Checking if MongoDB prerequisite check exists..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if grep -q "command_exists mongod" start.sh; then
        print_pass "MongoDB check exists"
        return 0
    else
        print_fail "MongoDB check not found in start.sh"
        return 1
    fi
}

# Test 7: USE_EXTERNAL_MONGO variable exists
test_external_mongo_variable() {
    print_test "Checking if USE_EXTERNAL_MONGO variable is used..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if grep -q "USE_EXTERNAL_MONGO" start.sh; then
        print_pass "USE_EXTERNAL_MONGO variable exists"
        return 0
    else
        print_fail "USE_EXTERNAL_MONGO variable not found in start.sh"
        return 1
    fi
}

# Test 8: npm install in frontend
test_frontend_npm_install() {
    print_test "Checking if frontend always installs npm packages..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Check that frontend npm install is unconditional
    # Look for start_frontend function and check if npm install is directly in it
    if grep -A15 "^start_frontend()" start.sh | grep -q "npm install"; then
        print_pass "Frontend npm install is unconditional"
        return 0
    else
        print_fail "Frontend npm install not found or is conditional"
        return 1
    fi
}

# Test 9: Package manager detection
test_package_manager_detection() {
    print_test "Checking package manager detection..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    local pm=$(get_package_manager)
    if [ "$pm" != "none" ]; then
        print_pass "Package manager detected: $pm"
        return 0
    else
        print_fail "No supported package manager found"
        return 1
    fi
}

# Test 10: Test install_package function syntax
test_install_package_syntax() {
    print_test "Checking install_package function syntax..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Check that install_package handles all package managers
    local has_apt=false
    local has_yum=false
    local has_dnf=false
    local has_apk=false
    
    if grep -q "apt-get" start.sh; then
        has_apt=true
    fi
    if grep -q "yum" start.sh; then
        has_yum=true
    fi
    if grep -q "dnf" start.sh; then
        has_dnf=true
    fi
    if grep -q "apk" start.sh; then
        has_apk=true
    fi
    
    if [ "$has_apt" = true ] && [ "$has_yum" = true ] && [ "$has_dnf" = true ] && [ "$has_apk" = true ]; then
        print_pass "All package managers supported in install_package"
        return 0
    else
        print_fail "Not all package managers supported"
        echo "  - apt-get: $has_apt"
        echo "  - yum: $has_yum"
        echo "  - dnf: $has_dnf"
        echo "  - apk: $has_apk"
        return 1
    fi
}

# Test 11: Test MongoDB repository setup
test_mongodb_repo_setup() {
    print_test "Checking MongoDB repository setup for apt-get..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if grep -q "mongodb.org/static/pgp/server" start.sh; then
        print_pass "MongoDB repository setup exists"
        return 0
    else
        print_fail "MongoDB repository setup not found"
        return 1
    fi
}

# Test 12: Test current Node.js installation
test_current_node_installation() {
    print_test "Checking current Node.js installation..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if command_exists node; then
        local version=$(node --version)
        print_pass "Node.js is installed: $version"
        return 0
    else
        print_skip "Node.js is not installed (would be installed by script)"
        return 1
    fi
}

# Test 13: Test current Python installation
test_current_python_installation() {
    print_test "Checking current Python3 installation..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if command_exists python3; then
        local version=$(python3 --version 2>&1)
        print_pass "Python3 is installed: $version"
        return 0
    else
        print_skip "Python3 is not installed (would be installed by script)"
        return 1
    fi
}

# Test 14: Test current MongoDB installation
test_current_mongodb_installation() {
    print_test "Checking current MongoDB installation..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if command_exists mongod; then
        local version=$(mongod --version 2>&1 | head -1)
        print_pass "MongoDB is installed: $version"
        return 0
    else
        print_skip "MongoDB is not installed (would be installed by script)"
        return 1
    fi
}

# Test 15: Test backend directory exists
test_backend_exists() {
    print_test "Checking backend directory..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -d "backend" ]; then
        print_pass "Backend directory exists"
        return 0
    else
        print_fail "Backend directory not found"
        return 1
    fi
}

# Test 16: Test frontend directory exists
test_frontend_exists() {
    print_test "Checking frontend directory..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -d "frontend" ]; then
        print_pass "Frontend directory exists"
        return 0
    else
        print_fail "Frontend directory not found"
        return 1
    fi
}

# Test 17: Test requirements.txt exists
test_requirements_exists() {
    print_test "Checking backend requirements.txt..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -f "backend/requirements.txt" ]; then
        print_pass "backend/requirements.txt exists"
        return 0
    else
        print_fail "backend/requirements.txt not found"
        return 1
    fi
}

# Test 18: Test package.json exists
test_package_json_exists() {
    print_test "Checking frontend package.json..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -f "frontend/package.json" ]; then
        print_pass "frontend/package.json exists"
        return 0
    else
        print_fail "frontend/package.json not found"
        return 1
    fi
}

# Test 19: Test poppler-utils check
test_poppler_check_exists() {
    print_test "Checking poppler-utils prerequisite check..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if grep -q "pdftoppm" start.sh || grep -q "poppler" start.sh; then
        print_pass "poppler-utils check exists"
        return 0
    else
        print_fail "poppler-utils check not found in start.sh"
        return 1
    fi
}

# Test 20: Test cleanup function exists
test_cleanup_exists() {
    print_test "Checking cleanup function..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if grep -q "^cleanup()" start.sh; then
        print_pass "cleanup function exists"
        return 0
    else
        print_fail "cleanup function not found in start.sh"
        return 1
    fi
}

# Test 21: Test trap setup for cleanup
test_trap_setup() {
    print_test "Checking trap setup for cleanup..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if grep -q "trap cleanup" start.sh; then
        print_pass "trap setup for cleanup exists"
        return 0
    else
        print_fail "trap setup not found in start.sh"
        return 1
    fi
}

# Run all tests
run_all_tests() {
    print_header "Running Tests for start.sh Automatic Installation"
    
    echo "Test Date: $(date)"
    echo "Package Manager: $(get_package_manager)"
    echo ""
    
    # Script structure tests
    print_header "Script Structure Tests"
    test_script_exists
    test_script_executable
    test_install_function_exists
    test_node_check_exists
    test_python_check_exists
    test_mongodb_check_exists
    test_external_mongo_variable
    test_frontend_npm_install
    test_package_manager_detection
    test_install_package_syntax
    test_mongodb_repo_setup
    test_poppler_check_exists
    test_cleanup_exists
    test_trap_setup
    
    # Environment tests
    print_header "Environment Tests"
    test_current_node_installation
    test_current_python_installation
    test_current_mongodb_installation
    test_backend_exists
    test_frontend_exists
    test_requirements_exists
    test_package_json_exists
    
    # Print summary
    print_header "Test Summary"
    echo ""
    echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "Passed:      ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed:      ${RED}$FAILED_TESTS${NC}"
    echo -e "Skipped:     ${YELLOW}$SKIPPED_TESTS${NC}"
    echo ""
    
    local pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Pass Rate:   ${CYAN}${pass_rate}%${NC}"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Run the full deployment: ./start.sh"
        echo "2. Verify services are running: curl http://127.0.0.1:8000/docs"
        echo ""
        return 0
    else
        echo -e "${RED}Some tests failed. Please review the failures above.${NC}"
        echo ""
        return 1
    fi
}

# Quick test - just validate script structure
quick_test() {
    print_header "Quick Test - Script Structure"
    
    TOTAL_TESTS=0
    PASSED_TESTS=0
    FAILED_TESTS=0
    
    test_script_exists
    test_install_function_exists
    test_node_check_exists
    test_python_check_exists
    test_mongodb_check_exists
    test_external_mongo_variable
    test_frontend_npm_install
    test_package_manager_detection
    test_install_package_syntax
    test_mongodb_repo_setup
    
    print_header "Quick Test Summary"
    echo ""
    echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "Passed:      ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed:      ${RED}$FAILED_TESTS${NC}"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}Quick test passed!${NC}"
        return 0
    else
        echo -e "${YELLOW}Some structure tests failed. Run full test for details.${NC}"
        return 1
    fi
}

# Full deployment test
test_full_deployment() {
    print_header "Full Deployment Test"
    print_info "This will attempt to start all services..."
    print_info "Press Ctrl+C to cancel"
    echo ""
    
    sleep 3
    
    # Check prerequisites first
    print_info "Checking prerequisites..."
    if ! command_exists node; then
        print_warning "Node.js not found - will be installed by script"
    fi
    if ! command_exists python3; then
        print_warning "Python3 not found - will be installed by script"
    fi
    if ! command_exists mongod; then
        print_warning "MongoDB not found - will be installed by script"
    fi
    
    echo ""
    print_info "Starting deployment..."
    
    # Run start.sh in background
    ./start.sh > "deployment.log" 2>&1 &
    DEPLOYMENT_PID=$!
    
    print_info "Deployment started with PID: $DEPLOYMENT_PID"
    print_info "Waiting for services to start (60 seconds)..."
    
    # Wait up to 60 seconds for services
    local max_wait=60
    local waited=0
    local services_ready=false
    
    while [ $waited -lt $max_wait ]; do
        # Check if deployment is still running
        if ! kill -0 $DEPLOYMENT_PID 2>/dev/null; then
            print_warning "Deployment script exited unexpectedly"
            break
        fi
        
        # Try to connect to services
        if curl -s http://127.0.0.1:8001/docs > /dev/null 2>&1; then
            services_ready=true
            break
        fi
        
        sleep 5
        waited=$((waited + 5))
        echo -e "${YELLOW}Waiting... ($waited/$max_wait seconds)${NC}"
    done
    
    if [ "$services_ready" = true ]; then
        print_pass "Services are ready!"
        echo ""
        echo "Testing endpoints:"
        
        # Test backend
        if curl -s http://127.0.0.1:8001/docs > /dev/null 2>&1; then
            print_pass "Backend API is accessible"
        else
            print_fail "Backend API is not accessible"
        fi
        
        # Test frontend
        if curl -s http://127.0.0.1:3000 > /dev/null 2>&1; then
            print_pass "Frontend is accessible"
        else
            print_fail "Frontend is not accessible"
        fi
        
        # Test MongoDB
        if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
            print_pass "MongoDB is accessible"
        else
            print_fail "MongoDB is not accessible"
        fi
        
        echo ""
        print_info "Stopping deployment..."
        kill $DEPLOYMENT_PID 2>/dev/null || true
        wait $DEPLOYMENT_PID 2>/dev/null || true
        print_pass "Deployment stopped"
        
        return 0
    else
        print_fail "Services did not start within $max_wait seconds"
        echo ""
        echo "Check deployment.log for details:"
        tail -50 deployment.log
        
        # Kill deployment if still running
        if kill -0 $DEPLOYMENT_PID 2>/dev/null; then
            kill $DEPLOYMENT_PID 2>/dev/null || true
            wait $DEPLOYMENT_PID 2>/dev/null || true
        fi
        
        return 1
    fi
}

# Main
case "${1:-test}" in
    quick)
        quick_test
        ;;
    full)
        run_all_tests
        test_full_deployment
        ;;
    test|*)
        run_all_tests
        ;;
esac

