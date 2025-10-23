/**
 * Updated Send Message Function
 * 
 * This replaces the old sendMessage function with one that uses the unified API configuration.
 * It supports both streaming and non-streaming modes with intelligent backend routing.
 */

/**
 * Enhanced sendMessage function with unified API support
 */
async function sendMessageUpdated() {
  console.log('📤 [sendMessageUpdated] Function called');
  
  const inputField = document.getElementById('chatInput') || document.getElementById('messageInput') || document.getElementById('inputField');
  if (!inputField) {
    console.error('❌ [sendMessageUpdated] No input field found');
    return;
  }
  
  const message = inputField.value.trim();
  console.log('📝 [sendMessageUpdated] Message:', message);
  
  if (!message) {
    console.log('⚠️ [sendMessageUpdated] Empty message, returning');
    return;
  }

  const messagesDiv = document.querySelector('.messages');
  if (!messagesDiv) {
    console.error('❌ [sendMessageUpdated] No messages container found');
    return;
  }

  // Remove welcome if present
  const welcome = messagesDiv.querySelector('.welcome');
  if (welcome) {
    messagesDiv.innerHTML = '';
  }

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'user-message';
  userMsg.textContent = message;
  messagesDiv.appendChild(userMsg);

  // Add to conversation history
  if (typeof conversationHistory !== 'undefined') {
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // Limit history to last 20 messages for performance
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
  }

  // Clear input
  inputField.value = '';
  
  // Auto-resize textarea
  if (inputField.tagName === 'TEXTAREA') {
    inputField.style.height = 'auto';
    inputField.style.height = inputField.scrollHeight + 'px';
  }

  // Scroll to bottom
  scrollToBottom();

  // Create empty AI message for streaming
  const aiMsg = document.createElement('div');
  aiMsg.className = 'ai-message streaming';
  aiMsg.id = 'streaming-msg';
  messagesDiv.appendChild(aiMsg);

  // Show thinking indicator
  let thinkingIndicator = null;
  if (window.ZantaraThinkingIndicator) {
    thinkingIndicator = new window.ZantaraThinkingIndicator(aiMsg);
    thinkingIndicator.start();
  } else {
    aiMsg.textContent = '⏳ Zantara is thinking...';
  }

  scrollToBottom();

  try {
    // Get user email
    const userEmail = getUserEmail();
    console.log('🌊 [sendMessageUpdated] Starting for user:', userEmail || 'anonymous');

    // Prepare request data
    const requestData = {
      key: 'bali.zero.chat',
      params: {
        query: message,
        user_role: 'member',
        conversation_history: typeof conversationHistory !== 'undefined' ? conversationHistory.slice(-10) : []
      }
    };

    // Check if unified API is available
    if (window.ZANTARA_API && window.ZANTARA_API.call) {
      console.log('🌊 [sendMessageUpdated] Using unified API with JWT');
      
      // Try streaming first
      if (window.ZANTARA_SSE && window.ZANTARA_SSE.stream) {
        await handleStreamingResponse(requestData, aiMsg, thinkingIndicator);
      } else {
        // Fallback to regular API call with JWT
        await handleRegularResponse(requestData, aiMsg, thinkingIndicator);
      }
    } else {
      console.log('🌊 [sendMessageUpdated] Using legacy API');
      // Fallback to legacy method
      await handleLegacyResponse(message, aiMsg, thinkingIndicator);
    }

  } catch (error) {
    console.error('❌ [sendMessageUpdated] Error:', error);
    handleError(error, aiMsg, thinkingIndicator);
  }
}

/**
 * Handle streaming response
 */
async function handleStreamingResponse(requestData, aiMsg, thinkingIndicator) {
  let streamingText = '';
  
  // Clear previous event listeners
  const events = ['start', 'delta', 'complete', 'error', 'connected', 'stop'];
  events.forEach(event => {
    const listeners = window.ZANTARA_SSE.listeners.get(event);
    if (listeners) {
      listeners.length = 0;
    }
  });

  window.ZANTARA_SSE
    .on('start', () => {
      console.log('🌊 [Streaming] Connected');
      if (thinkingIndicator) {
        thinkingIndicator.stop();
      }
      aiMsg.innerHTML = '';
      aiMsg.className = 'ai-message streaming';
    })
    .on('delta', ({chunk, message}) => {
      streamingText = message;
      aiMsg.textContent = streamingText;
      
      // Scroll every 10 chunks
      if (!window._scrollCounter) window._scrollCounter = 0;
      window._scrollCounter++;
      if (window._scrollCounter % 10 === 0) {
        scrollToBottom();
      }
    })
    .on('complete', ({message}) => {
      console.log('🌊 [Streaming] Complete');
      aiMsg.className = 'ai-message';
      
      // Apply markdown formatting
      if (window.formatMessage) {
        aiMsg.innerHTML = window.formatMessage(message);
      } else {
        aiMsg.textContent = message;
      }
      
      scrollToBottom();
    })
    .on('error', (error) => {
      console.error('🌊 [Streaming] Error:', error);
      handleError(error, aiMsg, thinkingIndicator);
    });

  // Start streaming
  await window.ZANTARA_SSE.stream(requestData);
}

/**
 * Handle regular API response
 */
async function handleRegularResponse(requestData, aiMsg, thinkingIndicator) {
  console.log('🌊 [Regular API] Making request');
  
  const response = await window.ZANTARA_API.call('bali.zero.chat', requestData.params);
  
  if (thinkingIndicator) {
    thinkingIndicator.stop();
  }
  
  aiMsg.className = 'ai-message';
  
  if (response && response.answer) {
    if (window.formatMessage) {
      aiMsg.innerHTML = window.formatMessage(response.answer);
    } else {
      aiMsg.textContent = response.answer;
    }
  } else {
    aiMsg.textContent = 'Sorry, I encountered an error processing your request.';
  }
  
  scrollToBottom();
}

/**
 * Handle legacy response (fallback)
 */
async function handleLegacyResponse(message, aiMsg, thinkingIndicator) {
  console.log('🌊 [Legacy] Using legacy method');
  
  // This would use the old API configuration
  // Implementation depends on the existing legacy code
  if (thinkingIndicator) {
    thinkingIndicator.stop();
  }
  
  aiMsg.className = 'ai-message';
  aiMsg.textContent = 'Legacy mode - API configuration needs update';
  
  scrollToBottom();
}

/**
 * Handle errors
 */
function handleError(error, aiMsg, thinkingIndicator) {
  console.error('❌ [sendMessageUpdated] Error:', error);
  
  if (thinkingIndicator) {
    thinkingIndicator.stop();
  }
  
  // Remove streaming message
  const streaming = document.getElementById('streaming-msg');
  if (streaming) streaming.remove();
  
  // Show error message
  const errorMsg = document.createElement('div');
  errorMsg.className = 'error-message';
  errorMsg.textContent = '❌ Error: ' + (error.message || 'Failed to get response from Zantara AI');
  
  const messagesDiv = document.querySelector('.messages');
  if (messagesDiv) {
    messagesDiv.appendChild(errorMsg);
    scrollToBottom();
  }
}

/**
 * Get user email helper
 */
function getUserEmail() {
  return localStorage.getItem('zantara-user-email') || 
         localStorage.getItem('zantara-user') || 
         'anonymous';
}

/**
 * Scroll to bottom helper
 */
function scrollToBottom() {
  const messagesDiv = document.querySelector('.messages');
  if (messagesDiv) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// Export for global use
if (typeof window !== 'undefined') {
  window.sendMessageUpdated = sendMessageUpdated;
}

export default sendMessageUpdated;
