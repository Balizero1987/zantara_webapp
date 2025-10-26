/**
 * Image Creator Module - Premium Feature
 * Integrates with ImagineArt API for AI image generation
 * Available only for: Zero, Dea, Krisna (privileged users)
 */

const ImageCreator = (() => {
  // ImagineArt API Configuration
  const IMAGINEART_API_URL = 'https://api.imagineapi.dev/v1/generations';
  const IMAGINEART_API_KEY = 'YOUR_IMAGINEAPI_KEY'; // TODO: Move to env variable
  
  // Privileged users with image creation access
  const PRIVILEGED_USERS = [
    'zero@balizero.com',      // Zero Master - L3
    'dea@balizero.com',       // Dea - Setup Team
    'krisna@balizero.com'     // Krisna - L2 Setup Lead
  ];

  // State
  let isOpen = false;
  let currentUserEmail = null;
  let isAuthorized = false;
  let generationHistory = [];

  /**
   * Initialize the image creator
   */
  function init() {
    console.log('[ImageCreator] Initializing...');
    
    // Get current user email
    if (window.ZANTARA_API && window.ZANTARA_API.isLoggedIn()) {
      const userInfo = window.ZANTARA_API.getUserInfo();
      currentUserEmail = userInfo?.email || null;
      
      // Check if user is authorized
      isAuthorized = PRIVILEGED_USERS.includes(currentUserEmail);
      
      console.log('[ImageCreator] User:', currentUserEmail, 'Authorized:', isAuthorized);
    }

    // Only create UI if user is authorized
    if (isAuthorized) {
      createCreatorUI();
      console.log('[ImageCreator] Initialized for privileged user');
    } else {
      console.log('[ImageCreator] User not authorized - feature hidden');
    }
  }

  /**
   * Create the image creator UI
   */
  function createCreatorUI() {
    // Check if already exists
    if (document.getElementById('imageCreatorPanel')) {
      return;
    }

    const panelHTML = `
      <div id="imageCreatorPanel" class="image-creator-panel">
        <div class="image-creator-overlay" onclick="ImageCreator.close()"></div>
        <div class="image-creator-container">
          <!-- Header -->
          <div class="image-creator-header">
            <h2>🎨 AI Image Creator</h2>
            <div class="image-creator-badge">Premium</div>
            <button class="image-creator-close" onclick="ImageCreator.close()">✕</button>
          </div>

          <!-- Input Section -->
          <div class="image-creator-input-section">
            <label for="imagePrompt">Descrivi l'immagine che vuoi creare:</label>
            <textarea 
              id="imagePrompt" 
              class="image-prompt-input" 
              placeholder="Es: A futuristic cityscape with flying cars at sunset, cyberpunk style, highly detailed, 4k"
              rows="4"
            ></textarea>

            <!-- Style Presets -->
            <div class="image-style-presets">
              <button class="style-preset-btn" data-style="realistic" onclick="ImageCreator.applyStyle('realistic')">
                📷 Realistic
              </button>
              <button class="style-preset-btn" data-style="artistic" onclick="ImageCreator.applyStyle('artistic')">
                🎨 Artistic
              </button>
              <button class="style-preset-btn" data-style="anime" onclick="ImageCreator.applyStyle('anime')">
                🎌 Anime
              </button>
              <button class="style-preset-btn" data-style="3d" onclick="ImageCreator.applyStyle('3d')">
                🔮 3D Render
              </button>
            </div>

            <!-- Advanced Options -->
            <details class="image-advanced-options">
              <summary>⚙️ Opzioni Avanzate</summary>
              <div class="advanced-options-grid">
                <div class="option-group">
                  <label>Aspect Ratio:</label>
                  <select id="imageAspectRatio">
                    <option value="1:1">1:1 (Square)</option>
                    <option value="16:9" selected>16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="4:3">4:3 (Standard)</option>
                  </select>
                </div>
                <div class="option-group">
                  <label>Quality:</label>
                  <select id="imageQuality">
                    <option value="standard">Standard</option>
                    <option value="hd" selected>HD</option>
                    <option value="ultra">Ultra HD</option>
                  </select>
                </div>
                <div class="option-group">
                  <label>Negative Prompt:</label>
                  <input 
                    type="text" 
                    id="imageNegativePrompt" 
                    placeholder="Cosa evitare (es: blurry, low quality)"
                  />
                </div>
              </div>
            </details>

            <!-- Generate Button -->
            <button class="image-generate-btn" onclick="ImageCreator.generate()">
              <span class="btn-icon">✨</span>
              <span class="btn-text">Genera Immagine</span>
            </button>
          </div>

          <!-- Result Section -->
          <div class="image-creator-result" id="imageCreatorResult">
            <div class="image-result-placeholder">
              🎨 Le tue immagini generate appariranno qui
            </div>
          </div>

          <!-- History Section -->
          <div class="image-creator-history">
            <h3>📜 Generazioni Recenti</h3>
            <div class="image-history-grid" id="imageHistoryGrid">
              <div class="image-history-empty">Nessuna generazione ancora</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', panelHTML);

    // Add floating button
    const buttonHTML = `
      <button class="image-creator-btn" onclick="ImageCreator.toggle()" title="AI Image Creator (Premium)">
        🎨
      </button>
    `;
    document.body.insertAdjacentHTML('beforeend', buttonHTML);
  }

  /**
   * Open the image creator panel
   */
  function open() {
    if (!isAuthorized) {
      alert('⛔ Questa funzionalità è disponibile solo per utenti Premium (Zero, Dea, Krisna)');
      return;
    }

    isOpen = true;
    const panel = document.getElementById('imageCreatorPanel');
    if (panel) {
      panel.classList.add('active');
    }
  }

  /**
   * Close the image creator panel
   */
  function close() {
    isOpen = false;
    const panel = document.getElementById('imageCreatorPanel');
    if (panel) {
      panel.classList.remove('active');
    }
  }

  /**
   * Toggle panel
   */
  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  /**
   * Apply style preset to prompt
   */
  function applyStyle(style) {
    const promptInput = document.getElementById('imagePrompt');
    if (!promptInput) return;

    const currentPrompt = promptInput.value.trim();
    
    const styleModifiers = {
      'realistic': ', photorealistic, highly detailed, 8k, professional photography',
      'artistic': ', artistic painting, vibrant colors, creative, masterpiece',
      'anime': ', anime style, manga art, studio ghibli inspired, colorful',
      '3d': ', 3D render, octane render, cinema 4D, ultra realistic 3D'
    };

    // Remove old style modifiers
    let cleanPrompt = currentPrompt;
    Object.values(styleModifiers).forEach(modifier => {
      cleanPrompt = cleanPrompt.replace(modifier, '');
    });

    // Add new style
    promptInput.value = cleanPrompt.trim() + styleModifiers[style];

    // Highlight selected button
    document.querySelectorAll('.style-preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-style') === style);
    });

    console.log('[ImageCreator] Applied style:', style);
  }

  /**
   * Generate image using ImagineArt API
   */
  async function generate() {
    const promptInput = document.getElementById('imagePrompt');
    const aspectRatioSelect = document.getElementById('imageAspectRatio');
    const qualitySelect = document.getElementById('imageQuality');
    const negativePromptInput = document.getElementById('imageNegativePrompt');
    const resultDiv = document.getElementById('imageCreatorResult');
    const generateBtn = document.querySelector('.image-generate-btn');

    if (!promptInput || !resultDiv) return;

    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert('⚠️ Inserisci una descrizione per l\'immagine');
      return;
    }

    // Show loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Generazione in corso...</span>';
    
    resultDiv.innerHTML = `
      <div class="image-generating">
        <div class="spinner"></div>
        <p>✨ Generazione immagine in corso...</p>
        <p class="generating-detail">Questo può richiedere 10-30 secondi</p>
      </div>
    `;

    try {
      console.log('[ImageCreator] Generating image:', {
        prompt,
        aspectRatio: aspectRatioSelect?.value,
        quality: qualitySelect?.value
      });

      // Call ImagineArt API
      const response = await fetch(IMAGINEART_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${IMAGINEART_API_KEY}`
        },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: negativePromptInput?.value || 'blurry, low quality, distorted',
          aspect_ratio: aspectRatioSelect?.value || '16:9',
          quality: qualitySelect?.value || 'hd',
          model: 'imagine-v5',
          user_email: currentUserEmail
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const result = await response.json();
      
      // Display result
      displayGeneratedImage(result, prompt);
      
      // Add to history
      addToHistory(result, prompt);

      console.log('[ImageCreator] Image generated successfully');

    } catch (error) {
      console.error('[ImageCreator] Generation error:', error);
      
      // Show error with mock result for testing
      resultDiv.innerHTML = `
        <div class="image-error">
          <p>⚠️ Errore durante la generazione</p>
          <p class="error-detail">${error.message}</p>
          <button onclick="ImageCreator.generate()" class="retry-btn">🔄 Riprova</button>
        </div>
        <div class="image-mock-notice">
          <p>🎨 <strong>Demo Mode:</strong> Mostrando immagine di esempio</p>
          <img src="https://picsum.photos/800/450" alt="Mock generated image" class="generated-image" />
          <div class="image-actions">
            <button onclick="ImageCreator.downloadImage('https://picsum.photos/800/450')" class="action-btn">
              ⬇️ Download
            </button>
            <button onclick="ImageCreator.insertToChat('${escapeHtml(prompt)}')" class="action-btn">
              💬 Inserisci in Chat
            </button>
          </div>
        </div>
      `;
    } finally {
      // Reset button
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<span class="btn-icon">✨</span><span class="btn-text">Genera Immagine</span>';
    }
  }

  /**
   * Display generated image
   */
  function displayGeneratedImage(result, prompt) {
    const resultDiv = document.getElementById('imageCreatorResult');
    if (!resultDiv) return;

    const imageUrl = result.data?.url || result.url || 'https://picsum.photos/800/450';

    resultDiv.innerHTML = `
      <div class="image-result-success">
        <p class="result-success-text">✅ Immagine generata con successo!</p>
        <img src="${imageUrl}" alt="Generated image" class="generated-image" />
        <div class="image-metadata">
          <span>📝 Prompt: ${escapeHtml(prompt.substring(0, 100))}${prompt.length > 100 ? '...' : ''}</span>
        </div>
        <div class="image-actions">
          <button onclick="ImageCreator.downloadImage('${imageUrl}')" class="action-btn">
            ⬇️ Download
          </button>
          <button onclick="ImageCreator.insertToChat('${escapeHtml(prompt)}')" class="action-btn">
            💬 Inserisci in Chat
          </button>
          <button onclick="ImageCreator.copyUrl('${imageUrl}')" class="action-btn">
            🔗 Copia Link
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Add to generation history
   */
  function addToHistory(result, prompt) {
    const imageUrl = result.data?.url || result.url || 'https://picsum.photos/200/200';
    
    generationHistory.unshift({
      prompt,
      imageUrl,
      timestamp: new Date().toISOString()
    });

    // Keep only last 10
    if (generationHistory.length > 10) {
      generationHistory = generationHistory.slice(0, 10);
    }

    renderHistory();
  }

  /**
   * Render history grid
   */
  function renderHistory() {
    const historyGrid = document.getElementById('imageHistoryGrid');
    if (!historyGrid) return;

    if (generationHistory.length === 0) {
      historyGrid.innerHTML = '<div class="image-history-empty">Nessuna generazione ancora</div>';
      return;
    }

    const historyHTML = generationHistory.map((item, idx) => `
      <div class="history-item" onclick="ImageCreator.viewHistoryItem(${idx})">
        <img src="${item.imageUrl}" alt="Generated image" />
        <div class="history-item-overlay">
          <p>${escapeHtml(item.prompt.substring(0, 50))}...</p>
        </div>
      </div>
    `).join('');

    historyGrid.innerHTML = historyHTML;
  }

  /**
   * View history item
   */
  function viewHistoryItem(index) {
    const item = generationHistory[index];
    if (!item) return;

    displayGeneratedImage({ url: item.imageUrl }, item.prompt);
  }

  /**
   * Download image
   */
  function downloadImage(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `zantara-image-${Date.now()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('[ImageCreator] Image download initiated');
  }

  /**
   * Insert image reference to chat
   */
  function insertToChat(prompt) {
    const chatInput = document.getElementById('userInput');
    if (chatInput) {
      chatInput.value = `Ho generato un'immagine: "${prompt}". Puoi darmi feedback o suggerimenti per migliorarla?`;
      chatInput.focus();
      close();
    }
  }

  /**
   * Copy image URL
   */
  function copyUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
      alert('✅ Link copiato negli appunti!');
    }).catch(err => {
      console.error('[ImageCreator] Copy failed:', err);
      alert('⚠️ Impossibile copiare il link');
    });
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Check if user is authorized
   */
  function isUserAuthorized() {
    return isAuthorized;
  }

  // Public API
  return {
    init,
    open,
    close,
    toggle,
    applyStyle,
    generate,
    viewHistoryItem,
    downloadImage,
    insertToChat,
    copyUrl,
    isUserAuthorized
  };
})();

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ImageCreator.init());
} else {
  ImageCreator.init();
}

// Export to window
window.ImageCreator = ImageCreator;
