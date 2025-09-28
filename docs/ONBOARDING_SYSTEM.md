# ZANTARA Onboarding System - Complete Documentation

## Overview

The ZANTARA Onboarding System provides a comprehensive user introduction experience through guided tours, contextual help, and progressive feature discovery. It combines first-time user onboarding with ongoing assistance to maximize user adoption and proficiency.

## System Components

### 🎯 **1. Welcome Flow (Guided Tour)**
- **Purpose**: Introduce new users to core ZANTARA functionality
- **Trigger**: First-time visitors (no `zantara_onboarding_completed` in localStorage)
- **Duration**: 6 interactive steps (~2-3 minutes)
- **Skippable**: Users can skip at any time

### 🔍 **2. Feature Discovery (Smart Tooltips)**
- **Purpose**: Progressive disclosure of advanced features
- **Trigger**: Context-aware (interactions, dev mode, power user behavior)
- **Adaptive**: Shows relevant features based on user behavior
- **Persistent**: Tracks discovered features across sessions

### 💬 **3. Help Center**
- **Purpose**: Always-available assistance and resources
- **Access**: Help button (bottom-left) or F1/Ctrl+? keyboard shortcuts
- **Content**: Tour restart, tips, keyboard shortcuts, feature exploration

## Welcome Flow - Step by Step

### Step 1: Welcome
```javascript
{
    title: 'Benvenuto in ZANTARA! 🌟',
    content: 'Il tuo assistente AI per comunicazione efficace e gestione team.',
    position: 'center',
    actions: ['Inizia il Tour', 'Salta']
}
```

### Step 2: Chat Area
```javascript
{
    title: 'Area Chat Principale',
    content: 'Conversa direttamente con ZANTARA per risposte personalizzate.',
    target: '.messages-container',
    position: 'bottom'
}
```

### Step 3: Quick Actions
```javascript
{
    title: 'Quick Actions ⚡',
    content: 'Accesso rapido a funzioni avanzate: Attune, Synergy, Team Health.',
    target: '.quick-actions',
    position: 'top',
    demo: true // Includes interactive demo
}
```

### Step 4: Message Input
```javascript
{
    title: 'Area di Input',
    content: 'Enter per inviare, Shift+Enter per nuove righe.',
    target: '.input-container',
    position: 'top',
    interactive: true // User can try typing
}
```

### Step 5: Advanced Features
```javascript
{
    title: 'Funzionalità Avanzate 🔧',
    content: 'Streaming, virtualizzazione, test console per sviluppatori.',
    position: 'center',
    showAdvanced: true // Preview of dev features
}
```

### Step 6: Completion
```javascript
{
    title: 'Sei pronto! 🚀',
    content: 'Tour completato. Accedi all\'aiuto tramite il pulsante ?',
    position: 'center',
    actions: ['Inizia a usare ZANTARA', 'Ripeti il Tour']
}
```

## Feature Discovery System

### Smart Triggers

#### 1. **First Visit Features**
- **Quick Actions**: Shown after 3 seconds on first visit
- **Message Input**: Appears on second focus of input field
- **Help Button**: Highlighted for users who haven't used it

#### 2. **Interaction-Based Discovery**
```javascript
// Power user detection
let interactionCount = 0;
if (interactionCount > 50) {
    showFeature('keyboardShortcuts');
}

// Hover-based discovery
onHover('.z-icon-btn[title="Copy"]', () => {
    showFeature('copyButton');
});
```

#### 3. **Dev Mode Features**
- **Streaming Toggle**: Auto-discovered when `?dev=true` is active
- **Virtualization Config**: Shown in dev mode environments
- **Test Console**: Highlighted for developers

#### 4. **Context-Aware Features**
```javascript
// Scroll detection
onScrollToTop(() => {
    if (hasLoadEarlierButton()) {
        showFeature('loadEarlier');
    }
});

// Performance-based
if (messageCount > 50) {
    showFeature('virtualization');
}
```

### Feature Categories

#### 🔧 **Dev Features** (Orange border)
- Streaming Toggle
- Virtualization Config
- Test Console Access

#### 🤖 **ZANTARA Features** (Blue border)
- Quick Actions
- AI Assistant capabilities
- Smart responses

#### ⚡ **Performance Features** (Purple border)
- Message virtualization
- Load earlier functionality
- Optimization settings

#### 🛠️ **Utility Features** (Green border)
- Copy buttons
- Keyboard shortcuts
- Productivity tools

#### 🚀 **Advanced Features** (Pink border)
- Power user shortcuts
- Hidden functionality
- Expert features

#### 💡 **Basic Features** (Gray border)
- Core input/output
- Essential navigation
- Primary workflows

## Help Center Components

### 📚 **Help Menu Options**

