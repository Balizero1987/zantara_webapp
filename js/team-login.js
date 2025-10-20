/**
 * 🔐 Secure Team Login System - Client Side
 * Version 2.0 - PIN-based authentication with JWT
 */

class SecureTeamLogin {
  constructor() {
    // Railway RAG Backend (PRIMARY) - supports team.login.secure via TypeScript proxy
    this.apiBase = 'https://ts-backend-production-568d.up.railway.app';
    this.apiKey = 'zantara-internal-dev-key-2025';
    this.currentUser = null;
    this.token = null;
  }

  /**
   * 🔐 Login with email + PIN
   */
  async login(email, pin) {
    try {
      const response = await fetch(`${this.apiBase}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          key: 'team.login.secure',
          params: {
            email: email,
            pin: pin
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.ok && data.data.success) {
        // Store JWT token and user data
        this.token = data.data.token;
        this.currentUser = data.data.user;

        // Save to localStorage (secure token storage)
        localStorage.setItem('zantara-auth-token', this.token);
        localStorage.setItem('zantara-user', JSON.stringify(this.currentUser));
        localStorage.setItem('zantara-permissions', JSON.stringify(data.data.permissions));

        // Legacy compatibility
        localStorage.setItem('zantara-user-email', this.currentUser.email);
        localStorage.setItem('zantara-user-name', this.currentUser.name);
        localStorage.setItem('zantara-user-role', this.currentUser.role);
        localStorage.setItem('zantara-user-department', this.currentUser.department);

        return {
          success: true,
          user: this.currentUser,
          message: data.data.message
        };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Network error. Please try again.'
      };
    }
  }

  /**
   * 🔓 Logout
   */
  logout() {
    // Clear all session data
    this.token = null;
    this.currentUser = null;

    // Clear ALL authentication keys (prevents corrupted localStorage)
    const keysToRemove = [
      'zantara-auth-token',
      'zantara-user',
      'zantara-permissions',
      'zantara-user-email',      // ← FIX: was missing, caused corrupted state
      'zantara-user-name',
      'zantara-user-role',
      'zantara-user-department',
      'zantara-session'
    ];

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * ✅ Check if user is logged in
   */
  isLoggedIn() {
    const token = localStorage.getItem('zantara-auth-token');
    const user = localStorage.getItem('zantara-user');

    if (token && user) {
      try {
        this.token = token;
        this.currentUser = JSON.parse(user);
        return true;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout(); // Clear corrupted data
        return false;
      }
    }
    return false;
  }

  /**
   * 👤 Get current user
   */
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const user = localStorage.getItem('zantara-user');
    if (user) {
      try {
        this.currentUser = JSON.parse(user);
        return this.currentUser;
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  /**
   * 🔑 Get authentication token
   */
  getToken() {
    return this.token || localStorage.getItem('zantara-auth-token');
  }

  /**
   * 🛡️ Check user permission
   */
  hasPermission(permission) {
    const permissions = localStorage.getItem('zantara-permissions');
    if (!permissions) return false;

    try {
      const perms = JSON.parse(permissions);
      return perms.includes(permission) || perms.includes('all');
    } catch (error) {
      return false;
    }
  }

  /**
   * 📝 Show message to user
   */
  showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('loginMessage');
    if (!messageDiv) return;

    messageDiv.className = `message ${type}`;

    // Add badge if success (feature #2)
    if (type === 'success' && this.currentUser && this.currentUser.badge) {
      messageDiv.innerHTML = `${this.currentUser.badge} ${message}`;
    } else {
      messageDiv.textContent = message;
    }

    messageDiv.style.display = 'block';

    // Auto-hide after 5 seconds (except for errors)
    if (type !== 'error') {
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 5000);
    }
  }

  /**
   * 🔢 Update PIN visual indicator (feature #1)
   */
  updatePinIndicator(pinLength) {
    const dots = document.querySelectorAll('.pin-dot');
    if (!dots || dots.length === 0) return;

    dots.forEach((dot, index) => {
      dot.classList.remove('filled', 'complete');

      if (index < pinLength) {
        dot.classList.add('filled');

        // All 6 dots filled = complete (green)
        if (pinLength === 6) {
          dot.classList.add('complete');
        }
      }
    });
  }

  /**
   * ⚠️ Show remaining attempts warning (feature #3)
   */
  showAttemptsWarning(remainingAttempts) {
    const warningDiv = document.getElementById('attemptsWarning');
    if (!warningDiv) return;

    if (remainingAttempts === null || remainingAttempts === undefined) {
      warningDiv.style.display = 'none';
      return;
    }

    if (remainingAttempts <= 0) {
      warningDiv.innerHTML = '🔒 Account bloccato per 5 minuti. Troppi tentativi falliti.';
    } else if (remainingAttempts === 1) {
      warningDiv.innerHTML = `⚠️ PIN non valido. <strong>Ultimo tentativo</strong> prima del blocco!`;
    } else {
      warningDiv.innerHTML = `❌ PIN non valido. ${remainingAttempts} tentativi rimasti prima del blocco.`;
    }

    warningDiv.style.display = 'block';

    // Trigger shake animation
    warningDiv.style.animation = 'none';
    setTimeout(() => {
      warningDiv.style.animation = 'shake 0.5s ease';
    }, 10);
  }

  /**
   * 🔄 Show loading state
   */
  setLoading(isLoading) {
    const submitBtn = document.getElementById('teamLoginBtn');
    if (!submitBtn) return;

    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Accesso in corso...';
      submitBtn.style.opacity = '0.7';
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Accedi al Team';
      submitBtn.style.opacity = '1';
    }
  }

  /**
   * 🎯 Initialize login form
   */
  initializeForm() {
    const form = document.getElementById('teamLoginForm');
    if (!form) {
      console.warn('Team login form not found');
      return;
    }

    const pinInput = document.getElementById('teamPin');

    // Feature #1: Real-time PIN visual indicator
    if (pinInput) {
      pinInput.addEventListener('input', (e) => {
        const pinLength = e.target.value.length;
        this.updatePinIndicator(pinLength);
      });

      // Clear indicator when field is cleared
      pinInput.addEventListener('focus', () => {
        this.showAttemptsWarning(null); // Hide warning on new attempt
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('teamEmail');
      const pinInput = document.getElementById('teamPin');

      if (!emailInput || !pinInput) {
        this.showMessage('Form elements not found', 'error');
        return;
      }

      const email = emailInput.value.trim();
      const pin = pinInput.value.trim();

      // Validation
      if (!email || !pin) {
        this.showMessage('Email e PIN sono obbligatori', 'error');
        return;
      }

      if (!/^\d{6}$/.test(pin)) {
        this.showMessage('Il PIN deve essere di esattamente 6 cifre', 'error');
        return;
      }

      // Attempt login
      this.setLoading(true);

      try {
        const result = await this.login(email, pin);

        if (result.success) {
          // Feature #2: Show badge in success message
          this.showMessage(result.message || 'Accesso riuscito! Reindirizzamento...', 'success');

          // Clear form
          pinInput.value = '';
          this.updatePinIndicator(0);

          // Redirect to chat or original destination
          setTimeout(() => {
            const redirectUrl = sessionStorage.getItem('zantara-redirect-after-login') || 'chat.html';
            sessionStorage.removeItem('zantara-redirect-after-login'); // Clean up
            window.location.href = redirectUrl;
          }, 1500);
        } else {
          // Feature #3: Parse remaining attempts from error message
          const remainingMatch = result.error.match(/(\d+)\s+attempt/i);
          const remainingAttempts = remainingMatch ? parseInt(remainingMatch[1]) : null;

          if (remainingAttempts !== null) {
            this.showAttemptsWarning(remainingAttempts);
          } else if (result.error.includes('locked') || result.error.includes('bloccato')) {
            this.showAttemptsWarning(0);
          } else {
            this.showMessage(result.error || 'Credenziali non valide', 'error');
          }

          // Clear PIN and reset indicator
          pinInput.value = '';
          this.updatePinIndicator(0);
          pinInput.focus();
        }
      } catch (error) {
        this.showMessage('Errore di connessione. Riprova.', 'error');
      } finally {
        this.setLoading(false);
      }
    });

    // Auto-focus email field when team login is shown
    const teamSection = document.getElementById('teamLoginSection');
    if (teamSection) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (teamSection.style.display !== 'none') {
              const emailInput = document.getElementById('teamEmail');
              if (emailInput) emailInput.focus();
            }
          }
        });
      });

      observer.observe(teamSection, { attributes: true });
    }
  }
}

// Initialize
const teamLogin = new SecureTeamLogin();

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    teamLogin.initializeForm();
  });
} else {
  teamLogin.initializeForm();
}

// Export for global access
window.SecureTeamLogin = SecureTeamLogin;
window.teamLogin = teamLogin;
