/**
 * Message Reactions Module - Enhancement 32
 * Allows users to react to messages with emojis
 */
(function() {
    'use strict';
    function addReaction(messageId, emoji) {
        const el = document.querySelector(`[data-message-id="${messageId}"]`);
        if (el) el.innerHTML += `<span class='reaction'>${emoji}</span>`;
    }
    window.MessageReactions = { addReaction };
})();