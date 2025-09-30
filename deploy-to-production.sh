#!/bin/bash
# Deploy ZANTARA Webapp to zantara.balizero.com (GitHub Pages)
# With optional RAG backend integration

set -e

echo "🚀 ZANTARA Webapp Deployment"
echo "============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
REPO_PATH="/Users/antonellosiano/Desktop/zantara-bridge chatgpt patch/zantara_webapp"
DOMAIN="zantara.balizero.com"
BACKEND_PRODUCTION="https://zantara-v520-production-1064094238013.europe-west1.run.app"
BACKEND_RAG="https://zantara-v520-chatgpt-patch-1064094238013.europe-west1.run.app"
PROXY_URL="https://zantara-web-proxy-1064094238013.europe-west1.run.app/api/zantara"

cd "$REPO_PATH"

# Ask which backend to use
echo -e "${BLUE}Which backend do you want to use?${NC}"
echo ""
echo "1) Current (Proxy + Stable Production) - RECOMMENDED"
echo "2) Direct RAG Backend (Latest with 4 new RAG endpoints)"
echo "3) Custom URL"
echo ""
read -p "Choice [1-3]: " BACKEND_CHOICE

case $BACKEND_CHOICE in
  2)
    echo -e "${YELLOW}Updating to RAG backend with new endpoints...${NC}"
    # Update api-config.js to use RAG backend
    sed -i.bak "s|base: '.*europe-west1.run.app'|base: '$BACKEND_RAG'|g" js/api-config.js
    BACKEND_USED="RAG (Latest)"
    ;;
  3)
    read -p "Enter custom backend URL: " CUSTOM_URL
    sed -i.bak "s|base: '.*europe-west1.run.app'|base: '$CUSTOM_URL'|g" js/api-config.js
    BACKEND_USED="Custom ($CUSTOM_URL)"
    ;;
  *)
    echo -e "${GREEN}Keeping current configuration (Proxy mode)${NC}"
    BACKEND_USED="Proxy (Secure)"
    ;;
esac

# Show current git status
echo ""
echo -e "${BLUE}Git Status:${NC}"
git status --short

# Ask for commit
echo ""
read -p "Ready to deploy? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
  echo "Deployment cancelled"
  exit 0
fi

# Commit changes (if any)
if [ -n "$(git status --porcelain)" ]; then
  echo ""
  echo -e "${BLUE}Committing changes...${NC}"
  git add .
  git commit -m "feat: Deploy to zantara.balizero.com with $BACKEND_USED backend

- Backend: $BACKEND_USED
- Domain: $DOMAIN
- Deployed: $(date '+%Y-%m-%d %H:%M:%S')

🚀 Production deployment"
else
  echo -e "${GREEN}No changes to commit${NC}"
fi

# Push to GitHub
echo ""
echo -e "${BLUE}Pushing to GitHub...${NC}"
git push origin main

# Wait for GitHub Pages
echo ""
echo -e "${YELLOW}Waiting for GitHub Pages to build (60 seconds)...${NC}"
for i in {60..1}; do
  echo -ne "\r⏳ $i seconds remaining..."
  sleep 1
done
echo ""

# Test deployment
echo ""
echo -e "${BLUE}Testing deployment...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Deployment successful!${NC}"
else
  echo -e "${YELLOW}⚠️  Site returned HTTP $HTTP_CODE (may still be building)${NC}"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Site:      https://$DOMAIN"
echo "💬 Chat:      https://$DOMAIN/chat.html"
echo "🧪 Test:      https://$DOMAIN/test-api.html"
echo "📊 Dashboard: https://$DOMAIN/dashboard.html"
echo ""
echo "🔌 Backend:   $BACKEND_USED"
echo ""
echo "📝 Next steps:"
echo "   1. Open https://$DOMAIN/chat.html"
echo "   2. Test API connection (F12 console)"
echo "   3. Verify no CORS errors"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Open in browser
read -p "Open in browser? (y/n): " OPEN_BROWSER
if [ "$OPEN_BROWSER" = "y" ]; then
  open "https://$DOMAIN/chat.html"
fi

echo ""
echo -e "${GREEN}✨ Deployment complete!${NC}"