/**
 * Conversation Export Module
 * Export conversations as PDF, TXT, or JSON
 */

class ConversationExport {
    constructor() {
        this.init();
    }

    init() {
        this.createExportButton();
        this.attachEventListeners();
    }

    createExportButton() {
        const button = document.createElement('button');
        button.id = 'exportConversationBtn';
        button.className = 'export-conversation-btn';
        button.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
        `;
        button.title = 'Export conversation (Ctrl+E)';

        // Add to chat container header
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            const header = document.createElement('div');
            header.className = 'export-button-container';
            header.appendChild(button);
            chatContainer.insertBefore(header, chatContainer.firstChild);
        }
    }

    attachEventListeners() {
        // Export button click
        document.getElementById('exportConversationBtn')?.addEventListener('click', () => {
            this.showExportModal();
        });

        // Keyboard shortcut Ctrl+E
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.showExportModal();
            }
        });
    }

    showExportModal() {
        const modal = document.createElement('div');
        modal.id = 'exportModal';
        modal.className = 'export-modal';
        modal.innerHTML = `
            <div class="export-modal-content">
                <div class="export-modal-header">
                    <h3>📥 Export Conversation</h3>
                    <button class="export-modal-close">×</button>
                </div>
                <div class="export-modal-body">
                    <p>Choose export format:</p>
                    <div class="export-format-options">
                        <button class="export-format-btn" data-format="pdf">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <text x="7" y="18" font-size="8" fill="currentColor">PDF</text>
                            </svg>
                            <span>PDF Document</span>
                        </button>
                        <button class="export-format-btn" data-format="txt">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="8" y1="13" x2="16" y2="13"/>
                                <line x1="8" y1="17" x2="16" y2="17"/>
                            </svg>
                            <span>Plain Text</span>
                        </button>
                        <button class="export-format-btn" data-format="json">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <text x="7" y="17" font-size="7" fill="currentColor">JSON</text>
                            </svg>
                            <span>JSON Data</span>
                        </button>
                    </div>
                    <div class="export-options">
                        <label>
                            <input type="checkbox" id="includeTimestamps" checked>
                            Include timestamps
                        </label>
                        <label>
                            <input type="checkbox" id="includeCitations" checked>
                            Include citations
                        </label>
                        <label>
                            <input type="checkbox" id="includeMetadata" checked>
                            Include metadata
                        </label>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        modal.querySelector('.export-modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Format button handlers
        modal.querySelectorAll('.export-format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const format = btn.dataset.format;
                const options = {
                    timestamps: document.getElementById('includeTimestamps').checked,
                    citations: document.getElementById('includeCitations').checked,
                    metadata: document.getElementById('includeMetadata').checked
                };
                this.exportConversation(format, options);
                modal.remove();
            });
        });
    }

    async exportConversation(format, options) {
        const messages = this.collectMessages();
        
        if (messages.length === 0) {
            this.showToast('No messages to export', 'error');
            return;
        }

        try {
            switch (format) {
                case 'pdf':
                    await this.exportAsPDF(messages, options);
                    break;
                case 'txt':
                    this.exportAsTXT(messages, options);
                    break;
                case 'json':
                    this.exportAsJSON(messages, options);
                    break;
            }
            this.showToast(`Conversation exported as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Export failed: ' + error.message, 'error');
        }
    }

    collectMessages() {
        const messages = [];
        const messageElements = document.querySelectorAll('.message');

        messageElements.forEach(el => {
            const isUser = el.classList.contains('user-message');
            const content = el.querySelector('.message-content, .ai-content')?.innerText || '';
            const timestamp = el.dataset.timestamp || new Date().toISOString();
            
            // Extract citations if present
            const citations = [];
            el.querySelectorAll('.citation-badge').forEach(cite => {
                citations.push(cite.textContent);
            });

            messages.push({
                role: isUser ? 'user' : 'assistant',
                content: content,
                timestamp: timestamp,
                citations: citations
            });
        });

        return messages;
    }

    async exportAsPDF(messages, options) {
        // Note: Requires jsPDF library. For now, create HTML that can be printed to PDF
        const htmlContent = this.generateHTMLForPDF(messages, options);
        
        // Create a temporary window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Trigger print dialog (user can save as PDF)
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    generateHTMLForPDF(messages, options) {
        const timestamp = new Date().toLocaleString();
        const userName = ZANTARA_API.getUserName() || 'User';
        
        let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ZANTARA Conversation Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { border-bottom: 2px solid #FF0000; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #FF0000; margin: 0; }
        .header .meta { color: #666; font-size: 14px; margin-top: 10px; }
        .message { margin-bottom: 20px; page-break-inside: avoid; }
        .message-header { font-weight: bold; color: #FF0000; margin-bottom: 5px; }
        .message-content { padding: 10px; background: #f5f5f5; border-radius: 5px; line-height: 1.6; }
        .user-message .message-header { color: #090920; }
        .timestamp { color: #999; font-size: 12px; margin-top: 5px; }
        .citations { margin-top: 10px; padding: 10px; background: #fff3cd; border-left: 3px solid #ffc107; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 ZANTARA Conversation</h1>
        <div class="meta">
            <div>User: ${userName}</div>
            <div>Exported: ${timestamp}</div>
            <div>Messages: ${messages.length}</div>
        </div>
    </div>
    <div class="messages">
`;

        messages.forEach((msg, index) => {
            const timeStr = options.timestamps ? new Date(msg.timestamp).toLocaleString() : '';
            html += `
        <div class="message ${msg.role}-message">
            <div class="message-header">${msg.role === 'user' ? '👤 You' : '🤖 ZANTARA'}</div>
            <div class="message-content">${this.escapeHtml(msg.content)}</div>
            ${options.timestamps ? `<div class="timestamp">${timeStr}</div>` : ''}
            ${options.citations && msg.citations.length > 0 ? `
            <div class="citations">
                <strong>📚 Citations:</strong> ${msg.citations.join(', ')}
            </div>` : ''}
        </div>
`;
        });

        html += `
    </div>
    <div class="footer">
        Generated by ZANTARA - Bali Zero Intelligence<br>
        https://zantara.balizero.com
    </div>
</body>
</html>
`;
        return html;
    }

    exportAsTXT(messages, options) {
        const timestamp = new Date().toLocaleString();
        const userName = ZANTARA_API.getUserName() || 'User';
        
        let content = `ZANTARA CONVERSATION EXPORT\n`;
        content += `===============================================\n`;
        content += `User: ${userName}\n`;
        content += `Exported: ${timestamp}\n`;
        content += `Messages: ${messages.length}\n`;
        content += `===============================================\n\n`;

        messages.forEach((msg, index) => {
            const timeStr = options.timestamps ? ` [${new Date(msg.timestamp).toLocaleString()}]` : '';
            const role = msg.role === 'user' ? 'YOU' : 'ZANTARA';
            
            content += `${role}${timeStr}:\n`;
            content += `${msg.content}\n`;
            
            if (options.citations && msg.citations.length > 0) {
                content += `Citations: ${msg.citations.join(', ')}\n`;
            }
            
            content += `\n---\n\n`;
        });

        content += `\nGenerated by ZANTARA - Bali Zero Intelligence\n`;
        content += `https://zantara.balizero.com\n`;

        this.downloadFile(content, `zantara-conversation-${Date.now()}.txt`, 'text/plain');
    }

    exportAsJSON(messages, options) {
        const data = {
            metadata: options.metadata ? {
                user: ZANTARA_API.getUserName() || 'Unknown',
                exported: new Date().toISOString(),
                messageCount: messages.length,
                version: '1.0'
            } : undefined,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: options.timestamps ? msg.timestamp : undefined,
                citations: options.citations ? msg.citations : undefined
            }))
        };

        const jsonString = JSON.stringify(data, null, 2);
        this.downloadFile(jsonString, `zantara-conversation-${Date.now()}.json`, 'application/json');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.conversationExport = new ConversationExport();
    });
} else {
    window.conversationExport = new ConversationExport();
}
