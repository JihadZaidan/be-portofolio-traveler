#!/bin/bash

echo "🔐 Testing Complete OAuth Authentication Flow"
echo "=========================================="
echo ""

# Check if backend is running
echo "📡 Checking backend status..."
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is running on port 5000"
else
    echo "❌ Backend is not running on port 5000"
    echo "Please start backend with: cd be-travello && npm run dev"
    exit 1
fi

# Check if frontend is running
echo ""
echo "📡 Checking frontend status..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running on port 5173"
else
    echo "❌ Frontend is not running on port 5173"
    echo "Please start frontend with: cd fe-travello && npm run dev"
    exit 1
fi

# Test OAuth configuration
echo ""
echo "🔧 Testing OAuth Configuration..."
echo "Google OAuth Config:"
curl -s http://localhost:5000/api/auth/config | jq '.data.config' 2>/dev/null || echo "Failed to get config"

echo ""
echo "GitHub OAuth Test:"
curl -s "http://localhost:5000/api/auth/github" | head -c 200
echo "..."

echo ""
echo "=========================================="
echo "🌐 Manual Testing Instructions:"
echo ""
echo "1. Open browser: http://localhost:5173"
echo "2. Go to AI Chatbot page"
echo "3. Click 'Sign in with Google'"
echo "4. Complete Google OAuth flow"
echo "5. Verify user is logged in"
echo ""
echo "6. Click 'Sign in with GitHub'"
echo "7. Complete GitHub OAuth flow"
echo "8. Verify user is logged in"
echo ""
echo "🔍 Debug Information:"
echo "- Check browser console for callback logs"
echo "- Check network tab for OAuth requests"
echo "- Verify localStorage contains authToken"
echo ""
echo "✅ OAuth Testing Complete!"
