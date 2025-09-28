# ZANTARA Streaming Toggle - Dev Mode

## Overview

The streaming toggle allows developers and testers to enable/disable the adaptive streaming feature in real-time without code changes.

## Activation

### Production (GitHub Pages)
Access with dev parameter:
```
https://balizero1987.github.io/zantara_webapp/chat.html?dev=true
```

### Official Domain
```
https://zantara.balizero.com/chat.html?dev=true
```

### Local Development
Automatically enabled on:
```
http://localhost:54773/chat.html
http://127.0.0.1:54773/chat.html
```

## Features

### Visual Toggle
- **Location**: Bottom-right corner of chat interface
- **Appearance**: Professional toggle switch with ZANTARA design tokens
- **State Persistence**: Settings saved in localStorage
- **Visual Feedback**: Animated notifications on state change

### API Access
Global JavaScript API available when dev mode is active:

```javascript
// Check if dev mode is active
ZANTARA_STREAMING.isDevMode()

// Get current streaming state
ZANTARA_STREAMING.isEnabled()

// Programmatically enable/disable
ZANTARA_STREAMING.setEnabled(true)  // Enable
ZANTARA_STREAMING.setEnabled(false) // Disable

// Access toggle instance
ZANTARA_STREAMING.toggle
```

### Event Listening
Listen for streaming changes:

```javascript
window.addEventListener('zantaraStreamingToggled', function(event) {
    console.log('Streaming:', event.detail.enabled);
    console.log('Timestamp:', event.detail.timestamp);
});
```

## Behavior

### Default State
- **Streaming ON**: Default when toggle is first loaded
- **Auto-detection**: Respects existing user preferences

### Integration
- Replaces static `ENABLE_STREAMING` constant
- Integrates with existing `shouldStream()` logic
- Respects user preferences (reduced-motion, save-data, slow networks)

### Responsive Design
- **Desktop**: Full-size toggle with labels
- **Mobile**: Compact version with adjusted positioning
- **Accessibility**: Keyboard navigation and high contrast support

## Technical Details

### Files
- `js/streaming-toggle.js` - Main toggle logic
- `styles/streaming-toggle.css` - Visual styling
- Integration in `chat.html`

### Storage Keys
- `zantara_streaming_enabled` - User preference
- `zantara_dev_mode` - Dev mode activation state

### Browser Support
- Modern browsers with ES6+ support
- localStorage and CSS custom properties
- Graceful fallback on older browsers

## Usage Scenarios

### Testing
1. Open dev mode: `?dev=true`
2. Toggle streaming ON/OFF to test both experiences
3. Verify behavior with slow networks, reduced motion, etc.

### Debugging
1. Disable streaming to isolate non-streaming issues
2. Check console logs for streaming state changes
3. Use API to programmatically test different states

### Performance Analysis
1. Compare response times with/without streaming
2. Test on different network conditions
3. Measure user experience impact

## Security

- **Client-side only**: No sensitive data exposed
- **Dev mode only**: Not visible in production without explicit activation
- **Local storage**: Preferences stored locally, not transmitted

## Future Enhancements

- Additional streaming parameters (delay, chunk size)
- A/B testing integration
- Analytics integration for streaming effectiveness
- Multi-user testing scenarios