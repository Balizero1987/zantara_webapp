/**
 * Team Login System for Bali Zero Collaborators
 * Integrates with ZANTARA authentication system
 */

class TeamLoginSystem {
  constructor() {
    this.apiBase = 'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app';
    this.apiKey = 'zantara-internal-dev-key-2025';
    this.currentSession = null;
  }

  /**
   * Get all team members for login form
   */
  async getTeamMembers() {
    try {
      const response = await fetch(`${this.apiBase}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          key: 'team.members',
          params: {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.ok ? data.data : [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  }

  /**
   * Login team member
   */
  async loginTeamMember(name, email) {
    try {
      const response = await fetch(`${this.apiBase}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          key: 'team.login',
          params: {
            name: name,
            email: email
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.ok) {
        this.currentSession = data.data;
        
        // Save session to localStorage
        localStorage.setItem('zantara-session', JSON.stringify(this.currentSession));
        localStorage.setItem('zantara-user-name', this.currentSession.user.name);
        localStorage.setItem('zantara-user-role', this.currentSession.user.role);
        localStorage.setItem('zantara-user-department', this.currentSession.user.department);
        
        return {
          success: true,
          session: this.currentSession,
          message: this.currentSession.personalizedResponse
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
        error: error.message
      };
    }
  }

  /**
   * Logout current session
   */
  async logout() {
    if (this.currentSession) {
      try {
        await fetch(`${this.apiBase}/call`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          },
          body: JSON.stringify({
            key: 'team.logout',
            params: {
              sessionId: this.currentSession.sessionId
            }
          })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear session data
    this.currentSession = null;
    localStorage.removeItem('zantara-session');
    localStorage.removeItem('zantara-user-name');
    localStorage.removeItem('zantara-user-role');
    localStorage.removeItem('zantara-user-department');
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    const session = localStorage.getItem('zantara-session');
    if (session) {
      try {
        this.currentSession = JSON.parse(session);
        return true;
      } catch (error) {
        console.error('Error parsing session:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    if (this.currentSession) {
      return this.currentSession.user;
    }
    return null;
  }

  /**
   * Check user permissions
   */
  hasPermission(permission) {
    if (!this.currentSession) return false;
    return this.currentSession.permissions.includes(permission) || 
           this.currentSession.permissions.includes('all');
  }

  /**
   * Initialize team login form
   */
  async initializeLoginForm() {
    const teamMembers = await this.getTeamMembers();
    const selectElement = document.getElementById('teamMemberSelect');
    
    if (selectElement && teamMembers.length > 0) {
      // Clear existing options
      selectElement.innerHTML = '<option value="">Seleziona un membro del team...</option>';
      
      // Add team members
      teamMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member.name;
        option.textContent = `${member.name} - ${member.role} (${member.department})`;
        option.dataset.email = member.email;
        option.dataset.role = member.role;
        option.dataset.department = member.department;
        selectElement.appendChild(option);
      });
    }
  }

  /**
   * Handle login form submission
   */
  async handleLogin(event) {
    event.preventDefault();
    
    const selectElement = document.getElementById('teamMemberSelect');
    const selectedOption = selectElement.selectedOptions[0];
    
    if (!selectedOption || !selectedOption.value) {
      this.showError('Seleziona un membro del team');
      return;
    }

    const name = selectedOption.value;
    const email = selectedOption.dataset.email;
    const role = selectedOption.dataset.role;
    const department = selectedOption.dataset.department;

    // Show loading
    this.showLoading(true);

    try {
      const result = await this.loginTeamMember(name, email);
      
      if (result.success) {
        this.showSuccess(result.message);
        
        // Redirect to chat after successful login
        setTimeout(() => {
          window.location.href = 'chat.html';
        }, 2000);
      } else {
        this.showError(result.error || 'Login failed');
      }
    } catch (error) {
      this.showError('Errore di connessione: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Show loading state
   */
  showLoading(show) {
    const submitBtn = document.getElementById('loginSubmit');
    if (submitBtn) {
      submitBtn.disabled = show;
      submitBtn.textContent = show ? 'Accesso in corso...' : 'Accedi';
    }
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const messageDiv = document.getElementById('loginMessage');
    if (messageDiv) {
      messageDiv.className = 'message success';
      messageDiv.textContent = message;
      messageDiv.style.display = 'block';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const messageDiv = document.getElementById('loginMessage');
    if (messageDiv) {
      messageDiv.className = 'message error';
      messageDiv.textContent = message;
      messageDiv.style.display = 'block';
    }
  }
}

// Initialize team login system
const teamLogin = new TeamLoginSystem();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  teamLogin.initializeLoginForm();
  
  // Add event listener to login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => teamLogin.handleLogin(e));
  }
});

// Export for global access
window.TeamLoginSystem = TeamLoginSystem;
window.teamLogin = teamLogin;
