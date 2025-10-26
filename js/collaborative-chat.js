/**
 * Collaborative Chat Module - Enhancement 19
 * Enables multi-user chat with presence, avatars, and typing indicators
 */
(function() {
    'use strict';
    // Demo: Simulate user presence and avatars
    const users = [
        { id: 'u1', name: 'Antonello', avatar: '👨‍💻', online: true },
        { id: 'u2', name: 'Lingma', avatar: '🤖', online: true },
        { id: 'u3', name: 'Demo', avatar: '🧑', online: false }
    ];
    function renderPresencePanel() {
        let html = '<div class="collab-presence-panel">';
        users.forEach(u => {
            html += `<span class="collab-user${u.online ? ' online' : ''}"><span class="avatar">${u.avatar}</span> ${u.name}</span>`;
        });
        html += '</div>';
        const container = document.querySelector('.sidebar') || document.body;
        container.insertAdjacentHTML('afterbegin', html);
    }
    function showTypingIndicator(userId) {
        // ...simulate typing indicator for user
    }
    window.CollaborativeChat = { users, renderPresencePanel, showTypingIndicator };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderPresencePanel);
    } else {
        renderPresencePanel();
    }
})();