/**
 * Message Templates Library
 * Quick insert templates for common queries
 */

class MessageTemplates {
    constructor() {
        this.templates = {
            visa: [
                { title: "KITAS Application", text: "I need information about applying for a KITAS visa in Indonesia. What are the requirements and process?" },
                { title: "KITAS Renewal", text: "My KITAS is expiring soon. What's the renewal process and timeline?" },
                { title: "Work Permit", text: "I need a work permit (IMTA) for Indonesia. What documents are required?" },
                { title: "Visa Extension", text: "How can I extend my tourist visa in Bali? What's the cost and timeline?" }
            ],
            business: [
                { title: "PT Company Setup", text: "I want to register a PT company in Indonesia. What are the steps and costs?" },
                { title: "Business License", text: "What business licenses do I need to operate in Bali?" },
                { title: "Foreign Investment", text: "What are the requirements for foreign investment (PMA) in Indonesia?" },
                { title: "Company Registration", text: "How long does company registration take in Indonesia?" }
            ],
            tax: [
                { title: "Tax Registration", text: "How do I register for NPWP (tax number) in Indonesia?" },
                { title: "Personal Tax", text: "What are the personal income tax rates in Indonesia?" },
                { title: "Corporate Tax", text: "What's the corporate tax rate for PT companies in Indonesia?" },
                { title: "VAT Information", text: "Do I need to register for VAT? What's the threshold?" }
            ],
            property: [
                { title: "Property Purchase", text: "Can foreigners buy property in Bali? What are the options?" },
                { title: "Leasehold vs Freehold", text: "What's the difference between leasehold and freehold in Indonesia?" },
                { title: "Hak Pakai Rights", text: "Can you explain Hak Pakai property rights for foreigners?" },
                { title: "Property Investment", text: "I want to invest in property in Bali. What should I know?" }
            ],
            accounting: [
                { title: "Bookkeeping Services", text: "Do you provide bookkeeping services for small businesses in Bali?" },
                { title: "Financial Reports", text: "What financial reports are required for PT companies in Indonesia?" },
                { title: "Payroll Services", text: "Can you help with payroll management for my Indonesian employees?" },
                { title: "Tax Filing", text: "When are the tax filing deadlines in Indonesia?" }
            ],
            general: [
                { title: "Service Overview", text: "What services does Bali Zero offer?" },
                { title: "Pricing Information", text: "What are your pricing and fees for company formation?" },
                { title: "Contact Info", text: "How can I schedule a consultation with your team?" },
                { title: "Processing Time", text: "How long do your services typically take?" }
            ]
        };

        this.init();
    }

    init() {
        this.createTemplatesButton();
        this.createTemplatesPanel();
        this.attachEventListeners();
    }

    createTemplatesButton() {
        const button = document.createElement('button');
        button.id = 'templatesBtn';
        button.className = 'templates-btn';
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Templates</span>
        `;
        button.title = 'Quick message templates (Ctrl+Shift+T)';

        const inputContainer = document.querySelector('.input-container');
        if (inputContainer) {
            inputContainer.insertBefore(button, inputContainer.firstChild);
        }
    }

    createTemplatesPanel() {
        const panel = document.createElement('div');
        panel.id = 'templatesPanel';
        panel.className = 'templates-panel';
        panel.innerHTML = `
            <div class="templates-header">
                <h3>📝 Message Templates</h3>
                <button class="templates-close">×</button>
            </div>
            <div class="templates-search">
                <input type="text" id="templatesSearch" placeholder="Search templates...">
            </div>
            <div class="templates-categories">
                <button class="template-category active" data-category="all">All</button>
                <button class="template-category" data-category="visa">Visa</button>
                <button class="template-category" data-category="business">Business</button>
                <button class="template-category" data-category="tax">Tax</button>
                <button class="template-category" data-category="property">Property</button>
                <button class="template-category" data-category="accounting">Accounting</button>
                <button class="template-category" data-category="general">General</button>
            </div>
            <div class="templates-list" id="templatesList"></div>
        `;

        document.body.appendChild(panel);
        this.renderTemplates('all');
    }

    renderTemplates(category = 'all', searchQuery = '') {
        const listContainer = document.getElementById('templatesList');
        listContainer.innerHTML = '';

        const templatesToShow = category === 'all' 
            ? Object.values(this.templates).flat()
            : this.templates[category] || [];

        const filtered = searchQuery 
            ? templatesToShow.filter(t => 
                t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.text.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : templatesToShow;

        if (filtered.length === 0) {
            listContainer.innerHTML = '<div class="no-templates">No templates found</div>';
            return;
        }

        filtered.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';
            templateCard.innerHTML = `
                <div class="template-title">${template.title}</div>
                <div class="template-text">${template.text}</div>
                <div class="template-actions">
                    <button class="template-use" data-text="${this.escapeHtml(template.text)}">Use Template</button>
                    <button class="template-preview" data-text="${this.escapeHtml(template.text)}">Preview</button>
                </div>
            `;
            listContainer.appendChild(templateCard);
        });
    }

    attachEventListeners() {
        // Toggle panel
        document.getElementById('templatesBtn').addEventListener('click', () => {
            this.togglePanel();
        });

        // Close panel
        document.querySelector('.templates-close').addEventListener('click', () => {
            this.closePanel();
        });

        // Category filter
        document.querySelectorAll('.template-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.template-category').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const category = e.target.dataset.category;
                const searchQuery = document.getElementById('templatesSearch').value;
                this.renderTemplates(category === 'all' ? 'all' : category, searchQuery);
            });
        });

        // Search
        document.getElementById('templatesSearch').addEventListener('input', (e) => {
            const activeCategory = document.querySelector('.template-category.active').dataset.category;
            this.renderTemplates(activeCategory, e.target.value);
        });

        // Use template (event delegation)
        document.getElementById('templatesList').addEventListener('click', (e) => {
            if (e.target.classList.contains('template-use')) {
                const text = e.target.dataset.text;
                this.insertTemplate(text);
            } else if (e.target.classList.contains('template-preview')) {
                const text = e.target.dataset.text;
                this.previewTemplate(text);
            }
        });

        // Keyboard shortcut Ctrl+Shift+T
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.togglePanel();
            }
        });

        // Close on outside click
        document.getElementById('templatesPanel').addEventListener('click', (e) => {
            if (e.target.id === 'templatesPanel') {
                this.closePanel();
            }
        });
    }

    togglePanel() {
        const panel = document.getElementById('templatesPanel');
        panel.classList.toggle('active');
    }

    closePanel() {
        document.getElementById('templatesPanel').classList.remove('active');
    }

    insertTemplate(text) {
        const textarea = document.getElementById('userInput');
        if (textarea) {
            textarea.value = text;
            textarea.focus();
            this.closePanel();
            
            // Show toast
            this.showToast('Template inserted! Edit and send when ready.');
        }
    }

    previewTemplate(text) {
        alert(`Preview:\n\n${text}`);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/"/g, '&quot;');
    }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.messageTemplates = new MessageTemplates();
    });
} else {
    window.messageTemplates = new MessageTemplates();
}
