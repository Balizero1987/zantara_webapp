/**
 * Voice Command Integration System
 * Enhancement #33 for NUZANTARA-RAILWAY
 * Implements voice recognition and command processing capabilities
 */

class VoiceCommandIntegration {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.voiceEnabled = true;
    this.continuousListening = false;
    this.language = 'en-US';
    this.commands = new Map();
    this.commandHistory = [];
    this.maxHistoryItems = 50;
    this.speechSynthesis = window.speechSynthesis;
  }

  /**
   * Initialize the voice command system
   */
  async initialize() {
    // Check for browser support
    this.checkBrowserSupport();
    
    // Set up voice recognition
    this.setupVoiceRecognition();
    
    // Register default commands
    this.registerDefaultCommands();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('[VoiceCommand] System initialized');
  }

  /**
   * Check for browser support
   */
  checkBrowserSupport() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('[VoiceCommand] Speech recognition not supported in this browser');
      this.voiceSupported = false;
    } else {
      this.voiceSupported = true;
      console.log('[VoiceCommand] Speech recognition supported');
    }
    
    if (!('speechSynthesis' in window)) {
      console.warn('[VoiceCommand] Speech synthesis not supported in this browser');
      this.synthesisSupported = false;
    } else {
      this.synthesisSupported = true;
      console.log('[VoiceCommand] Speech synthesis supported');
    }
  }

  /**
   * Set up voice recognition
   */
  setupVoiceRecognition() {
    if (!this.voiceSupported) return;
    
    // Use the appropriate SpeechRecognition constructor
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition settings
    this.recognition.continuous = this.continuousListening;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;
    
    // Set up recognition event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('[VoiceCommand] Voice recognition started');
      
      // Notify UI
      window.dispatchEvent(new CustomEvent('voice-recognition-started'));
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('[VoiceCommand] Voice recognition ended');
      
      // Notify UI
      window.dispatchEvent(new CustomEvent('voice-recognition-ended'));
      
      // Restart if continuous listening is enabled
      if (this.continuousListening && this.voiceEnabled) {
        this.startListening();
      }
    };
    
    this.recognition.onerror = (event) => {
      console.error('[VoiceCommand] Voice recognition error:', event.error);
      
      // Notify UI
      window.dispatchEvent(new CustomEvent('voice-recognition-error', {
        detail: { error: event.error, message: event.message }
      }));
    };
    
    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };
    
    console.log('[VoiceCommand] Voice recognition set up');
  }

  /**
   * Handle recognition result
   */
  handleRecognitionResult(event) {
    let finalTranscript = '';
    let interimTranscript = '';
    
    // Process results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Notify about interim results
    if (interimTranscript) {
      window.dispatchEvent(new CustomEvent('voice-interim-result', {
        detail: { transcript: interimTranscript }
      }));
    }
    
    // Process final transcript
    if (finalTranscript) {
      this.processVoiceCommand(finalTranscript);
    }
  }

  /**
   * Register default commands
   */
  registerDefaultCommands() {
    // Navigation commands
    this.registerCommand('navigate_home', {
      phrases: ['go to home', 'navigate to home', 'home page'],
      description: 'Navigate to the home page',
      action: () => {
        window.location.hash = '#home';
        this.speak('Navigating to home page');
      }
    });
    
    this.registerCommand('navigate_dashboard', {
      phrases: ['go to dashboard', 'navigate to dashboard', 'show dashboard'],
      description: 'Navigate to the dashboard',
      action: () => {
        window.location.hash = '#dashboard';
        this.speak('Navigating to dashboard');
      }
    });
    
    this.registerCommand('navigate_handlers', {
      phrases: ['go to handlers', 'show handlers', 'navigate to handlers'],
      description: 'Navigate to the handlers page',
      action: () => {
        window.location.hash = '#handlers';
        this.speak('Navigating to handlers');
      }
    });
    
    // System commands
    this.registerCommand('toggle_theme', {
      phrases: ['toggle theme', 'switch theme', 'dark mode', 'light mode'],
      description: 'Toggle between dark and light themes',
      action: () => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('zantara-theme', newTheme);
        this.speak(`Switched to ${newTheme} theme`);
      }
    });
    
    this.registerCommand('show_help', {
      phrases: ['help', 'show help', 'what can i say'],
      description: 'Show available voice commands',
      action: () => {
        this.showAvailableCommands();
      }
    });
    
    this.registerCommand('stop_listening', {
      phrases: ['stop listening', 'stop voice', 'silence'],
      description: 'Stop voice recognition',
      action: () => {
        this.stopListening();
        this.speak('Stopping voice recognition');
      }
    });
    
    this.registerCommand('start_listening', {
      phrases: ['start listening', 'activate voice', 'hey zantara'],
      description: 'Start voice recognition',
      action: () => {
        this.startListening();
        this.speak('Voice recognition activated');
      }
    });
    
    // Handler execution commands
    this.registerCommand('execute_handler', {
      phrases: ['execute handler', 'run handler', 'use handler'],
      description: 'Execute a specific handler',
      action: (transcript) => {
        // Extract handler name from transcript
        const handlerMatch = transcript.match(/(?:execute|run|use) handler (\w+)/i);
        if (handlerMatch && handlerMatch[1]) {
          const handlerName = handlerMatch[1];
          this.executeHandler(handlerName);
        } else {
          this.speak('Please specify which handler to execute');
        }
      }
    });
    
    console.log('[VoiceCommand] Default commands registered');
  }

  /**
   * Register a voice command
   */
  registerCommand(commandId, commandDefinition) {
    this.commands.set(commandId, {
      id: commandId,
      ...commandDefinition
    });
    
    console.log(`[VoiceCommand] Command registered: ${commandId}`);
  }

  /**
   * Process voice command
   */
  processVoiceCommand(transcript) {
    console.log(`[VoiceCommand] Processing command: "${transcript}"`);
    
    // Add to command history
    this.addToCommandHistory(transcript);
    
    // Notify about recognized command
    window.dispatchEvent(new CustomEvent('voice-command-recognized', {
      detail: { transcript: transcript }
    }));
    
    // Match command to registered commands
    let matchedCommand = null;
    let matchedCommandId = null;
    
    for (const [commandId, command] of this.commands) {
      for (const phrase of command.phrases) {
        // Check for exact or fuzzy match
        if (transcript.toLowerCase().includes(phrase.toLowerCase())) {
          matchedCommand = command;
          matchedCommandId = commandId;
          break;
        }
      }
      
      if (matchedCommand) break;
    }
    
    // Execute matched command or provide feedback
    if (matchedCommand) {
      try {
        matchedCommand.action(transcript);
        console.log(`[VoiceCommand] Executed command: ${matchedCommandId}`);
      } catch (error) {
        console.error(`[VoiceCommand] Error executing command ${matchedCommandId}:`, error);
        this.speak('Sorry, there was an error executing that command');
      }
    } else {
      // Try to handle as a general query
      this.handleGeneralQuery(transcript);
    }
  }

  /**
   * Handle general query (not matching specific commands)
   */
  handleGeneralQuery(query) {
    console.log(`[VoiceCommand] Handling general query: "${query}"`);
    
    // For now, we'll just acknowledge and suggest help
    this.speak(`I heard: ${query}. For available commands, say "help"`);
    
    // Notify UI about unrecognized command
    window.dispatchEvent(new CustomEvent('voice-command-unrecognized', {
      detail: { query: query }
    }));
  }

  /**
   * Execute a handler by name
   */
  executeHandler(handlerName) {
    console.log(`[VoiceCommand] Executing handler: ${handlerName}`);
    
    // In a real implementation, this would execute the actual handler
    // For now, we'll just simulate it
    this.speak(`Executing handler ${handlerName}`);
    
    // Notify about handler execution
    window.dispatchEvent(new CustomEvent('handler-executed-by-voice', {
      detail: { handlerName: handlerName }
    }));
  }

  /**
   * Start listening for voice commands
   */
  startListening() {
    if (!this.voiceEnabled || !this.voiceSupported || !this.recognition) return;
    
    try {
      this.recognition.start();
      console.log('[VoiceCommand] Started listening');
    } catch (error) {
      console.error('[VoiceCommand] Error starting voice recognition:', error);
    }
  }

  /**
   * Stop listening for voice commands
   */
  stopListening() {
    if (!this.recognition) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('[VoiceCommand] Stopped listening');
    } catch (error) {
      console.error('[VoiceCommand] Error stopping voice recognition:', error);
    }
  }

  /**
   * Toggle listening state
   */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * Speak text using speech synthesis
   */
  speak(text) {
    if (!this.synthesisSupported || !this.voiceEnabled) return;
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      this.speechSynthesis.speak(utterance);
      
      console.log(`[VoiceCommand] Speaking: "${text}"`);
    } catch (error) {
      console.error('[VoiceCommand] Error with speech synthesis:', error);
    }
  }

  /**
   * Add command to history
   */
  addToCommandHistory(transcript) {
    const historyItem = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      transcript: transcript
    };
    
    this.commandHistory.unshift(historyItem);
    
    // Limit history size
    if (this.commandHistory.length > this.maxHistoryItems) {
      this.commandHistory.pop();
    }
  }

  /**
   * Get command history
   */
  getCommandHistory() {
    return [...this.commandHistory];
  }

  /**
   * Clear command history
   */
  clearCommandHistory() {
    this.commandHistory = [];
  }

  /**
   * Show available commands
   */
  showAvailableCommands() {
    const commandsList = Array.from(this.commands.values())
      .map(cmd => `${cmd.phrases.join(', ')} - ${cmd.description}`)
      .join('\n');
    
    const message = `Available voice commands:\n${commandsList}`;
    console.log('[VoiceCommand] Available commands:', message);
    
    // Speak the commands
    this.speak('Here are the available voice commands');
    
    // Show in UI
    window.dispatchEvent(new CustomEvent('voice-commands-list', {
      detail: { commands: Array.from(this.commands.values()) }
    }));
  }

  /**
   * Set voice enabled/disabled
   */
  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled;
    
    if (!enabled && this.isListening) {
      this.stopListening();
    }
    
    if (enabled) {
      console.log('[VoiceCommand] Voice commands enabled');
    } else {
      console.log('[VoiceCommand] Voice commands disabled');
    }
  }

  /**
   * Set continuous listening
   */
  setContinuousListening(enabled) {
    this.continuousListening = enabled;
    
    if (this.recognition) {
      this.recognition.continuous = enabled;
    }
    
    if (enabled) {
      console.log('[VoiceCommand] Continuous listening enabled');
    } else {
      console.log('[VoiceCommand] Continuous listening disabled');
    }
  }

  /**
   * Set language
   */
  setLanguage(language) {
    this.language = language;
    
    if (this.recognition) {
      this.recognition.lang = language;
    }
    
    console.log(`[VoiceCommand] Language set to: ${language}`);
  }

  /**
   * Get voice command statistics
   */
  getVoiceStatistics() {
    return {
      voiceSupported: this.voiceSupported,
      synthesisSupported: this.synthesisSupported,
      voiceEnabled: this.voiceEnabled,
      isListening: this.isListening,
      continuousListening: this.continuousListening,
      language: this.language,
      totalCommands: this.commands.size,
      commandHistoryCount: this.commandHistory.length
    };
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for voice command requests
    window.addEventListener('start-voice-command', () => {
      this.startListening();
    });
    
    window.addEventListener('stop-voice-command', () => {
      this.stopListening();
    });
    
    // Listen for UI interactions
    window.addEventListener('toggle-voice', () => {
      this.toggleListening();
    });
  }

  /**
   * Render voice command dashboard
   */
  renderVoiceDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create voice dashboard HTML
    container.innerHTML = `
      <div class="voice-dashboard">
        <header>
          <h2>🎙️ Voice Command Integration</h2>
          <p>Control the system using voice commands</p>
        </header>
        
        <div class="voice-controls">
          <div class="voice-actions">
            <button id="start-voice" class="action-button ${this.isListening ? 'active' : ''}">
              ${this.isListening ? '⏹️ Stop Listening' : '▶️ Start Listening'}
            </button>
            <button id="show-commands" class="action-button">Show Commands</button>
            <button id="clear-history" class="action-button">Clear History</button>
          </div>
          
          <div class="voice-settings">
            <label>
              <input type="checkbox" id="voice-enabled" ${this.voiceEnabled ? 'checked' : ''}>
              Enable Voice Commands
            </label>
            <label>
              <input type="checkbox" id="continuous-listening" ${this.continuousListening ? 'checked' : ''}>
              Continuous Listening
            </label>
            <label>
              Language:
              <select id="voice-language">
                <option value="en-US" ${this.language === 'en-US' ? 'selected' : ''}>English (US)</option>
                <option value="en-GB" ${this.language === 'en-GB' ? 'selected' : ''}>English (UK)</option>
                <option value="id-ID" ${this.language === 'id-ID' ? 'selected' : ''}>Indonesian</option>
              </select>
            </label>
          </div>
        </div>
        
        <div class="voice-grid">
          <div class="voice-section">
            <h3>Voice Status</h3>
            <div id="voice-status" class="status-container">
              <!-- Voice status will be rendered here -->
            </div>
          </div>
          
          <div class="voice-section">
            <h3>Command History</h3>
            <div id="command-history" class="history-container">
              <!-- Command history will be rendered here -->
            </div>
          </div>
          
          <div class="voice-section">
            <h3>Available Commands</h3>
            <div id="available-commands" class="commands-container">
              <!-- Available commands will be rendered here -->
            </div>
          </div>
          
          <div class="voice-section">
            <h3>Voice Recognition</h3>
            <div id="voice-recognition" class="recognition-container">
              <div class="transcript-display">
                <div id="final-transcript" class="final-transcript"></div>
                <div id="interim-transcript" class="interim-transcript"></div>
              </div>
              <div class="recognition-indicator">
                <div class="mic-icon ${this.isListening ? 'listening' : ''}">🎤</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Render components
    this.renderVoiceStatus('voice-status');
    this.renderCommandHistory('command-history');
    this.renderAvailableCommands('available-commands');
    
    // Set up action buttons
    document.getElementById('start-voice').addEventListener('click', () => {
      this.toggleListening();
      this.renderVoiceDashboard(containerId); // Re-render
    });
    
    document.getElementById('show-commands').addEventListener('click', () => {
      this.showAvailableCommands();
    });
    
    document.getElementById('clear-history').addEventListener('click', () => {
      this.clearCommandHistory();
      this.renderCommandHistory('command-history');
    });
    
    // Set up settings controls
    document.getElementById('voice-enabled').addEventListener('change', (e) => {
      this.setVoiceEnabled(e.target.checked);
    });
    
    document.getElementById('continuous-listening').addEventListener('change', (e) => {
      this.setContinuousListening(e.target.checked);
    });
    
    document.getElementById('voice-language').addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });
    
    // Set up real-time transcript display
    this.setupTranscriptDisplay();
  }

  /**
   * Render voice status
   */
  renderVoiceStatus(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stats = this.getVoiceStatistics();
    
    container.innerHTML = `
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">Voice Support:</span>
          <span class="status-value ${stats.voiceSupported ? 'supported' : 'unsupported'}">
            ${stats.voiceSupported ? 'Supported' : 'Not Supported'}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Synthesis Support:</span>
          <span class="status-value ${stats.synthesisSupported ? 'supported' : 'unsupported'}">
            ${stats.synthesisSupported ? 'Supported' : 'Not Supported'}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Voice Enabled:</span>
          <span class="status-value ${stats.voiceEnabled ? 'enabled' : 'disabled'}">
            ${stats.voiceEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">Listening:</span>
          <span class="status-value ${stats.isListening ? 'listening' : 'idle'}">
            ${stats.isListening ? 'Listening' : 'Idle'}
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Render command history
   */
  renderCommandHistory(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (this.commandHistory.length === 0) {
      container.innerHTML = '<p class="no-data">No voice commands recorded</p>';
      return;
    }
    
    // Get last 10 commands
    const recentCommands = this.commandHistory.slice(0, 10);
    
    container.innerHTML = `
      <div class="history-list">
        <ul>
          ${recentCommands.map(command => `
            <li class="history-item">
              <div class="command-text">"${command.transcript}"</div>
              <div class="command-time">${new Date(command.timestamp).toLocaleString()}</div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Render available commands
   */
  renderAvailableCommands(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const commands = Array.from(this.commands.values());
    
    if (commands.length === 0) {
      container.innerHTML = '<p class="no-data">No voice commands available</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="commands-list">
        <ul>
          ${commands.map(command => `
            <li class="command-item">
              <div class="command-phrases">${command.phrases.join(', ')}</div>
              <div class="command-description">${command.description}</div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Set up real-time transcript display
   */
  setupTranscriptDisplay() {
    // Listen for interim results
    window.addEventListener('voice-interim-result', (event) => {
      const interimDisplay = document.getElementById('interim-transcript');
      if (interimDisplay) {
        interimDisplay.textContent = event.detail.transcript;
      }
    });
    
    // Listen for recognized commands
    window.addEventListener('voice-command-recognized', (event) => {
      const finalDisplay = document.getElementById('final-transcript');
      if (finalDisplay) {
        // Add to final transcript
        const newLine = document.createElement('div');
        newLine.className = 'transcript-line';
        newLine.textContent = event.detail.transcript;
        finalDisplay.appendChild(newLine);
        
        // Scroll to bottom
        finalDisplay.scrollTop = finalDisplay.scrollHeight;
      }
      
      // Clear interim transcript
      const interimDisplay = document.getElementById('interim-transcript');
      if (interimDisplay) {
        interimDisplay.textContent = '';
      }
    });
    
    // Update mic icon when listening state changes
    window.addEventListener('voice-recognition-started', () => {
      const micIcon = document.querySelector('.mic-icon');
      if (micIcon) {
        micIcon.classList.add('listening');
      }
    });
    
    window.addEventListener('voice-recognition-ended', () => {
      const micIcon = document.querySelector('.mic-icon');
      if (micIcon) {
        micIcon.classList.remove('listening');
      }
    });
  }
}

// Initialize voice command system
document.addEventListener('DOMContentLoaded', () => {
  window.VoiceCommandIntegration = new VoiceCommandIntegration();
  window.VoiceCommandIntegration.initialize();
  
  console.log('[VoiceCommand] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(33);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceCommandIntegration;
}