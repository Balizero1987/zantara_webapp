/**
 * 🇮🇩 Indonesian Badge System
 * Assigns cultural badges based on team roles
 */

const INDONESIAN_BADGES = {
  // 🦅 GARUDA - Leadership
  'CEO': { class: 'badge-garuda', label: 'Garuda', avatar: 'avatar-garuda' },
  'Board Member': { class: 'badge-garuda', label: 'Garuda', avatar: 'avatar-garuda' },

  // 🎨 BATIK - Executive
  'Executive Consultant': { class: 'badge-batik', label: 'Batik', avatar: 'avatar-batik' },

  // ⚙️ TECHNOLOGY
  'AI Bridge/Tech Lead': { class: 'badge-technology', label: 'Teknologi', avatar: 'avatar-technology' },

  // 🎭 WAYANG - Specialist/Advisory
  'Specialist Consultant': { class: 'badge-wayang', label: 'Wayang', avatar: 'avatar-wayang' },
  'External Advisory': { class: 'badge-wayang', label: 'Wayang', avatar: 'avatar-wayang' },
  'External Tax Advisory': { class: 'badge-wayang', label: 'Wayang', avatar: 'avatar-wayang' },

  // 🎼 GAMELAN - Team Coordination
  'Crew Lead': { class: 'badge-gamelan', label: 'Gamelan', avatar: 'avatar-gamelan' },
  'Junior Consultant': { class: 'badge-gamelan', label: 'Gamelan', avatar: 'avatar-gamelan' },

  // 📊 TAX Department
  'Tax Manager': { class: 'badge-tax', label: 'Pajak', avatar: 'avatar-tax' },
  'Tax Expert': { class: 'badge-tax', label: 'Pajak', avatar: 'avatar-tax' },
  'Tax Consultant': { class: 'badge-tax', label: 'Pajak', avatar: 'avatar-tax' },
  'Tax Care': { class: 'badge-tax', label: 'Pajak', avatar: 'avatar-tax' },

  // 📢 MARKETING
  'Marketing Advisory': { class: 'badge-marketing', label: 'Pemasaran', avatar: 'avatar-marketing' },
  'Marketing Specialist': { class: 'badge-marketing', label: 'Pemasaran', avatar: 'avatar-marketing' },

  // 🏢 RECEPTION
  'Reception': { class: 'badge-reception', label: 'Resepsi', avatar: 'avatar-reception' }
};

/**
 * Get badge configuration for a role
 */
function getBadgeForRole(role) {
  return INDONESIAN_BADGES[role] || {
    class: 'badge-gamelan',
    label: 'Tim',
    avatar: 'avatar-gamelan'
  };
}

/**
 * Create badge HTML element
 */
function createBadgeElement(role) {
  const badgeConfig = getBadgeForRole(role);
  const badge = document.createElement('span');
  badge.className = `role-badge ${badgeConfig.class}`;
  badge.textContent = badgeConfig.label;
  badge.title = `${role} - ${badgeConfig.label}`;
  return badge;
}

/**
 * Create avatar element (photo or placeholder)
 */
function createAvatarElement(userId, role) {
  const container = document.createElement('div');
  container.className = 'user-avatar-container';

  // Check if user has uploaded avatar
  const savedAvatar = localStorage.getItem(`zantara-avatar-${userId}`);
  const badgeConfig = getBadgeForRole(role);

  if (savedAvatar) {
    // Show uploaded photo
    const img = document.createElement('img');
    img.className = `user-avatar ${badgeConfig.avatar}`;
    img.src = savedAvatar;
    img.alt = 'User Avatar';
    img.onclick = () => openAvatarUpload(userId, role);
    container.appendChild(img);
  } else {
    // Show placeholder with first letter
    const userName = localStorage.getItem('zantara-user-name') || 'U';
    const placeholder = document.createElement('div');
    placeholder.className = `avatar-placeholder ${badgeConfig.avatar}`;
    placeholder.textContent = userName.charAt(0).toUpperCase();
    placeholder.onclick = () => openAvatarUpload(userId, role);
    placeholder.title = 'Click to upload photo';
    container.appendChild(placeholder);
  }

  return container;
}

/**
 * Open avatar upload (direct file picker)
 */
function openAvatarUpload(userId, role) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ File too large. Max 5MB', 'warning');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please select an image file', 'warning');
      return;
    }

    // Read and save image
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      localStorage.setItem(`zantara-avatar-${userId}`, imageData);

      showToast('✅ Avatar uploaded successfully!', 'success');

      // Update avatar immediately without reload
      setTimeout(() => {
        updateUserHeader();
      }, 100);
    };

    reader.onerror = () => {
      showToast('❌ Failed to read file', 'error');
    };

    reader.readAsDataURL(file);
  };

  input.click();
}

/**
 * Update user header with badge and avatar
 */
function updateUserHeader() {
  const userBtn = document.getElementById('userBtn');
  if (!userBtn) return;

  // Get user data from team login
  const user = JSON.parse(localStorage.getItem('zantara-user') || '{}');
  const role = user.role || localStorage.getItem('zantara-user-role');
  const userId = user.id || user.email || 'guest';
  const userName = user.name || localStorage.getItem('zantara-user-name') || 'User';

  if (!role) return; // No role = public user

  // Clear current content
  userBtn.innerHTML = '';

  // Add avatar
  const avatar = createAvatarElement(userId, role);
  userBtn.appendChild(avatar);

  // Add name
  const nameSpan = document.createElement('span');
  nameSpan.textContent = userName;
  nameSpan.style.marginLeft = '8px';
  nameSpan.style.marginRight = '6px';
  userBtn.appendChild(nameSpan);

  // Add badge
  const badge = createBadgeElement(role);
  userBtn.appendChild(badge);

  // Style adjustments
  userBtn.style.gap = '0';
  userBtn.style.padding = '6px 12px';
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 16px 24px;
    border-radius: 12px;
    background: #2a2a2a;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    animation: slideInRight 0.3s ease;
  `;

  if (type === 'success') toast.style.background = '#10B981';
  if (type === 'error') toast.style.background = '#EF4444';
  if (type === 'info') toast.style.background = '#3B82F6';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateUserHeader);
} else {
  updateUserHeader();
}

// Export for global access
window.IndonesianBadges = {
  getBadgeForRole,
  createBadgeElement,
  createAvatarElement,
  openAvatarUpload,
  updateUserHeader,
  showToast
};
