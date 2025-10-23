/**
 * UI/UX Enhancements
 * Advanced UI improvements per ZANTARA webapp
 */

class UIEnhancements {
    constructor() {
        this.thinkingMessages = [
            "🧠 Sto pensando...",
            "🔍 Cerco nei documenti...",
            "💡 Elaboro la risposta...",
            "🎯 Quasi pronto...",
            "✨ Perfeziono la risposta..."
        ];
        this.currentThinkingIndex = 0;
        this.thinkingInterval = null;
        
        console.log('✨ UI Enhancements initialized');
    }
    
    /**
     * Advanced thinking indicator con messaggi rotanti
     */
    showAdvancedThinking(container) {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message ai-message thinking-indicator';
        thinkingDiv.id = 'advanced-thinking';
        
        const content = document.createElement('div');
        content.className = 'thinking-content';
        content.innerHTML = `
            <div class="thinking-avatar">
                <div class="pulse-ring"></div>
                <div class="pulse-ring delay-1"></div>
                <div class="pulse-ring delay-2"></div>
                <img src="assets/logoscon.png" alt="ZANTARA" class="thinking-logo">
            </div>
            <div class="thinking-text" id="thinkingText">${this.thinkingMessages[0]}</div>
        `;
        
        thinkingDiv.appendChild(content);
        container.appendChild(thinkingDiv);
        
        // Rotate messages
        this.currentThinkingIndex = 0;
        this.thinkingInterval = setInterval(() => {
            this.currentThinkingIndex = (this.currentThinkingIndex + 1) % this.thinkingMessages.length;
            const textEl = document.getElementById('thinkingText');
            if (textEl) {
                textEl.style.opacity = '0';
                setTimeout(() => {
                    textEl.textContent = this.thinkingMessages[this.currentThinkingIndex];
                    textEl.style.opacity = '1';
                }, 200);
            }
        }, 2000);
        
        return thinkingDiv;
    }
    
    /**
     * Hide thinking indicator
     */
    hideAdvancedThinking() {
        if (this.thinkingInterval) {
            clearInterval(this.thinkingInterval);
            this.thinkingInterval = null;
        }
        
        const thinking = document.getElementById('advanced-thinking');
        if (thinking) {
            thinking.style.opacity = '0';
            setTimeout(() => thinking.remove(), 300);
        }
    }
    
    /**
     * Typing indicator animato
     */
    showTypingIndicator(container) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        container.appendChild(typingDiv);
        return typingDiv;
    }
    
    /**
     * Success animation
     */
    showSuccess(message) {
        this.showToast(message, 'success', '✅');
    }
    
    /**
     * Error animation
     */
    showError(message) {
        this.showToast(message, 'error', '❌');
    }
    
    /**
     * Info toast
     */
    showInfo(message) {
        this.showToast(message, 'info', 'ℹ️');
    }
    
    /**
     * Generic toast notification
     */
    showToast(message, type = 'info', icon = 'ℹ️') {
        // Create toast container if not exists
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove after 3s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Smooth scroll con easing
     */
    smoothScrollTo(element, target) {
        const start = element.scrollTop;
        const distance = target - start;
        const duration = 300;
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function (ease-out-cubic)
            const ease = 1 - Math.pow(1 - progress, 3);
            
            element.scrollTop = start + (distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }
    
    /**
     * Message fade-in animation
     */
    animateMessageIn(messageElement) {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            messageElement.style.transition = 'all 0.3s ease-out';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 10);
    }
    
    /**
     * Progress bar animato
     */
    showProgressBar(container, progress = 0) {
        let progressBar = document.getElementById('progress-bar');
        
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'progress-bar';
            progressBar.className = 'progress-bar-container';
            progressBar.innerHTML = `
                <div class="progress-bar-fill" id="progressBarFill"></div>
            `;
            container.insertBefore(progressBar, container.firstChild);
        }
        
        const fill = document.getElementById('progressBarFill');
        if (fill) {
            fill.style.width = `${progress}%`;
        }
        
        return progressBar;
    }
    
    /**
     * Hide progress bar
     */
    hideProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.opacity = '0';
            setTimeout(() => progressBar.remove(), 300);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIEnhancements;
} else {
    window.UIEnhancements = UIEnhancements;
}

