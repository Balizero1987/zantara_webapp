# ZANTARA Message Virtualization - Configurable Rendering

## Overview

Message virtualization optimizes chat performance by limiting the number of rendered messages in the DOM. The system now allows dynamic configuration based on device capabilities and user preferences.

## Key Features

### 🎛️ **Dynamic Configuration**
- **Dev Mode UI**: Slider control (5-200 messages)
- **Device Presets**: Mobile (20), Tablet (50), Desktop (100)
- **Auto-detection**: Automatically sets appropriate defaults
- **Real-time**: Changes apply instantly without page reload

### 📱 **Smart Defaults**
- **Mobile** (`≤600px`): 20 messages - optimized for limited memory
- **Tablet** (`≤960px`): 50 messages - balanced performance
- **Desktop** (`>960px`): 100 messages - full experience

### 💾 **Persistence**
- User preferences saved in `localStorage`
- Auto-adjustment on viewport changes (if no custom setting)
- Survives page reloads and browser sessions

## Activation

### Dev Mode Access
Same as streaming toggle:
- **Production**: `https://balizero1987.github.io/zantara_webapp/chat.html?dev=true`
- **Official**: `https://zantara.balizero.com/chat.html?dev=true`
- **Local**: Automatically enabled on localhost

### UI Location
- **Position**: Bottom-right, above streaming toggle
- **Design**: Consistent with ZANTARA design system
- **Responsive**: Adapts to mobile screens

## API Reference

### Global Access
```javascript
// Check current limit
ZANTARA_VIRTUALIZATION.getMaxMessages()

// Set new limit (5-500)
ZANTARA_VIRTUALIZATION.setMaxMessages(75)

// Get device type detection
ZANTARA_VIRTUALIZATION.getDeviceType() // 'mobile', 'tablet', 'desktop'

// Get default values
ZANTARA_VIRTUALIZATION.getDefaults()
// Returns: { mobile: 20, tablet: 50, desktop: 100 }

// Check dev mode status
ZANTARA_VIRTUALIZATION.isDevMode()

// Virtualize any message array
const result = ZANTARA_VIRTUALIZATION.virtualizeMessages(messages)
// Returns: { visible: [...], hidden: number, total: number, hasMore: boolean }
```

### Event Listening
```javascript
window.addEventListener('zantaraVirtualizationChanged', function(event) {
    console.log('New limit:', event.detail.maxMessages);
    console.log('Previous:', event.detail.previousValue);
    console.log('Timestamp:', event.detail.timestamp);

    // Re-render chat or update UI
    renderChatHistory();
});
```

## Integration with Existing Chat

### Automatic Integration
The system replaces the static `MAX_RENDER_MESSAGES = 50` with:

```javascript
function getMaxRenderMessages() {
    if (window.ZANTARA_VIRTUALIZATION && window.ZANTARA_VIRTUALIZATION.getMaxMessages) {
        return window.ZANTARA_VIRTUALIZATION.getMaxMessages();
    }
    return 50; // Fallback default
}
```

### Backward Compatibility
- **No breaking changes**: Existing code continues to work
- **Graceful fallback**: Falls back to 50 if virtualization module fails
- **Progressive enhancement**: Features activate when available

## Performance Impact

### Memory Usage
- **20 messages**: ~2-4MB DOM overhead
- **50 messages**: ~5-10MB DOM overhead
- **100 messages**: ~10-20MB DOM overhead
- **200 messages**: ~20-40MB DOM overhead

### Recommended Settings
- **Low-end devices**: 10-30 messages
- **Mid-range devices**: 30-75 messages
- **High-end devices**: 75-150 messages
- **Desktop/unlimited**: 100-200 messages

### Load Earlier Feature
- Maintains "Load earlier" button for accessing older messages
- Loads in configurable chunks (matches current limit)
- Preserves chat history pagination

## Testing Scenarios

### Device Testing
1. **Mobile**: Test with 20 messages on small screens
2. **Tablet**: Verify 50-message performance on iPads
3. **Desktop**: Confirm 100+ messages render smoothly

### Performance Testing
```javascript
// Benchmark different limits
for (let limit of [10, 25, 50, 100, 200]) {
    ZANTARA_VIRTUALIZATION.setMaxMessages(limit);
    console.time(`Render ${limit} messages`);
    renderChatHistory();
    console.timeEnd(`Render ${limit} messages`);
}
```

### Memory Testing
1. Use browser DevTools Memory tab
2. Test sustained chat usage with different limits
3. Monitor for memory leaks during limit changes

## Configuration Examples

### Power User Setup
```javascript
// High-performance desktop: maximum messages
ZANTARA_VIRTUALIZATION.setMaxMessages(200);
```

### Battery-Conscious Mobile
```javascript
// Minimal rendering for battery life
ZANTARA_VIRTUALIZATION.setMaxMessages(10);
```

### Auto-Optimization
```javascript
// Automatically adjust based on available memory
const memoryGB = navigator.deviceMemory || 4;
const optimizedLimit = Math.min(200, memoryGB * 25);
ZANTARA_VIRTUALIZATION.setMaxMessages(optimizedLimit);
```

## Technical Implementation

### Files Structure
- `js/message-virtualization.js` - Core virtualization logic
- `styles/virtualization-config.css` - Dev UI styling
- Integration in `chat.html` - Chat renderer updates

### Storage Keys
- `zantara_max_render_messages` - Current user preference
- `zantara_dev_mode` - Dev mode activation state

### Browser Requirements
- **localStorage** support for persistence
- **CSS custom properties** for theming
- **ES6+ JavaScript** for module functionality

## Troubleshooting

### Common Issues

**Config UI not showing:**
- Check dev mode is active (`?dev=true` or localhost)
- Verify JavaScript console for loading errors

**Changes not applying:**
- Check localStorage permissions
- Verify event listeners are attached
- Test with browser refresh

**Performance issues:**
- Lower the message limit
- Check for other memory-intensive tabs
- Monitor browser DevTools Performance tab

### Debug Commands
```javascript
// Check current state
console.log('Current limit:', ZANTARA_VIRTUALIZATION.getMaxMessages());
console.log('Device type:', ZANTARA_VIRTUALIZATION.getDeviceType());
console.log('Dev mode:', ZANTARA_VIRTUALIZATION.isDevMode());

// Force reset to defaults
localStorage.removeItem('zantara_max_render_messages');
location.reload();
```

## Future Enhancements

- **Adaptive Limits**: Auto-adjust based on device performance
- **Memory Monitoring**: Real-time memory usage optimization
- **A/B Testing**: Compare performance across different limits
- **Analytics**: Track optimal settings across user base
- **Presets**: Save/load named configurations