#!/bin/bash
# Local testing script for ZANTARA webapp
# Created: 2025-10-14

echo "🚀 Starting ZANTARA Local Test Server..."
echo ""
echo "📂 Serving from: $(pwd)"
echo "🌐 URL: http://localhost:8888"
echo ""
echo "📝 Test pages:"
echo "   • Message Formatter: http://localhost:8888/test-message-formatter.html"
echo "   • Full Chat: http://localhost:8888/chat.html"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start Python HTTP server on port 8888
python3 -m http.server 8888

