/**
 * Code Highlighting Module - Enhancement 21
 * Adds syntax highlighting for code blocks in chat
 */
(function() {
    'use strict';
    function highlightCodeBlocks() {
        document.querySelectorAll('pre code').forEach(block => {
            block.classList.add('highlighted');
            // ...basic JS regex for demo
            block.innerHTML = block.innerHTML.replace(/(function|const|let|var|return|if|else)/g, '<span class="code-keyword">$1</span>');
        });
    }
    window.CodeHighlighting = { highlightCodeBlocks };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', highlightCodeBlocks);
    } else {
        highlightCodeBlocks();
    }
})();