#### 1. Tour Guidato
```javascript
{
    icon: '🎯',
    title: 'Tour Guidato',
    description: 'Rivedi le funzionalità principali',
    action: 'restart-tour'
}
```

#### 2. Tips & Trucchi
```javascript
{
    icon: '💡',
    title: 'Tips & Trucchi',
    description: 'Suggerimenti per usare al meglio ZANTARA',
    action: 'quick-tips'
}
```

#### 3. Scorciatoie Tastiera
```javascript
{
    icon: '⌨️',
    title: 'Scorciatoie Tastiera',
    description: 'Comandi rapidi disponibili',
    action: 'keyboard-shortcuts'
}
```

#### 4. Scopri Funzionalità
```javascript
{
    icon: '🔍',
    title: 'Scopri Funzionalità',
    description: 'Esplora tutte le capacità di ZANTARA',
    action: 'feature-discovery'
}
```

### ⌨️ **Keyboard Shortcuts Reference**
| Shortcut | Action |
|----------|---------|
| `Enter` | Invia messaggio |
| `Shift + Enter` | Nuova riga |
| `Ctrl + Shift + T` | Apri Test Console |
| `F1` | Menu aiuto |
| `Ctrl + ?` | Menu aiuto (alternativo) |
| `Esc` | Chiudi tour/modal |

## Implementation Details

### Storage Management
```javascript
// Onboarding completion tracking
localStorage.setItem('zantara_onboarding_completed', 'true');

// Feature discovery tracking
localStorage.setItem('zantara_discovered_features', JSON.stringify({
    quickActions: { discovered: true, timestamp: 1234567890 },
    streamingToggle: { discovered: true, timestamp: 1234567891 }
}));

// Tour step tracking (for partial completion)
localStorage.setItem('zantara_tour_step', '3');
```

### Event System
```javascript
// Custom events for integration
window.dispatchEvent(new CustomEvent('onboardingCompleted', {
    detail: { timestamp: Date.now() }
}));

window.dispatchEvent(new CustomEvent('featureDiscovered', {
    detail: {
        featureId: 'quickActions',
        method: 'tooltip',
        timestamp: Date.now()
    }
}));
```

### API Reference
```javascript
// Global onboarding controls
ZANTARA_ONBOARDING.show()           // Show help menu
ZANTARA_ONBOARDING.restart()        // Restart guided tour
ZANTARA_ONBOARDING.isOnboardingActive()
ZANTARA_ONBOARDING.hasCompletedOnboarding()

// Feature discovery controls
ZANTARA_FEATURE_DISCOVERY.showAllFeatures()
ZANTARA_FEATURE_DISCOVERY.resetDiscoveredFeatures()
ZANTARA_FEATURE_DISCOVERY.getDiscoveryStats()
ZANTARA_FEATURE_DISCOVERY.forceShowFeature('quickActions')
```

## Analytics & Tracking

### Discovery Metrics
```javascript
// Feature discovery statistics
const stats = ZANTARA_FEATURE_DISCOVERY.getDiscoveryStats();
// Returns: { total: 7, discovered: 4, percentage: 57, features: {...} }

// Individual feature tracking
trackFeatureDiscovery('quickActions', 'shown');     // Tooltip displayed
trackFeatureDiscovery('quickActions', 'acknowledged'); // User clicked "Got it"
trackFeatureDiscovery('quickActions', 'dismissed');    // User clicked "Don't show"
trackFeatureDiscovery('quickActions', 'demo');         // User tried demo
```

### Google Analytics Integration
```javascript
// Automatic tracking if gtag is available
if (window.gtag) {
    gtag('event', 'feature_discovery', {
        feature_id: 'quickActions',
        action: 'shown',
        timestamp: Date.now()
    });
}
```

## Customization & Configuration

### Tour Step Customization
```javascript
// Add custom tour steps
const customStep = {
    id: 'custom-feature',
    title: 'Your Custom Feature',
    content: 'Description of your feature',
    target: '.your-selector',
    position: 'bottom',
    actions: [
        { text: 'Try it', action: 'demo-custom', primary: true },
        { text: 'Continue', action: 'next', secondary: true }
    ]
};
```

### Feature Discovery Customization
```javascript
// Add custom discoverable features
const customFeature = {
    selector: '.your-feature',
    title: 'Your Feature Title 🎉',
    description: 'Detailed description of the feature benefit',
    trigger: 'interaction', // or 'first-visit', 'dev-mode', etc.
    position: 'top',
    category: 'utility',
    discoverable: true,
    demo: () => yourCustomDemo()
};
```

### Styling Customization
```css
/* Custom category colors */
.z-feature-tooltip.your-category {
    border-left: 4px solid #your-color;
}

/* Custom tour step styling */
.z-tour-step.your-theme {
    background: your-custom-background;
    border: your-custom-border;
}
```

