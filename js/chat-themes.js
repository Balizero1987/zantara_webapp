/**
 * Chat Themes Module - Enhancement 31
 * Allows users to switch chat themes (light/dark/custom)
 */
(function() {
    'use strict';
    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }
    window.ChatThemes = { setTheme };
})();