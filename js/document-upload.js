/**
 * ZANTARA - Document Upload Module
 * Drag & drop document upload to RAG system with ChromaDB ingestion
 * 
 * Features:
 * - Drag & drop interface
 * - File validation (PDF, EPUB, TXT, DOCX)
 * - Progress tracking with percentage
 * - Optional metadata (title, author, tier)
 * - Upload history with status
 * - ChromaDB ingestion integration
 * 
 * @module DocumentUpload
 * @version 1.0.0
 */

const DocumentUpload = (() => {
    'use strict';

    // Configuration
    const CONFIG = {
        ragBackendUrl: 'https://scintillating-kindness-production-47e3.up.railway.app',
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: {
            'application/pdf': '.pdf',
            'application/epub+zip': '.epub',
            'text/plain': '.txt',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/msword': '.doc'
        },
        tierLevels: ['S', 'A', 'B', 'C', 'D']
    };

    // State
    let uploadHistory = [];
    let currentUpload = null;

    /**
     * Initialize Document Upload module
     */
    function init() {
        console.log('📄 Initializing Document Upload module...');

        // Load upload history from localStorage
        loadHistory();

        console.log('✅ Document Upload module ready');
    }

    /**
     * Show upload modal
     */
    function show() {
        let modal = document.getElementById('document-upload-modal');

        if (!modal) {
            modal = createModal();
            document.body.appendChild(modal);
            attachEventListeners();
        }

        modal.style.display = 'flex';
        resetForm();
    }

    /**
     * Hide upload modal
     */
    function hide() {
        const modal = document.getElementById('document-upload-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Create modal HTML structure
     */
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'document-upload-modal';
        modal.className = 'document-upload-modal';

        modal.innerHTML = `
            <div class="document-upload-content">
                <div class="document-upload-header">
                    <h2>📄 Carica Documento</h2>
                    <button class="close-btn" onclick="DocumentUpload.hide()">×</button>
                </div>

                <div class="document-upload-body">
                    <!-- Drag & Drop Area -->
                    <div id="drop-zone" class="drop-zone">
                        <div class="drop-zone-icon">📂</div>
                        <p class="drop-zone-text">
                            <strong>Trascina qui il file</strong> oppure clicca per selezionare
                        </p>
                        <p class="drop-zone-hint">
                            Formati supportati: PDF, EPUB, TXT, DOCX (max 50MB)
                        </p>
                        <input type="file" id="file-input" accept=".pdf,.epub,.txt,.docx,.doc" style="display: none;">
                        <button class="select-file-btn" onclick="document.getElementById('file-input').click()">
                            Seleziona File
                        </button>
                    </div>

                    <!-- File Preview -->
                    <div id="file-preview" class="file-preview" style="display: none;">
                        <div class="file-preview-header">
                            <span class="file-icon">📄</span>
                            <div class="file-info">
                                <p class="file-name" id="preview-filename"></p>
                                <p class="file-size" id="preview-filesize"></p>
                            </div>
                            <button class="remove-file-btn" onclick="DocumentUpload.removeFile()">
                                ×
                            </button>
                        </div>

                        <!-- Optional Metadata -->
                        <div class="metadata-section">
                            <h3>Metadata (Opzionale)</h3>
                            <div class="form-group">
                                <label for="book-title">Titolo:</label>
                                <input type="text" id="book-title" placeholder="Es: Advanced Python Programming">
                            </div>
                            <div class="form-group">
                                <label for="book-author">Autore:</label>
                                <input type="text" id="book-author" placeholder="Es: John Doe">
                            </div>
                            <div class="form-group">
                                <label for="tier-override">Tier Override:</label>
                                <select id="tier-override">
                                    <option value="">Auto-detect</option>
                                    <option value="S">S - Elite (Strategic)</option>
                                    <option value="A">A - Advanced</option>
                                    <option value="B">B - Business</option>
                                    <option value="C">C - Core</option>
                                    <option value="D">D - Discovery</option>
                                </select>
                            </div>
                        </div>

                        <!-- Upload Button -->
                        <button class="upload-btn" id="upload-btn" onclick="DocumentUpload.uploadFile()">
                            📤 Carica e Indicizza
                        </button>
                    </div>

                    <!-- Upload Progress -->
                    <div id="upload-progress" class="upload-progress" style="display: none;">
                        <div class="progress-header">
                            <span class="progress-icon spinning">⚙️</span>
                            <span class="progress-text">Caricamento e indicizzazione...</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <p class="progress-percentage" id="progress-percentage">0%</p>
                        <p class="progress-detail" id="progress-detail">Preparazione file...</p>
                    </div>

                    <!-- Upload Result -->
                    <div id="upload-result" class="upload-result" style="display: none;">
                        <div class="result-icon" id="result-icon">✅</div>
                        <h3 id="result-title"></h3>
                        <p id="result-message"></p>
                        <div class="result-details" id="result-details"></div>
                        <button class="upload-another-btn" onclick="DocumentUpload.resetForm()">
                            📄 Carica Altro Documento
                        </button>
                    </div>

                    <!-- Upload History -->
                    <div class="upload-history">
                        <h3>📋 Cronologia Upload</h3>
                        <div id="history-list" class="history-list">
                            <p class="history-empty">Nessun documento caricato ancora</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        // Drag & Drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });

        // Click on drop zone to trigger file input
        dropZone.addEventListener('click', (e) => {
            if (e.target === dropZone || e.target.classList.contains('drop-zone-icon') || 
                e.target.classList.contains('drop-zone-text') || e.target.classList.contains('drop-zone-hint')) {
                fileInput.click();
            }
        });
    }

    /**
     * Handle file selection
     */
    function handleFileSelect(file) {
        console.log('📄 File selected:', file.name);

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            alert(`❌ ${validation.error}`);
            return;
        }

        // Store file
        currentUpload = {
            file: file,
            filename: file.name,
            size: file.size,
            type: file.type
        };

        // Show preview
        showFilePreview(file);
    }

    /**
     * Validate file
     */
    function validateFile(file) {
        // Check file size
        if (file.size > CONFIG.maxFileSize) {
            return {
                valid: false,
                error: `File troppo grande. Massimo ${CONFIG.maxFileSize / 1024 / 1024}MB`
            };
        }

        // Check file type
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        const isValidType = Object.values(CONFIG.allowedTypes).includes(extension);

        if (!isValidType) {
            return {
                valid: false,
                error: `Formato non supportato. Usa: ${Object.values(CONFIG.allowedTypes).join(', ')}`
            };
        }

        return { valid: true };
    }

    /**
     * Show file preview
     */
    function showFilePreview(file) {
        const dropZone = document.getElementById('drop-zone');
        const preview = document.getElementById('file-preview');

        // Hide drop zone, show preview
        dropZone.style.display = 'none';
        preview.style.display = 'block';

        // Update preview info
        document.getElementById('preview-filename').textContent = file.name;
        document.getElementById('preview-filesize').textContent = formatFileSize(file.size);

        // Update history display
        updateHistoryDisplay();
    }

    /**
     * Remove selected file
     */
    function removeFile() {
        currentUpload = null;

        const dropZone = document.getElementById('drop-zone');
        const preview = document.getElementById('file-preview');

        preview.style.display = 'none';
        dropZone.style.display = 'flex';

        // Clear metadata inputs
        document.getElementById('book-title').value = '';
        document.getElementById('book-author').value = '';
        document.getElementById('tier-override').value = '';
    }

    /**
     * Upload file to RAG backend
     */
    async function uploadFile() {
        if (!currentUpload) {
            alert('⚠️ Seleziona prima un file');
            return;
        }

        console.log('📤 Uploading file:', currentUpload.filename);

        // Show progress
        const preview = document.getElementById('file-preview');
        const progress = document.getElementById('upload-progress');
        preview.style.display = 'none';
        progress.style.display = 'block';

        // Get metadata
        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const tierOverride = document.getElementById('tier-override').value;

        // Prepare FormData
        const formData = new FormData();
        formData.append('file', currentUpload.file);
        if (title) formData.append('title', title);
        if (author) formData.append('author', author);
        if (tierOverride) formData.append('tier_override', tierOverride);

        try {
            // Simulate progress (since FastAPI doesn't send upload progress)
            updateProgress(10, 'Caricamento file al server...');

            const response = await fetch(`${CONFIG.ragBackendUrl}/ingest/upload`, {
                method: 'POST',
                body: formData
            });

            updateProgress(60, 'Estrazione testo e analisi...');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload fallito');
            }

            const result = await response.json();
            console.log('✅ Upload successful:', result);

            updateProgress(90, 'Indicizzazione nel database vettoriale...');

            // Wait a bit for final progress
            await new Promise(resolve => setTimeout(resolve, 500));
            updateProgress(100, 'Completato!');

            // Save to history
            const uploadRecord = {
                id: Date.now(),
                filename: currentUpload.filename,
                size: currentUpload.size,
                title: result.book_title || title || currentUpload.filename,
                author: result.book_author || author || 'Unknown',
                tier: result.tier || 'Unknown',
                chunksCreated: result.chunks_created || 0,
                timestamp: new Date().toISOString(),
                success: result.success,
                message: result.message
            };

            uploadHistory.unshift(uploadRecord);
            saveHistory();

            // Show result
            await new Promise(resolve => setTimeout(resolve, 500));
            showResult(uploadRecord);

        } catch (error) {
            console.error('❌ Upload error:', error);

            // Save failed upload to history
            const failedRecord = {
                id: Date.now(),
                filename: currentUpload.filename,
                size: currentUpload.size,
                title: title || currentUpload.filename,
                author: author || 'Unknown',
                tier: 'Error',
                chunksCreated: 0,
                timestamp: new Date().toISOString(),
                success: false,
                message: error.message
            };

            uploadHistory.unshift(failedRecord);
            saveHistory();

            showResult(failedRecord);
        }
    }

    /**
     * Update progress bar
     */
    function updateProgress(percentage, detail) {
        const fill = document.getElementById('progress-fill');
        const percentageText = document.getElementById('progress-percentage');
        const detailText = document.getElementById('progress-detail');

        fill.style.width = `${percentage}%`;
        percentageText.textContent = `${percentage}%`;
        detailText.textContent = detail;
    }

    /**
     * Show upload result
     */
    function showResult(record) {
        const progress = document.getElementById('upload-progress');
        const result = document.getElementById('upload-result');

        progress.style.display = 'none';
        result.style.display = 'block';

        const icon = document.getElementById('result-icon');
        const title = document.getElementById('result-title');
        const message = document.getElementById('result-message');
        const details = document.getElementById('result-details');

        if (record.success) {
            icon.textContent = '✅';
            title.textContent = 'Documento Caricato con Successo!';
            message.textContent = `"${record.title}" è stato indicizzato nel RAG system.`;

            details.innerHTML = `
                <div class="result-detail-item">
                    <strong>📚 Titolo:</strong> ${record.title}
                </div>
                <div class="result-detail-item">
                    <strong>✍️ Autore:</strong> ${record.author}
                </div>
                <div class="result-detail-item">
                    <strong>🏆 Tier:</strong> <span class="tier-badge tier-${record.tier}">${record.tier}</span>
                </div>
                <div class="result-detail-item">
                    <strong>🧩 Chunks Creati:</strong> ${record.chunksCreated}
                </div>
                <div class="result-detail-item">
                    <strong>⏰ Data:</strong> ${new Date(record.timestamp).toLocaleString('it-IT')}
                </div>
            `;
        } else {
            icon.textContent = '❌';
            title.textContent = 'Upload Fallito';
            message.textContent = record.message || 'Si è verificato un errore durante il caricamento.';

            details.innerHTML = `
                <div class="result-detail-item">
                    <strong>📄 File:</strong> ${record.filename}
                </div>
                <div class="result-detail-item">
                    <strong>⏰ Data:</strong> ${new Date(record.timestamp).toLocaleString('it-IT')}
                </div>
            `;
        }

        // Update history display
        updateHistoryDisplay();
    }

    /**
     * Reset form to upload another document
     */
    function resetForm() {
        currentUpload = null;

        const dropZone = document.getElementById('drop-zone');
        const preview = document.getElementById('file-preview');
        const progress = document.getElementById('upload-progress');
        const result = document.getElementById('upload-result');

        dropZone.style.display = 'flex';
        preview.style.display = 'none';
        progress.style.display = 'none';
        result.style.display = 'none';

        // Clear inputs
        document.getElementById('file-input').value = '';
        document.getElementById('book-title').value = '';
        document.getElementById('book-author').value = '';
        document.getElementById('tier-override').value = '';

        // Reset progress
        updateProgress(0, 'Preparazione file...');

        // Update history
        updateHistoryDisplay();
    }

    /**
     * Update history display
     */
    function updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');

        if (!historyList) return;

        if (uploadHistory.length === 0) {
            historyList.innerHTML = '<p class="history-empty">Nessun documento caricato ancora</p>';
            return;
        }

        historyList.innerHTML = uploadHistory.slice(0, 5).map(record => `
            <div class="history-item ${record.success ? 'success' : 'failed'}">
                <div class="history-icon">${record.success ? '✅' : '❌'}</div>
                <div class="history-info">
                    <p class="history-title">${record.title}</p>
                    <p class="history-meta">
                        ${record.author} • ${formatFileSize(record.size)} • 
                        ${new Date(record.timestamp).toLocaleDateString('it-IT')}
                        ${record.success ? `• <span class="tier-badge tier-${record.tier}">${record.tier}</span>` : ''}
                    </p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Load history from localStorage
     */
    function loadHistory() {
        try {
            const saved = localStorage.getItem('zantara_upload_history');
            if (saved) {
                uploadHistory = JSON.parse(saved);
                console.log(`📋 Loaded ${uploadHistory.length} upload records`);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            uploadHistory = [];
        }
    }

    /**
     * Save history to localStorage
     */
    function saveHistory() {
        try {
            // Keep only last 50 records
            const toSave = uploadHistory.slice(0, 50);
            localStorage.setItem('zantara_upload_history', JSON.stringify(toSave));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    /**
     * Format file size
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Clear upload history
     */
    function clearHistory() {
        if (confirm('Vuoi davvero cancellare tutta la cronologia degli upload?')) {
            uploadHistory = [];
            saveHistory();
            updateHistoryDisplay();
            console.log('🗑️ Upload history cleared');
        }
    }

    // Public API
    return {
        init,
        show,
        hide,
        uploadFile,
        removeFile,
        resetForm,
        clearHistory
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DocumentUpload.init);
} else {
    DocumentUpload.init();
}

// Export for global access
window.DocumentUpload = DocumentUpload;
