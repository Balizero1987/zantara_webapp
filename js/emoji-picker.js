/**
 * Emoji Picker Module - Enhancement 23
 * Adds emoji picker to chat input
 */
(function() {
    'use strict';
    function createEmojiPicker() {
        const picker = document.createElement('div');
        picker.className = 'emoji-picker';
        picker.innerHTML = '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗';
        picker.onclick = (e) => {
            if (e.target.tagName === 'SPAN') {
                document.getElementById('chatInput').value += e.target.textContent;
            }
        };
        document.querySelector('.chat-input-panel')?.appendChild(picker);
    }
    window.EmojiPicker = { createEmojiPicker };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createEmojiPicker);
    } else {
        createEmojiPicker();
    }
})();