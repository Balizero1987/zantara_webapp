/**
 * AI Summarization Module - Enhancement 27
 * Summarizes chat history using basic heuristics
 */
(function() {
    'use strict';
    function summarizeChat() {
        const messages = Array.from(document.querySelectorAll('.message-content')).map(m => m.textContent);
        const summary = messages.slice(-10).join(' '); // Simple: last 10 messages
        alert('Chat summary:\n' + summary);
    }
    window.AISummarization = { summarizeChat };
})();