# 🪷 ZANTARA WEBAPP - Documentazione Completa

## 🎯 **Overview**

ZANTARA Webapp è l'interfaccia utente intelligente di Bali Zero, completamente integrata con il sistema backend attraverso 164 handlers e 10 agenti autonomi.

### **URL Live**: 
- **Production**: `https://zantara.balizero.com`
- **GitHub Pages**: `https://balizero1987.github.io`

---

## 📁 **Struttura Progetto**

```
apps/webapp/
├── index.html                 # Entry point (redirect a login)
├── login-new.html            # Login page integrata
├── chat-new.html             # Chat principale con tutti i moduli
├── manifest.json             # PWA manifest
├── package.json              # Dependencies
├── CNAME                     # GitHub Pages custom domain
│
├── assets/                   # Risorse statiche
│   ├── favicon.svg
│   ├── logoscon.png         # Logo ZANTARA
│   ├── icon-*.png           # PWA icons
│   └── sounds/              # Audio feedback
│
├── js/                       # Moduli JavaScript (12 moduli)
│   ├── zantara-api.js       # ⭐ API Layer unificata
│   ├── api-config-unified.js # Configurazione API
│   ├── chat-enhancements.js  # Chat UI enhancements
│   ├── conversation-persistence.js # Salvataggio conversazioni
│   ├── feature-discovery.js  # Feature discovery UI
│   ├── real-team-tracking.js # Team tracking real-time
│   ├── real-zero-dashboard.js # Dashboard Zero analytics
│   ├── sse-client.js         # Server-Sent Events streaming
│   ├── storage-manager.js    # LocalStorage management
│   ├── zantara-knowledge.js  # System knowledge integration
│   ├── zantara-thinking-indicator.js # Thinking indicator UI
│   └── zero-intelligent-analytics.js # Analytics intelligenti
│
└── js/core/                  # Core Modules (8 moduli)
    ├── api-client.js         # HTTP client base
    ├── cache-manager.js      # L1/L2/L3 caching
    ├── error-handler.js      # Error handling & recovery
    ├── pwa-installer.js      # PWA installation
    ├── request-deduplicator.js # Request deduplication
    ├── router.js             # Client-side routing
    ├── state-manager.js      # Global state management
    └── websocket-manager.js  # WebSocket connections

└── styles/                   # CSS Styling (20 files)
    ├── chat.css              # Chat principale
    ├── chat-enhancements.css # Enhancements
    ├── components.css        # Componenti UI
    ├── design-system.css     # Design tokens
    ├── zantara-theme*.css    # Temi day/night
    └── ...                   # Altri stili
```

---

## 🔧 **Moduli Principali**

### **⭐ zantara-api.js** - API Layer Unificata
```javascript
// Endpoints disponibili
ZANTARA_API.chat(message, config)         // Chat con ZANTARA
ZANTARA_API.teamLogin(email, pin, name)   // Team login
ZANTARA_API.getUser()                     // User info
ZANTARA_API.isLoggedIn()                  // Check auth
ZANTARA_API.logout()                      // Logout
```

**Backends integrati**:
- **TS-BACKEND**: `https://ts-backend-production-568d.up.railway.app`
- **RAG-BACKEND**: `https://scintillating-kindness-production-47e3.up.railway.app`

---

### **🧠 Core Modules** (8 moduli essenziali)

#### **1. error-handler.js** (444 righe)
- Gestione errori graceful
- Fallback automatici
- User-friendly messages
- Error tracking & logging

#### **2. cache-manager.js** (254 righe)
- **L1 Cache**: Memory (immediate)
- **L2 Cache**: localStorage (persistent)
- **L3 Cache**: IndexedDB (large data)
- Smart cache invalidation
- Performance: 250x speedup on cache hit

#### **3. request-deduplicator.js** (132 righe)
- Prevent duplicate API calls
- Request queuing
- Automatic retry logic
- Network optimization

#### **4. websocket-manager.js** (318 righe)
- Real-time communication
- Auto-reconnection
- Message queuing
- Event broadcasting

#### **5. pwa-installer.js** (298 righe)
- Progressive Web App support
- Offline capability
- Install prompts
- Update notifications

#### **6. api-client.js**
- HTTP client wrapper
- Request/response interceptors
- Error handling
- Retry logic

#### **7. router.js**
- Client-side routing
- History management
- Deep linking
- Navigation guards

#### **8. state-manager.js**
- Global state management
- Reactive updates
- State persistence
- Event system

---

### **🌊 Advanced Features**

#### **sse-client.js** (224 righe) - Server-Sent Events
- Real-time AI responses
- Streaming text
- Progress updates
- Connection management

#### **conversation-persistence.js** (211 righe)
- Save chat history
- Load previous conversations
- Export/import
- Search in history

