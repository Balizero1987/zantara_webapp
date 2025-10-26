/**
 * Pinned Messages Module - Enhancement 24
 * Allows users to pin/unpin important messages for quick access
 */
(function() {
    'use strict';
    const pinned = new Set();
    function pinMessage(id) { pinned.add(id); updatePanel(); }
    function unpinMessage(id) { pinned.delete(id); updatePanel(); }
    function updatePanel() {
        let html = '<div class="pinned-panel">';
        pinned.forEach(id => { html += `<div class="pinned-item">${id}</div>`; });
        html += '</div>';
        document.querySelector('.sidebar')?.insertAdjacentHTML('beforeend', html);
    }
    window.PinnedMessages = { pinMessage, unpinMessage, updatePanel };
})();