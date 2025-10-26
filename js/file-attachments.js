/**
 * File Attachments Module - Enhancement 20
 * Allows users to attach images, PDFs, and files to chat
 */
(function() {
    'use strict';
    function createAttachmentButton() {
        const btn = document.createElement('button');
        btn.className = 'attachment-btn';
        btn.innerHTML = '<span>📎</span> Attach';
        btn.onclick = () => document.getElementById('attachmentInput').click();
        document.querySelector('.chat-input-panel')?.appendChild(btn);
    }
    function createAttachmentInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'attachmentInput';
        input.multiple = true;
        input.accept = 'image/*,application/pdf';
        input.style.display = 'none';
        input.onchange = (e) => {
            // ...handle file upload
        };
        document.body.appendChild(input);
    }
    window.FileAttachments = { createAttachmentButton, createAttachmentInput };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createAttachmentButton();
            createAttachmentInput();
        });
    } else {
        createAttachmentButton();
        createAttachmentInput();
    }
})();