#!/bin/bash

# Black Diamond Rust Ecosystem Deployment Script
# Automated deployment for production environments

set -e

echo "🦀 Black Diamond Rust Ecosystem Deployment"
echo "=========================================="

# Configuration
APP_NAME="black-diamond-rust-ecosystem"
DOCKER_IMAGE="$APP_NAME:latest"
CONTAINER_NAME="black-diamond-server"
PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -z "$F8_WALLET_PRIVATE_KEY" ]; then
        print_warning "F8_WALLET_PRIVATE_KEY not set. The application may not function properly."
    fi
    
    if [ -z "$F8_WALLET_PUBLIC_KEY" ]; then
        print_warning "F8_WALLET_PUBLIC_KEY not set. Using default value."
        export F8_WALLET_PUBLIC_KEY="F8YBeyqTF8VRZXQhCGKf6D1oGxPnTj8SkNeQc6vMxKv8"
    fi
    
    if [ -z "$SOLANA_RPC_ENDPOINT" ]; then
        print_warning "SOLANA_RPC_ENDPOINT not set. Using default QuickNode endpoint."
        export SOLANA_RPC_ENDPOINT="https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed/"
    fi
    
    print_success "Environment variables checked"
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    
    if docker build -t $DOCKER_IMAGE . ; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Stop existing container
stop_existing() {
    print_status "Stopping existing container if running..."
    
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        print_success "Existing container stopped and removed"
    else
        print_status "No existing container found"
    fi
}

# Run new container
run_container() {
    print_status "Starting new container..."
    
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:3000 \
        -e F8_WALLET_PRIVATE_KEY="$F8_WALLET_PRIVATE_KEY" \
        -e F8_WALLET_PUBLIC_KEY="$F8_WALLET_PUBLIC_KEY" \
        -e SOLANA_RPC_ENDPOINT="$SOLANA_RPC_ENDPOINT" \
        -e RUST_LOG="${RUST_LOG:-info}" \
        $DOCKER_IMAGE
    
    if [ $? -eq 0 ]; then
        print_success "Container started successfully"
        print_status "Container name: $CONTAINER_NAME"
        print_status "Port: $PORT"
        print_status "Access the API at: http://localhost:$PORT/api/status"
    else
        print_error "Failed to start container"
        exit 1
    fi
}

# Wait for health check
wait_for_health() {
    print_status "Waiting for application to be healthy..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "http://localhost:$PORT/api/status" > /dev/null 2>&1; then
            print_success "Application is healthy and responding"
            return 0
        fi
        
        attempt=$((attempt + 1))
        print_status "Attempt $attempt/$max_attempts - waiting for health check..."
        sleep 2
    done
    
    print_error "Application failed to become healthy within $max_attempts attempts"
    print_status "Check container logs: docker logs $CONTAINER_NAME"
    return 1
}

# Show container status
show_status() {
    print_status "Container Status:"
    docker ps -f name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    print_status "Recent logs:"
    docker logs --tail 10 $CONTAINER_NAME
}

# Deployment modes
case "${1:-docker}" in
    "docker")
        print_status "Starting Docker deployment..."
        check_docker
        check_env_vars
        build_image
        stop_existing
        run_container
        wait_for_health
        show_status
        print_success "Deployment completed successfully!"
        ;;
    
    "native")
        print_status "Starting native Rust deployment..."
        check_env_vars
        
        print_status "Building release binary..."
        if cargo build --release; then
            print_success "Build completed"
        else
            print_error "Build failed"
            exit 1
        fi
        
        print_status "Starting Black Diamond server..."
        ./target/release/black_diamond_server \
            --host $HOST \
            --port $PORT \
            --rpc-endpoint "$SOLANA_RPC_ENDPOINT" \
            --f8-wallet-public-key "$F8_WALLET_PUBLIC_KEY"
        ;;
    
    "status")
        print_status "Checking deployment status..."
        if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
            show_status
            print_status "API Status:"
            curl -s "http://localhost:$PORT/api/status" | head -20
        else
            print_error "Container $CONTAINER_NAME is not running"
        fi
        ;;
    
    "stop")
        print_status "Stopping Black Diamond deployment..."
        docker stop $CONTAINER_NAME 2>/dev/null && print_success "Container stopped" || print_warning "Container was not running"
        ;;
    
    "logs")
        print_status "Showing container logs..."
        docker logs -f $CONTAINER_NAME
        ;;
    
    "clean")
        print_status "Cleaning up deployment..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        docker rmi $DOCKER_IMAGE 2>/dev/null || true
        print_success "Cleanup completed"
        ;;
    
    *)
        echo "Usage: $0 [docker|native|status|stop|logs|clean]"
        echo ""
        echo "Commands:"
        echo "  docker  - Deploy using Docker (default)"
        echo "  native  - Deploy native Rust binary"
        echo "  status  - Check deployment status"
        echo "  stop    - Stop running deployment"
        echo "  logs    - Show container logs"
        echo "  clean   - Clean up deployment"
        echo ""
        echo "Environment variables:"
        echo "  F8_WALLET_PRIVATE_KEY - Your F8 wallet private key"
        echo "  F8_WALLET_PUBLIC_KEY  - Your F8 wallet public key"
        echo "  SOLANA_RPC_ENDPOINT   - Solana RPC endpoint URL"
        echo "  PORT                  - Server port (default: 3000)"
        echo "  HOST                  - Server host (default: 0.0.0.0)"
        echo "  RUST_LOG              - Log level (default: info)"
        exit 1
        ;;
esac