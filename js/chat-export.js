/**
 * Chat Export Module - Enhancement 25
 * Allows users to export chat history as TXT or PDF
 */
(function() {
    'use strict';
    function exportChat(format) {
        const messages = Array.from(document.querySelectorAll('.message-content')).map(m => m.textContent).join('\n');
        if (format === 'txt') {
            const blob = new Blob([messages], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'chat.txt';
            a.click();
        } else if (format === 'pdf') {
            // Simple PDF: just open print dialog
            window.print();
        }
    }
    window.ChatExport = { exportChat };
})();