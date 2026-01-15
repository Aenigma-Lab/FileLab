# Frontend Dockerfile with React, Craco, TailwindCSS

# Build stage - use Node.js to build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Set environment variables for production build
ENV CI=true
ENV BROWSER=none
# Set PUBLIC_URL for proper asset path resolution in Docker
ENV PUBLIC_URL=/
# Use empty REACT_APP_BACKEND_URL to enable relative API paths for cross-device compatibility
# When empty, the frontend will use relative paths (/api/) which nginx proxies to backend
ENV REACT_APP_BACKEND_URL=
# Increase Node.js memory limit for large builds (8GB for safer minification)
ENV NODE_OPTIONS=--max-old-space-size=8192
# Skip chromium download for pdfjs-dist in Docker (we don't need headless Chrome)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV SKIP_PREFLIGHT_CHECK=true

# Create tmp directory for build logs
RUN mkdir -p /app/tmp

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with reliable settings
# Using npm install instead of npm ci for better compatibility in Docker
RUN echo "Installing dependencies..." && \
    npm install --no-audit --legacy-peer-deps 2>&1 | tee /app/tmp/npm-install.log || { \
        echo "========================================="; \
        echo "NPM INSTALL FAILED! Exit code: $?"; \
        echo "========================================="; \
        echo "--- NPM Install Output (last 50 lines) ---"; \
        tail -50 /app/tmp/npm-install.log 2>/dev/null || true; \
        echo "--- Node.js version ---"; \
        node --version; \
        echo "--- NPM version ---"; \
        npm --version; \
        echo "========================================="; \
        exit 1; \
    }

# Copy source code
COPY . .

# Build the application with improved error handling
RUN echo "Starting build..." && \
    npm run build 2>&1 | tee /app/tmp/build.log || { \
        echo "========================================="; \
        echo "BUILD FAILED! Exit code: $?"; \
        echo "========================================="; \
        echo ""; \
        echo "--- Build Output (last 150 lines) ---"; \
        tail -150 /app/tmp/build.log 2>/dev/null || true; \
        echo ""; \
        echo "--- Checking for webpack build errors ---"; \
        grep -i "error\|failed\|warning" /app/tmp/build.log 2>/dev/null | tail -50 || echo "No errors found in logs"; \
        echo ""; \
        echo "--- Build directory status ---"; \
        ls -la /app/build 2>/dev/null || echo "No build directory"; \
        echo "--- Static files directory ---"; \
        ls -la /app/build/static 2>/dev/null || echo "No static directory"; \
        echo "========================================="; \
        exit 1; \
    }

# Verify build output
RUN echo "Verifying build output..." && \
    ls -la /app/build/ && \
    ls -la /app/build/static/js/ 2>/dev/null && \
    test -f /app/build/index.html && \
    echo "Build verification successful!"

# Production stage - use Nginx to serve the built application
FROM nginx:alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx.conf for configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy server configuration to conf.d directory
COPY server_http.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