## Best Practices

### 🎯 **Tour Design**
- **Keep it short**: 6 steps maximum for core tour
- **Make it skippable**: Always provide skip option
- **Focus on value**: Show immediate benefits, not features
- **Interactive demos**: Let users try features during tour
- **Clear progress**: Show step progress and estimated time

### 🔍 **Feature Discovery**
- **Context matters**: Show features when relevant
- **Don't overwhelm**: Limit concurrent tooltips (max 1-2)
- **Progressive disclosure**: Advanced features for experienced users
- **Respect dismissals**: Don't re-show dismissed features
- **Track effectiveness**: Monitor discovery-to-usage conversion

### 💬 **Help System**
- **Always accessible**: Help button always visible
- **Multiple entry points**: Keyboard shortcuts + UI buttons
- **Searchable content**: Easy to find specific information
- **Up-to-date**: Keep help content synchronized with features
- **Multilingual**: Support for multiple languages

## Accessibility Features

### Screen Reader Support
```html
<!-- ARIA labels for tour elements -->
<div role="dialog" aria-labelledby="tour-title" aria-describedby="tour-content">
    <h3 id="tour-title">Tour Step Title</h3>
    <p id="tour-content">Tour step description</p>
</div>

<!-- Tooltip accessibility -->
<div class="z-feature-tooltip" role="tooltip" aria-live="polite">
    Feature description
</div>
```

### Keyboard Navigation
- **Tab order**: Logical tab sequence through tour elements
- **Enter/Space**: Activate buttons and proceed through tour
- **Escape**: Exit tour or close tooltips at any time
- **Arrow keys**: Navigate between tour steps (optional)

### High Contrast & Reduced Motion
```css
/* Automatic adaptations */
@media (prefers-contrast: high) {
    .z-tour-step { border-width: 2px; }
}

@media (prefers-reduced-motion: reduce) {
    .z-tour-step { animation: none; }
}
```

## Performance Considerations

### Lazy Loading
- **Scripts**: Onboarding scripts load after core functionality
- **Content**: Tour content generated on-demand
- **Images**: Feature screenshots loaded when needed

### Memory Management
```javascript
// Cleanup inactive tooltips
dismissTooltip(featureId) {
    this.activeTooltips.delete(featureId);
    // Remove DOM elements and event listeners
}

// Debounced feature checking
const checkForNewFeatures = debounce(() => {
    // Feature discovery logic
}, 5000);
```

### Bundle Size Optimization
- **Modular**: Separate files for onboarding vs. feature discovery
- **Conditional loading**: Only load dev features in dev mode
- **CSS splitting**: Category-specific styles loaded on demand

## Testing & QA

### Manual Testing Checklist
- [ ] First-time user tour completes successfully
- [ ] Skip functionality works at each step
- [ ] Feature tooltips appear in correct contexts
- [ ] Help menu accessible via all entry points
- [ ] Keyboard navigation works throughout
- [ ] Mobile responsiveness on small screens
- [ ] High contrast mode compatibility
- [ ] Reduced motion preferences respected

### Automated Testing
```javascript
// Example test scenarios
describe('Onboarding System', () => {
    test('shows welcome tour for new users', () => {
        localStorage.removeItem('zantara_onboarding_completed');
        // Test tour initiation
    });

    test('feature discovery triggers correctly', () => {
        // Simulate user interactions
        // Verify tooltip appearance
    });

    test('help menu accessibility', () => {
        // Test keyboard navigation
        // Verify ARIA attributes
    });
});
```

## Troubleshooting

### Common Issues

**Tour not starting for new users:**
- Check localStorage for existing completion flag
- Verify DOM elements are loaded before tour initialization
- Check browser console for JavaScript errors

**Feature tooltips not appearing:**
- Verify trigger conditions are met (dev mode, interaction count, etc.)
- Check if features were previously dismissed
- Ensure target elements exist in DOM

**Help button not responding:**
- Check for CSS z-index conflicts
- Verify click event listeners are attached
- Test keyboard shortcuts as alternative

### Debug Commands
```javascript
// Reset onboarding state
localStorage.removeItem('zantara_onboarding_completed');
localStorage.removeItem('zantara_discovered_features');
location.reload();

// Force show specific features
ZANTARA_FEATURE_DISCOVERY.forceShowFeature('quickActions');

// Check discovery status
console.log(ZANTARA_FEATURE_DISCOVERY.getDiscoveryStats());

// Show all available features
ZANTARA_FEATURE_DISCOVERY.showAllFeatures();
```

The ZANTARA Onboarding System provides a comprehensive, accessible, and customizable user introduction experience that scales from first-time users to power users, ensuring maximum feature adoption and user satisfaction.