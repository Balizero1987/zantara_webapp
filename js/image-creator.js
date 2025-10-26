/**
 * Image Creator Module - Premium Feature
 * Integrates with ImagineArt API for AI image generation
 * Available only for: Zero, Dea, Krisna (privileged users)
 */

const ImageCreator = (() => {
  // ImagineArt API Configuration
  const IMAGINEART_API_URL = 'https://api.imagineapi.dev/v1/generations';
  const IMAGINEART_API_KEY = 'YOUR_IMAGINEAPI_KEY'; // TODO: Move to env variable
  
  // FREE/LOW-COST MODELS (Zero or minimal credits)
  // Reference: https://docs.imagineapi.dev/models
  const FREE_MODELS = {
    'imagine-v1': { name: 'Imagine V1', credits: 0, description: 'Basic model - FREE' },
    'imagine-v3': { name: 'Imagine V3', credits: 0, description: 'Improved quality - FREE' },
    'imagine-v4.1': { name: 'Imagine V4.1', credits: 1, description: 'Good balance - 1 credit' },
    'sdxl': { name: 'Stable Diffusion XL', credits: 1, description: 'Industry standard - 1 credit' }
  };
  
  // Default to FREE model
  const DEFAULT_MODEL = 'imagine-v3';
  
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
  let selectedModel = DEFAULT_MODEL;

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
            <details class="image-advanced-options" open>
              <summary>⚙️ Opzioni Avanzate (Modelli FREE)</summary>
              <div class="advanced-options-grid">
                <div class="option-group">
                  <label>🆓 AI Model (FREE/Low-cost):</label>
                  <select id="imageModel" onchange="ImageCreator.updateModelInfo()">
                    ${Object.entries(FREE_MODELS).map(([key, model]) => `
                      <option value="${key}" ${key === DEFAULT_MODEL ? 'selected' : ''}>
                        ${model.name} - ${model.credits === 0 ? '🆓 FREE' : `${model.credits} credit`}
                      </option>
                    `).join('')}
                  </select>
                  <small id="modelInfo" class="model-info">
                    ${FREE_MODELS[DEFAULT_MODEL].description}
                  </small>
                </div>
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
                  <label>Style Strength:</label>
                  <select id="imageStyleStrength">
                    <option value="low">Low (più simile al prompt)</option>
                    <option value="medium" selected>Medium (bilanciato)</option>
                    <option value="high">High (più creativo)</option>
                  </select>
                </div>
                <div class="option-group">
                  <label>Negative Prompt:</label>
                  <input 
                    type="text" 
                    id="imageNegativePrompt" 
                    placeholder="Cosa evitare (es: blurry, low quality)"
                    value="blurry, low quality, distorted, ugly"
                  />
                </div>
              </div>
              <div class="free-credits-notice">
                💡 <strong>Tutti i modelli disponibili sono GRATUITI o costano 1 credito massimo!</strong>
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
    const modelSelect = document.getElementById('imageModel');
    const styleStrengthSelect = document.getElementById('imageStyleStrength');
    const negativePromptInput = document.getElementById('imageNegativePrompt');
    const resultDiv = document.getElementById('imageCreatorResult');
    const generateBtn = document.querySelector('.image-generate-btn');

    if (!promptInput || !resultDiv) return;

    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert('⚠️ Inserisci una descrizione per l\'immagine');
      return;
    }

    // Get selected FREE model
    selectedModel = modelSelect?.value || DEFAULT_MODEL;
    const modelInfo = FREE_MODELS[selectedModel];

    // Show loading
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Generazione in corso...</span>';
    
    resultDiv.innerHTML = `
      <div class="image-generating">
        <div class="spinner"></div>
        <p>✨ Generazione immagine con <strong>${modelInfo.name}</strong></p>
        <p class="generating-detail">
          ${modelInfo.credits === 0 ? '🆓 Modello GRATUITO' : `💰 Costo: ${modelInfo.credits} credit`}
        </p>
        <p class="generating-detail">Tempo stimato: 10-30 secondi</p>
      </div>
    `;

    try {
      console.log('[ImageCreator] Generating image with FREE model:', {
        model: selectedModel,
        credits: modelInfo.credits,
        prompt,
        aspectRatio: aspectRatioSelect?.value
      });

      // Call ImagineArt API with FREE/LOW-COST model
      const response = await fetch(IMAGINEART_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${IMAGINEART_API_KEY}`
        },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: negativePromptInput?.value || 'blurry, low quality, distorted, ugly',
          aspect_ratio: aspectRatioSelect?.value || '16:9',
          style_type: styleStrengthSelect?.value || 'medium',
          model: selectedModel, // Use selected FREE model
          user_email: currentUserEmail,
          cfg_scale: 7, // Creativity scale (7 is balanced)
          steps: 30 // Generation steps (30 is good quality/speed balance)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const result = await response.json();
      
      // Display result
      displayGeneratedImage(result, prompt, modelInfo);
      
      // Add to history
      addToHistory(result, prompt, modelInfo);

      console.log('[ImageCreator] Image generated successfully with', selectedModel);

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
          <p class="generating-detail">Modello: ${modelInfo.name} (${modelInfo.credits === 0 ? 'FREE' : modelInfo.credits + ' credit'})</p>
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
  function displayGeneratedImage(result, prompt, modelInfo = null) {
    const resultDiv = document.getElementById('imageCreatorResult');
    if (!resultDiv) return;

    const imageUrl = result.data?.url || result.url || 'https://picsum.photos/800/450';
    const model = modelInfo || FREE_MODELS[selectedModel];

    resultDiv.innerHTML = `
      <div class="image-result-success">
        <p class="result-success-text">✅ Immagine generata con successo!</p>
        <div class="model-used-badge">
          🤖 ${model.name} ${model.credits === 0 ? '(🆓 FREE)' : `(${model.credits} credit)`}
        </div>
        <img src="${imageUrl}" alt="Generated image" class="generated-image" />
        <div class="image-metadata">
          <span>📝 <strong>Prompt:</strong> ${escapeHtml(prompt.substring(0, 100))}${prompt.length > 100 ? '...' : ''}</span>
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
  function addToHistory(result, prompt, modelInfo = null) {
    const imageUrl = result.data?.url || result.url || 'https://picsum.photos/200/200';
    const model = modelInfo || FREE_MODELS[selectedModel];
    
    generationHistory.unshift({
      prompt,
      imageUrl,
      model: model.name,
      credits: model.credits,
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
   * Update model info display when model is changed
   */
  function updateModelInfo() {
    const modelSelect = document.getElementById('imageModel');
    const modelInfoSpan = document.getElementById('modelInfo');
    
    if (!modelSelect || !modelInfoSpan) return;
    
    const selectedModelKey = modelSelect.value;
    const model = FREE_MODELS[selectedModelKey];
    
    if (model) {
      selectedModel = selectedModelKey;
      modelInfoSpan.textContent = `${model.description} - ${model.credits === 0 ? '🆓 GRATIS' : `💰 ${model.credits} credit`}`;
      modelInfoSpan.style.color = model.credits === 0 ? '#10b981' : '#f59e0b';
      console.log('[ImageCreator] Model changed to:', selectedModelKey);
    }
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
    updateModelInfo,
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
