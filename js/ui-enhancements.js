/**
 * ZANTARA UI Enhancements
 * Advanced UI/UX features for the webapp
 */

class UIEnhancements {
    constructor() {
        this.isInitialized = false;
        this.animations = new Map();
        this.theme = 'day';
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🎨 UI Enhancements initializing...');
        
        try {
            // Initialize theme
            this.initTheme();
            
            // Initialize animations
            this.initAnimations();
            
            // Initialize smooth scrolling
            this.initSmoothScrolling();
            
            // Initialize loading states
            this.initLoadingStates();
            
            // Initialize hover effects
            this.initHoverEffects();
            
            // Initialize responsive design
            this.initResponsiveDesign();
            
            this.isInitialized = true;
            console.log('✅ UI Enhancements initialized');
            
        } catch (error) {
            console.error('❌ UI Enhancements error:', error);
        }
    }

    initTheme() {
        // Check for saved theme
        const savedTheme = localStorage.getItem('zantara-theme') || 'day';
        this.setTheme(savedTheme);
        
        // Create theme toggle
        this.createThemeToggle();
    }

    setTheme(theme) {
        this.theme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('zantara-theme', theme);
        
        // Update theme toggle button
        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = theme === 'day' ? '🌙' : '☀️';
        }
    }

    createThemeToggle() {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.textContent = this.theme === 'day' ? '🌙' : '☀️';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;
        
        toggleBtn.addEventListener('click', () => {
            const newTheme = this.theme === 'day' ? 'night' : 'day';
            this.setTheme(newTheme);
        });
        
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.transform = 'scale(1.1)';
        });
        
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(toggleBtn);
    }

    initAnimations() {
        // Fade in animation for elements
        this.createFadeInAnimation();
        
        // Slide in animation
        this.createSlideInAnimation();
        
        // Pulse animation for loading
        this.createPulseAnimation();
        
        // Bounce animation for success
        this.createBounceAnimation();
    }

    createFadeInAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            .fade-in {
                opacity: 0;
                animation: fadeIn 0.6s ease-in-out forwards;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    createSlideInAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            .slide-in {
                transform: translateY(20px);
                opacity: 0;
                animation: slideIn 0.5s ease-out forwards;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createPulseAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            .pulse {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    createBounceAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            .bounce {
                animation: bounce 0.6s ease-in-out;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);
    }

    initSmoothScrolling() {
        // Smooth scroll for anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    initLoadingStates() {
        // Add loading class to buttons when clicked
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn')) {
                e.target.classList.add('loading');
                setTimeout(() => {
                    e.target.classList.remove('loading');
                }, 2000);
            }
        });
    }

    initHoverEffects() {
        // Add hover effects to cards
        const cards = document.querySelectorAll('.card, .metric-card, .team-member');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            });
        });
    }

    initResponsiveDesign() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Initial resize
        this.handleResize();
    }

    handleResize() {
        const width = window.innerWidth;
        
        // Mobile optimizations
        if (width < 768) {
            document.body.classList.add('mobile');
            this.optimizeForMobile();
        } else {
            document.body.classList.remove('mobile');
            this.optimizeForDesktop();
        }
    }

    optimizeForMobile() {
        // Adjust font sizes for mobile
        document.documentElement.style.fontSize = '14px';
        
        // Optimize touch targets
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        });
    }

    optimizeForDesktop() {
        // Reset font sizes for desktop
        document.documentElement.style.fontSize = '16px';
    }

    // Public methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showLoading(element, text = 'Loading...') {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${text}</div>
        `;
        loading.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
        `;
        
        element.style.position = 'relative';
        element.appendChild(loading);
        
        return () => {
            if (loading.parentNode) {
                loading.parentNode.removeChild(loading);
            }
        };
    }

    addRippleEffect(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        element.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            element.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    }

    // Animation utilities
    fadeIn(element, duration = 600) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    fadeOut(element, duration = 600) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, duration);
    }

    slideIn(element, direction = 'up', duration = 500) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) return;
        
        const transforms = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };
        
        element.style.transform = transforms[direction] || transforms.up;
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.transform = 'translate(0, 0)';
            element.style.opacity = '1';
        });
    }
}

// Initialize UI Enhancements
window.UIEnhancements = UIEnhancements;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uiEnhancements = new UIEnhancements();
});

// Add ripple effect to all buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(btn => {
        if (window.uiEnhancements) {
            window.uiEnhancements.addRippleEffect(btn);
        }
    });
});

// Add CSS for ripple effect
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
    
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-text {
        color: #666;
        font-size: 14px;
        font-weight: 500;
    }
`;
document.head.appendChild(rippleStyle);

console.log('🎨 UI Enhancements module loaded');