# 🤖 ZANTARA Web App

**Intelligent AI assistant for Bali Zero - Powered by Claude Haiku 4.5**

[![Status](https://img.shields.io/badge/status-production-green.svg)](https://balizero1987.github.io/zantara_webapp)
[![AI](https://img.shields.io/badge/AI-Claude_4.5_Haiku-purple.svg)](https://www.anthropic.com/)
[![Languages](https://img.shields.io/badge/languages-IT_ID_EN-blue.svg)]()

**🌐 Live Demo:** https://balizero1987.github.io/zantara_webapp

---

## 🎯 What is ZANTARA?

ZANTARA is Bali Zero's AI soul - an intelligent, conversational assistant from the webapp interface that helps with:

### 💼 Business Services (What Users Can Ask)
- **Official Pricing**: "berapa harga C1 visa?" → "2.300.000 IDR (€140)"
- **Team Directory**: "chi è Adit?" → "Crew Lead in Setup department"
- **Service Information**: "what is KITAS E23?" → Complete guide with requirements
- **Document Requirements**: "documents needed for PT PMA?" → Full checklist

### 🧠 Intelligence Features (What ZANTARA Can Do)
- **Real-time Streaming**: Responses appear token-by-token (300-600ms first token)
- **Smart Suggestions**: Context-aware quick replies in sidebar
- **Memory System**: Remembers conversations and user preferences
- **Citation Sources**: All official data includes "Fonte: Bali Zero Official Pricing 2025"
- **Multilingual**: Auto-detection (Indonesian, Italian, English)
- **Voice I/O**: Speech recognition and text-to-speech

### ✅ Latest Updates (Oct 28, 2025)

**Phase 1+2: Tool Calling Fix - 100% Success**
- ✅ **Zero Hallucinations**: No more fake "B211A" visa codes
- ✅ **Exact Prices**: 2.300.000 IDR not "around 2.5 million"
- ✅ **Citations**: Every response with official data includes source
- ✅ **Tool Success**: 0% → 100% for pricing queries

[📊 Full Implementation Report](../../PHASE1_2_DEPLOYMENT_SUCCESS_REPORT.md)

---

## 🚀 Features from User Perspective

### Chat Interface
- **Instant Responses**: Real-time streaming with typing indicators
- **Rich Formatting**: Markdown, code blocks, lists, links
- **Citation Display**: Sources shown for all official data
- **Voice Input**: Click microphone → speak your question
- **Voice Output**: ZANTARA reads responses aloud

### Smart Suggestions Sidebar
- **Quick Actions**: One-click common queries
- **Categories**: Visa, KITAS, Business Setup, Tax, Team Info
- **Dynamic**: Suggestions change based on conversation
- **Multilingual**: Buttons adapt to selected language

### Memory Panel
- **Full History**: All conversations saved locally
- **Search**: Find past messages by keyword
- **Statistics**: Message count, session duration, last activity
- **Export/Clear**: Download chat history or reset

### Languages
- **🇮🇩 Indonesian (Bahasa)**: Default for Indonesian users
- **🇮🇹 Italian (Italiano)**: Full UI translation
- **🇬🇧 English**: International users
- **Auto-Switch**: ZANTARA detects language from input

---

## 📦 Quick Start (For Users)

### Access ZANTARA

**Option 1: Direct Web Access**
1. Visit: https://balizero1987.github.io/zantara_webapp
2. Start chatting immediately (no login required)

**Option 2: Install as App (PWA)**
1. Open in Chrome/Edge/Safari
2. Click "Install" prompt or ⋮ menu → "Install app"
3. Launch from home screen/desktop

### Example Queries

Try asking ZANTARA:

**Pricing Queries:**
```
"berapa harga C1 visa?"
"quanto costa KITAS E23?"
"what's the price for PT PMA setup?"
```

**Team Queries:**
```
"chi è Adit?"
"who works in the tax department?"
"siapa yang handle setup?"
```

**Service Information:**
```
"what is KITAS E23?"
"requirements for D12 visa?"
"how long does PT PMA take?"
```

**General Questions:**
```
"ciao, come stai?"
"tell me about Bali Zero"
"what services do you offer?"
```

---

## 🔧 Setup (For Developers)

### Local Development

```bash
# Clone repository
git clone https://github.com/Balizero1987/nuzantara.git
cd nuzantara/apps/webapp

# Serve locally
python -m http.server 8081
# OR
npx http-server -p 8081

# Open browser
open http://localhost:8081
```

### GitHub Pages Deployment

```bash
# 1. Push to GitHub
git add .
git commit -m "Update ZANTARA webapp"
git push origin main

# 2. Enable GitHub Pages
# Settings → Pages → Source: main branch → Save

# 3. Configure backend CORS
# Add https://balizero1987.github.io to CORS_ORIGINS on Railway
```

### Custom Domain

```bash
# Add CNAME file
echo "zantara.balizero.com" > CNAME

# Update backend CORS
CORS_ORIGINS=https://zantara.balizero.com,https://balizero1987.github.io
```

---

## 🏗️ Architecture (From Webapp Perspective)

### Frontend Stack
```
User clicks "Send"
    ↓
js/api-client.js → POST /bali-zero/chat
    ↓
Backend (Railway): https://scintillating-kindness-production-47e3.up.railway.app
    ↓
IntelligentRouter detects: "berapa harga" → PRICING query
    ↓
Prefetch get_pricing tool (BEFORE streaming)
    ↓
Claude Haiku 4.5 streams response with prefetched data
    ↓
SSE chunks → js/streaming-client.js
    ↓
js/chat-ui.js renders messages token-by-token
    ↓
User sees: "2.300.000 IDR ... Fonte: Bali Zero Official Pricing 2025"
```

### Key Files

**Frontend:**
- `index.html` - Main chat interface
- `js/api-client.js` - Backend communication
- `js/streaming-client.js` - SSE event handling
- `js/chat-ui.js` - Message rendering with citations
- `js/smart-suggestions.js` - Sidebar quick actions
- `js/memory-panel.js` - Conversation history
- `js/voice-handler.js` - Speech recognition/synthesis
- `js/i18n.js` - Multi-language support

**Backend (Python RAG):**
- `intelligent_router.py` - Query routing + tool prefetch
- `claude_haiku_service.py` - Claude 4.5 integration
- `zantara_tools.py` - 11 Python tools (pricing, team, memory)
- `tool_executor.py` - Tool orchestration (175+ tools)

---

## 🧪 Testing from Webapp

### Manual Testing

**1. Open Test Console:**
```
http://localhost:8081/test-api.html
```

**2. Test Queries:**
- Pricing: "berapa harga C1 visa?" → Should return 2.300.000 IDR
- Team: "chi è Adit?" → Should return "Crew Lead in Setup"
- Citation: Check for "Fonte: Bali Zero Official Pricing 2025"

**3. Expected Behavior:**
- ✅ Streaming: Messages appear token-by-token
- ✅ Citations: Official data includes source
- ✅ Accuracy: No hallucinated prices or fake codes
- ✅ Multilingual: Responds in query language

### Browser DevTools Check

```javascript
// Check backend health
fetch('https://scintillating-kindness-production-47e3.up.railway.app/health')
  .then(r => r.json())
  .then(console.log);

// Should return:
// {status: "healthy", service: "ZANTARA RAG", version: "3.3.1-cors-fix", ...}
```

---

## 🔍 What Users Can See & Do

### Visible Features

**1. Chat Interface:**
- Message bubbles (user = right, ZANTARA = left)
- Typing indicator: "ZANTARA is typing..."
- Timestamps on messages
- Citation boxes for official data
- Voice controls (microphone/speaker icons)

**2. Smart Suggestions:**
- Category tabs: Visa | KITAS | Business | Tax | Team
- Quick reply buttons (e.g., "C1 Visa Price", "PT PMA Setup")
- Updates based on conversation context
- Multilingual button labels

**3. Memory Panel:**
- Conversation list with dates
- Search bar: "Find in conversations..."
- Statistics: "10 messages today"
- Export/Clear buttons

**4. Settings:**
- Language selector (🇮🇩 / 🇮🇹 / 🇬🇧)
- Voice toggle (on/off)
- Theme (light/dark - if implemented)

### User Interactions

**Ask Pricing:**
```
User: "berapa harga C1 visa?"
ZANTARA: "C1 Tourism visa harganya 2.300.000 IDR (circa €140).
          Ini adalah visa single entry yang berlaku 60 hari...
          
          Fonte: Bali Zero Official Pricing 2025"
```

**Ask Team Info:**
```
User: "chi è Adit?"
ZANTARA: "Adit è il Crew Lead nel dipartimento Setup di Bali Zero.
          Gestisce il team operativo per la documentazione...
          
          Email: consulting@balizero.com"
```

**General Conversation:**
```
User: "ciao come stai?"
ZANTARA: "Ciao! Sto benissimo, grazie! 😊 Come posso aiutarti oggi?"
```

---

## 📚 Documentation

- [**Main README**](../../README.md) - Project overview
- [**Tool Inventory**](../../ALL_TOOLS_INVENTORY.md) - 175+ tools ZANTARA can use
- [**Implementation Report**](../../PHASE1_2_DEPLOYMENT_SUCCESS_REPORT.md) - Latest fixes
- [**Backend Documentation**](../backend-rag/README.md) - RAG system details

---

## 🤝 Contributing (Developer Guidelines)

### Project Policy

⚠️ **IMPORTANT:** Structural code changes must be proposed and approved before implementation.

**Process:**
1. Open issue/PR with rationale
2. Get team lead sign-off
3. Implement in main project
4. Sync to webapp

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Test locally: python -m http.server 8081

# Commit
git commit -m "feat: your feature"

# Push and create PR
git push origin feature/your-feature
```

---

## 🔍 Troubleshooting

### "Backend not responding"

**Check:**
```javascript
// In browser console
fetch('https://scintillating-kindness-production-47e3.up.railway.app/health')
  .then(r => r.json())
  .then(console.log);
```

**Solution:**
- Verify Railway deployment is running
- Check CORS_ORIGINS includes your domain
- Confirm API base URL is correct

### "No streaming responses"

**Check DevTools Network Tab:**
- Look for `/bali-zero/chat` request
- Verify Content-Type: `text/event-stream`
- Check for EventSource errors

**Solution:**
- Ensure browser supports EventSource
- Check for ad-blockers blocking SSE
- Verify backend streaming endpoint

### "Prices still wrong"

**Verify Tool Prefetch:**
```bash
# Check Railway logs
railway logs --tail

# Should see:
# "🎯 [Prefetch] PRICING query detected"
# "🚀 [Prefetch] Executing get_pricing"
# "✅ [Prefetch] Got data"
```

---

## 📞 Support

- **Website:** https://balizero.com
- **Email:** info@balizero.com
- **WhatsApp:** +62 813 3805 1876
- **GitHub:** [Issues](https://github.com/Balizero1987/nuzantara/issues)

---

## 📄 License

© 2025 Bali Zero. All rights reserved.

---

**Made with ❤️ by Bali Zero Team**
