/**
 * Message Translation Module - Enhancement 30
 * Allows users to translate messages in chat
 */
(function() {
    'use strict';
    function translateMessage(messageId, targetLang) {
        // ...simulate translation
        const el = document.querySelector(`[data-message-id="${messageId}"]`);
        if (el) el.innerHTML += `<div class='translated'>[${targetLang}] Tradotto</div>`;
    }
    window.MessageTranslation = { translateMessage };
})();