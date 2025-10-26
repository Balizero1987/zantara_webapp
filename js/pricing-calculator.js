/**
 * Pricing Calculator Widget - TIER 1 Feature #5
 * Interactive pricing calculator for Bali Zero services
 * Integrates with DynamicPricingService backend
 */

window.PricingCalculator = (function() {
  'use strict';

  // Service categories and their base prices (IDR in millions)
  const SERVICES = {
    'pt-pma': {
      name: 'PT PMA Company Setup',
      basePrice: 25,
      description: 'Foreign-owned company registration',
      currency: 'IDR',
      timeline: '4 months',
      icon: '🏢'
    },
    'kitas-working': {
      name: 'Working KITAS',
      basePrice: 0.8,
      description: 'Work permit for employees',
      currency: 'IDR',
      timeline: '3 months',
      icon: '💼'
    },
    'kitas-investor': {
      name: 'Investor KITAS',
      basePrice: 0.95,
      description: 'Investor visa & permit',
      currency: 'IDR',
      timeline: '3 months',
      icon: '💰'
    },
    'npwp': {
      name: 'NPWP Tax Registration',
      basePrice: 2,
      description: 'Tax ID registration',
      currency: 'IDR',
      timeline: '2 weeks',
      icon: '📋'
    },
    'accounting': {
      name: 'Monthly Accounting',
      basePrice: 2.5,
      description: 'Bookkeeping & tax compliance',
      currency: 'IDR',
      recurring: 'monthly',
      icon: '📊'
    }
  };

  let widget = null;
  let selectedServices = new Set();
  let total = 0;

  /**
   * Initialize pricing calculator widget
   */
  function init() {
    console.log('[PricingCalculator] Initializing widget');
    createWidget();
    attachEventListeners();
  }

  /**
   * Create widget HTML structure
   */
  function createWidget() {
    // Check if widget already exists
    if (document.querySelector('.pricing-calculator-widget')) {
      console.log('[PricingCalculator] Widget already exists');
      return;
    }

    const widgetHTML = `
      <div class="pricing-calculator-widget collapsed">
        <!-- Toggle Button -->
        <button class="pricing-toggle-btn" id="pricingToggle">
          <span class="icon">💰</span>
          <span class="text">Calcolatore Prezzi</span>
        </button>

        <!-- Calculator Panel -->
        <div class="pricing-panel">
          <div class="pricing-header">
            <h3>🧮 Calcolatore Prezzi</h3>
            <button class="close-btn" id="pricingClose">✖</button>
          </div>

          <div class="pricing-services">
            ${generateServicesHTML()}
          </div>

          <div class="pricing-summary">
            <div class="summary-header">Riepilogo</div>
            <div class="summary-content" id="pricingSummary">
              <div class="empty-state">
                <p>Seleziona uno o più servizi per vedere il preventivo</p>
              </div>
            </div>
            <div class="summary-total" id="pricingTotal">
              <span>Totale:</span>
              <span class="amount">IDR 0M</span>
            </div>
          </div>

          <div class="pricing-actions">
            <button class="btn-secondary" id="pricingReset">Reset</button>
            <button class="btn-primary" id="pricingRequest">Richiedi Preventivo</button>
          </div>
        </div>
      </div>
    `;

    // Append to body
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    widget = document.querySelector('.pricing-calculator-widget');
    console.log('[PricingCalculator] Widget created');
  }

  /**
   * Generate services checkboxes HTML
   */
  function generateServicesHTML() {
    return Object.entries(SERVICES).map(([key, service]) => `
      <label class="service-item">
        <input 
          type="checkbox" 
          class="service-checkbox" 
          data-service-key="${key}"
          data-price="${service.basePrice}"
          data-recurring="${service.recurring || 'one-time'}"
        >
        <div class="service-info">
          <div class="service-name">
            <span class="service-icon">${service.icon}</span>
            <span>${service.name}</span>
          </div>
          <div class="service-details">
            <span class="service-description">${service.description}</span>
            <span class="service-timeline">⏱️ ${service.timeline}</span>
          </div>
          <div class="service-price">
            ${service.currency} ${service.basePrice}M
            ${service.recurring ? `<span class="recurring-badge">${service.recurring}</span>` : ''}
          </div>
        </div>
      </label>
    `).join('');
  }

  /**
   * Attach event listeners
   */
  function attachEventListeners() {
    // Toggle button
    const toggleBtn = document.getElementById('pricingToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleWidget);
    }

    // Close button
    const closeBtn = document.getElementById('pricingClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeWidget);
    }

    // Service checkboxes
    const checkboxes = document.querySelectorAll('.service-checkbox');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', handleServiceToggle);
    });

    // Reset button
    const resetBtn = document.getElementById('pricingReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetCalculator);
    }

    // Request quote button
    const requestBtn = document.getElementById('pricingRequest');
    if (requestBtn) {
      requestBtn.addEventListener('click', requestQuote);
    }

    console.log('[PricingCalculator] Event listeners attached');
  }

  /**
   * Toggle widget visibility
   */
  function toggleWidget() {
    if (!widget) return;

    const isCollapsed = widget.classList.contains('collapsed');
    
    if (isCollapsed) {
      widget.classList.remove('collapsed');
      widget.classList.add('expanded');
      console.log('[PricingCalculator] Widget expanded');
    } else {
      closeWidget();
    }
  }

  /**
   * Close widget
   */
  function closeWidget() {
    if (!widget) return;

    widget.classList.remove('expanded');
    widget.classList.add('collapsed');
    console.log('[PricingCalculator] Widget closed');
  }

  /**
   * Handle service checkbox toggle
   */
  function handleServiceToggle(event) {
    const checkbox = event.target;
    const serviceKey = checkbox.dataset.serviceKey;
    const price = parseFloat(checkbox.dataset.price);
    const recurring = checkbox.dataset.recurring;

    if (checkbox.checked) {
      selectedServices.add(serviceKey);
      console.log(`[PricingCalculator] Added service: ${serviceKey}`);
    } else {
      selectedServices.delete(serviceKey);
      console.log(`[PricingCalculator] Removed service: ${serviceKey}`);
    }

    updateSummary();
  }

  /**
   * Update pricing summary
   */
  function updateSummary() {
    const summaryContent = document.getElementById('pricingSummary');
    const totalElement = document.getElementById('pricingTotal');

    if (selectedServices.size === 0) {
      // Empty state
      summaryContent.innerHTML = `
        <div class="empty-state">
          <p>Seleziona uno o più servizi per vedere il preventivo</p>
        </div>
      `;
      totalElement.querySelector('.amount').textContent = 'IDR 0M';
      total = 0;
      return;
    }

    // Calculate totals
    let oneTimeTotal = 0;
    let recurringTotal = 0;
    const selectedList = [];

    selectedServices.forEach(key => {
      const service = SERVICES[key];
      if (service.recurring) {
        recurringTotal += service.basePrice;
      } else {
        oneTimeTotal += service.basePrice;
      }
      selectedList.push(service);
    });

    total = oneTimeTotal;

    // Generate summary HTML
    const itemsHTML = selectedList.map(service => `
      <div class="summary-item">
        <span class="item-icon">${service.icon}</span>
        <span class="item-name">${service.name}</span>
        <span class="item-price">
          ${service.currency} ${service.basePrice}M
          ${service.recurring ? `<span class="recurring-badge-small">/mese</span>` : ''}
        </span>
      </div>
    `).join('');

    summaryContent.innerHTML = `
      <div class="summary-items">
        ${itemsHTML}
      </div>
      ${recurringTotal > 0 ? `
        <div class="recurring-info">
          💳 Ricorrente: IDR ${recurringTotal}M/mese
        </div>
      ` : ''}
    `;

    // Update total
    totalElement.querySelector('.amount').textContent = `IDR ${total}M`;

    console.log(`[PricingCalculator] Updated summary: ${selectedServices.size} services, Total: ${total}M IDR`);
  }

  /**
   * Reset calculator
   */
  function resetCalculator() {
    // Uncheck all checkboxes
    const checkboxes = document.querySelectorAll('.service-checkbox');
    checkboxes.forEach(cb => cb.checked = false);

    // Clear selection
    selectedServices.clear();
    total = 0;

    // Update UI
    updateSummary();

    console.log('[PricingCalculator] Reset');
  }

  /**
   * Request quote (send to chat)
   */
  function requestQuote() {
    if (selectedServices.size === 0) {
      alert('Seleziona almeno un servizio per richiedere un preventivo');
      return;
    }

    // Build quote request message
    const serviceNames = Array.from(selectedServices).map(key => SERVICES[key].name);
    const message = `Vorrei un preventivo dettagliato per i seguenti servizi: ${serviceNames.join(', ')}. Il totale stimato è IDR ${total}M.`;

    console.log('[PricingCalculator] Quote request:', message);

    // Send to chat
    if (window.ZANTARA_API && window.ZANTARA_API.sendMessage) {
      const messageInput = document.getElementById('messageInput');
      if (messageInput) {
        messageInput.value = message;
        
        // Trigger send
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
          sendBtn.click();
          closeWidget();
          console.log('[PricingCalculator] Quote sent to chat');
        }
      }
    } else {
      console.error('[PricingCalculator] Chat API not available');
      alert('Errore: impossibile inviare il messaggio alla chat');
    }
  }

  /**
   * Public API
   */
  return {
    init,
    toggleWidget,
    closeWidget,
    resetCalculator
  };

})();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.PricingCalculator.init();
  });
} else {
  window.PricingCalculator.init();
}

console.log('✅ Pricing Calculator module loaded');
