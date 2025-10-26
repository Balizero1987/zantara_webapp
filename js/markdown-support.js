/**
 * Markdown Support Module - Enhancement 22
 * Renders markdown in chat messages
 */
(function() {
    'use strict';
    function renderMarkdownMessages() {
        document.querySelectorAll('.message-content').forEach(msg => {
            // ...simple markdown: bold, italic, links
            let html = msg.innerHTML;
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
            html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
            msg.innerHTML = html;
        });
    }
    window.MarkdownSupport = { renderMarkdownMessages };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderMarkdownMessages);
    } else {
        renderMarkdownMessages();
    }
})();