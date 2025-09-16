#!/bin/bash

# Termux Tool Startup Script
# This script starts the Node.js menu application

echo "🚀 Starting Termux Tool..."
echo "📍 Location: $(pwd)"
echo "🔧 Node Version: $(node --version)"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js first: pkg install nodejs"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo
fi

# Start the application
echo "🎯 Launching Termux Tool Menu..."
echo "═══════════════════════════════════════"
node index.js