#### **storage-manager.js** (292 righe)
- Unified storage API
- localStorage + IndexedDB
- Automatic sync
- Quota management

#### **zantara-knowledge.js** (250 righe)
- System awareness completo
- 164 tools access
- 10 agents integration
- Dynamic capabilities discovery

#### **zantara-thinking-indicator.js**
- Visual feedback durante AI processing
- Typing indicators
- Loading states
- Smooth animations

---

### **📊 Dashboard & Analytics**

#### **real-zero-dashboard.js** (492 righe)
- Analytics overview
- Team statistics
- Usage metrics
- Performance monitoring

#### **real-team-tracking.js** (164 righe)
- Live team presence
- Active sessions
- Collaboration features
- Status indicators

#### **zero-intelligent-analytics.js** (164 righe)
- Intelligent analytics
- Pattern recognition
- Usage insights
- Recommendations

---

## 🎨 **UI/UX Features**

### **Design System**:
- **Theme**: Day/Night mode switching
- **Colors**: Purple gradient (#6B46C1) + Green accent (#10b981)
- **Typography**: -apple-system, sans-serif
- **Responsive**: Mobile-first design

### **Components**:
- Chat bubbles (user/AI)
- Input area auto-resize
- Loading indicators
- User badges
- Theme toggle

### **Animations**:
- Smooth transitions
- Fade in/out
- Typing indicators
- Pulse effects

---

## 🔐 **Authentication & Security**

### **Login System**:
- **Team Login**: Email + PIN (6 digits)
- **JWT Tokens**: Secure session management
- **Role-Based Access**: Admin, Team Member, Demo

### **Access Levels**:
- **👑 Admin (Zero)**: 164/164 handlers (100%)
- **👥 Team Members**: ~80/164 handlers (49%)
- **🌐 Demo Users**: ~16/164 handlers (10%)

### **Security Features**:
- JWT token validation
- Role-based permissions
- Rate limiting
- Input sanitization
- XSS protection

---

## 🚀 **Performance**

### **Optimizations**:
- **Cache System**: L1/L2/L3 caching (250x speedup)
- **Request Dedup**: Prevent duplicate calls
- **SSE Streaming**: Real-time responses
- **Lazy Loading**: Moduli caricati on-demand
- **Code Splitting**: JS ottimizzato

### **Metrics**:
- **First Load**: < 2s
- **Cache Hit**: 10-20ms
- **API Call**: 1-2s
- **Streaming**: Real-time

---

## 📱 **PWA Support**

### **Features**:
- ✅ Offline capability
- ✅ Install su mobile/desktop
- ✅ Push notifications (ready)
- ✅ Background sync
- ✅ App-like experience

### **Manifest**:
```json
{
  "name": "ZANTARA - Bali Zero AI",
  "short_name": "ZANTARA",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#10b981"
}
```

---

## 🧪 **Testing**

### **Test Suite**:
- `test-integration.html` - Integration tests
- `test-webapp-handlers.sh` - Automated handler tests (19 tests)

### **Test Coverage**:
- ✅ Login/logout
- ✅ Chat functionality
- ✅ Handler access (RBAC)
- ✅ Error handling
- ✅ Performance

---

## 🛠️ **Development**

### **Local Development**:
```bash
# Aprire la webapp localmente
open apps/webapp/index.html

# O con server locale
cd apps/webapp
python3 -m http.server 8080
# Poi apri http://localhost:8080
```

### **Deploy su GitHub Pages**:
```bash
# La webapp è già configurata per auto-deploy
# Push su main → auto-deploy su balizero1987.github.io
git add apps/webapp/
git commit -m "Update webapp"
git push origin main
```

---

## 🎯 **Capabilities**

### **ZANTARA può**:
- 💬 **Chat intelligente** con Haiku 4.5
- 🔍 **RAG Search** su 14 knowledge collections
- 💰 **Pricing ufficiali** Bali Zero (pubblici)
- 👥 **Team management** (live tracking)
- 🧠 **Memory system** (conversazioni persistenti)
- 📊 **Analytics** real-time
- 🔮 **Oracle queries** (business intelligence)
- 📍 **Location services** (geocoding, maps)
- 📧 **Communication** (email, WhatsApp)

### **164 Handlers Disponibili**:
- **ai**: 1 handler
- **ai-services**: 10+ handlers
- **analytics**: 4 handlers
- **bali-zero**: 8 handlers
- **business**: 3 handlers
- **communication**: 4 handlers
- **google-workspace**: 21 handlers
- **identity**: 2 handlers
- **location**: 3 handlers
- **maps**: 5 handlers
- **memory**: 10 handlers
- **monitoring**: 4 handlers
- **rag**: 4 handlers
- **zantara**: 15+ handlers

---

## 📖 **User Guide**

### **Come Usare ZANTARA**:

#### **1. Login**:
- Vai su `https://zantara.balizero.com`
- Inserisci email aziendale
- Inserisci PIN (6 cifre)
- Clicca "Accedi al Team"

#### **2. Chat**:
- Scrivi messaggio nella chat
- Premi **Enter** per inviare (oppure clicca →)
- ZANTARA risponde in italiano
- Conversazione salvata automaticamente

#### **3. Funzionalità Avanzate**:
- **Theme**: Clicca 🌙/☀️ per cambiare tema
- **Dashboard**: Vedi analytics team
- **Memory**: Conversazioni salvate automaticamente
- **Offline**: Funziona anche offline (PWA)

---

## 🔗 **API Integration**

### **Backend Endpoints**:

#### **TS-BACKEND** (TypeScript):
```
https://ts-backend-production-568d.up.railway.app
```
- `/call` - RPC-style handler execution
- `/team.login` - Team authentication
- `/health` - Health check

#### **RAG-BACKEND** (Python):
```
https://scintillating-kindness-production-47e3.up.railway.app
```
- `/bali-zero/chat` - ZANTARA chat con RAG
- `/api/rag/search` - Semantic search
- `/health` - Health check

---

## 🎨 **Customization**

### **Temi**:
- `styles/zantara-theme-day.css` - Tema giorno
- `styles/zantara-theme-night-enhanced.css` - Tema notte

### **Colors**:
```css
--primary: #6B46C1 (Purple)
--secondary: #10b981 (Green)
--background-dark: #1e1e1e
--background-light: #ffffff
```

---

## 🐛 **Troubleshooting**

### **Problemi Comuni**:

#### **Login non funziona**:
- Verifica email e PIN corretti
- Controlla console browser (Cmd+Option+I su Mac)
- Verifica backend online: `curl https://ts-backend-production-568d.up.railway.app/health`

#### **Chat non invia messaggi**:
- Verifica login effettuato
- Controlla token in localStorage: `zantara-auth-token`
- Refresh pagina (Cmd+R)

#### **Pagina bianca**:
- Clear cache browser
- Hard refresh (Cmd+Shift+R)
- Verifica console per errori JS

---

## 📊 **Performance Metrics**

### **Target Metrics**:
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Cache Hit Rate**: > 50%
- **API Response**: < 2s
- **Streaming Response**: Real-time

### **Current Performance**:
- **Cache Hit**: 10-20ms (250x speedup)
- **API Call**: 1-2s
- **SSE Streaming**: Real-time
- **PWA Score**: 90+

---

## 🔄 **Updates & Deployment**

### **Auto-Deploy**:
- Push su `main` → Auto-deploy su GitHub Pages
- Railway auto-deploy per backends
- Cloudflare CDN per `zantara.balizero.com`

### **Manual Deploy**:
```bash
# Clone GitHub Pages repo
git clone https://github.com/Balizero1987/balizero1987.github.io.git

# Copy webapp files
cp -r apps/webapp/* balizero1987.github.io/

# Commit and push
cd balizero1987.github.io
git add .
git commit -m "Update webapp"
git push origin main
```

---

## 🎓 **Team Training**

### **Per Nuovi Membri**:
1. Leggi questa documentazione
2. Familiarizza con l'interfaccia
3. Testa handlers in `test-integration.html`
4. Chiedi a ZANTARA "mostrami le tue capacità"

### **Best Practices**:
- Usa ZANTARA per queries frequenti
- Salva conversazioni importanti
- Usa handlers specifici per operazioni precise
- Monitora analytics per insights

---

## 📞 **Support**

### **Contatti**:
- **Email**: info@balizero.com
- **WhatsApp**: +62 813 3805 1876
- **Tech Lead**: zero@balizero.com

### **Resources**:
- **Documentation**: `/docs` nel repo principale
- **API Docs**: `docs/api/API_DOCUMENTATION.md`
- **Architecture**: `docs/architecture/ARCHITECTURE.md`

---

## 🎉 **Features Integrate**

### **✅ Sistema Completo**:
- 🧠 **20 moduli JS** integrati (7,550+ righe codice)
- 🌊 **SSE Streaming** real-time
- 💾 **Cache System** L1/L2/L3
- 🚨 **Error Handling** graceful
- 💬 **Conversation Persistence**
- 🗄️ **Storage Manager**
- 🔄 **Request Deduplication**
- 🌐 **WebSocket** real-time
- 📱 **PWA Support** completo
- 📊 **Dashboard Zero** analytics
- 👥 **Team Tracking** live
- 🎯 **164 Handlers** disponibili
- 🤖 **10 Agents** orchestrati

**ZANTARA Webapp è completamente integrata con il sistema Bali Zero!** 🚀

---

*Ultima modifica: 24 Ottobre 2025*
*Versione: 1.0.0 - Webapp Integrata Completa*

