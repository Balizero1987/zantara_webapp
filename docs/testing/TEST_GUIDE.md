# 🧪 ZANTARA Message Formatter - Test Guide

**Created**: 2025-10-14  
**Purpose**: Test new structured message formatting and CTA components locally

---

## 📋 What Was Created

### 1. Message Formatter Module
**File**: `js/message-formatter.js`
- Parses structured responses (Paragraph 1, 2, 3 format)
- Formats markdown (bold, italic, lists)
- Adds WhatsApp/Email CTA buttons
- Multi-language support (ID/IT/EN)

### 2. Styles
**File**: `styles/message-formatter.css`
- Structured response styling
- CTA component styles (WhatsApp green, Email purple)
- Enhanced message bubbles
- Day/Night theme support
- Mobile responsive design

### 3. Test Page
**File**: `test-message-formatter.html`
- 4 test cases with real examples
- Theme toggle (day/night)
- Isolated testing environment

---

## 🚀 How to Test Locally

### Step 1: Start Local Server

```bash
cd /Users/antonellosiano/Desktop/NUZANTARA-2/apps/webapp
./test-local.sh
```

This will start a server on `http://localhost:8888`

### Step 2: Open Test Page

Open in your browser:
```
http://localhost:8888/test-message-formatter.html
```

### Step 3: What to Check

#### ✅ Visual Tests
- [ ] Structured sections display correctly (Paragraph 1, 2, 3 headers)
- [ ] Section headers have purple/blue accent color
- [ ] Content is well-formatted with proper spacing
- [ ] Bold and italic text work
- [ ] Lists are formatted correctly

#### ✅ CTA Component
- [ ] WhatsApp button shows green color
- [ ] Email button shows purple color
- [ ] Phone number displays: +62 859 0436 9574
- [ ] Email displays: info@balizero.com
- [ ] Hover effects work smoothly
- [ ] Icons are visible

#### ✅ Theme Toggle
- [ ] Click "Toggle Theme" button
- [ ] Day mode: white background, dark text
- [ ] Night mode: dark background, light text
- [ ] Colors adjust properly in both modes
- [ ] CTA buttons adjust colors

#### ✅ Responsive Design
- [ ] Resize browser window to mobile size (< 768px)
- [ ] CTA buttons stack vertically on mobile
- [ ] Phone number hides on small screens
- [ ] Text remains readable
- [ ] No horizontal scrolling

#### ✅ Links Functionality
- [ ] Click WhatsApp button
- [ ] Should open WhatsApp Web with number +6285904369574
- [ ] Click Email button
- [ ] Should open email client with info@balizero.com

---

## 🧪 Test Cases

### Test 1: Structured Response (English)
Example of marriage registration with paragraph format and special cases

**Check**:
- Three sections visible
- Section headers styled
- Content readable
- CTA at bottom

### Test 2: Regular Response (Italian)
KITAS explanation with natural paragraphs

**Check**:
- Paragraphs separated properly
- Italian CTA text: "Per assistenza diretta contattaci su:"
- Formatting preserved

### Test 3: Italian Complex
PT PMA constitution with structured format

**Check**:
- Italian section headers
- Bold text highlighted
- Costs and timelines clear

### Test 4: With Lists
KITAS renewal with bullet points

**Check**:
- Lists properly formatted
- Bullets display correctly
- Mixed content (text + lists) works

---

## 📱 Mobile Testing

### iOS Safari
```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1
# Example: 192.168.1.100

# Open on iPhone:
http://192.168.1.100:8888/test-message-formatter.html
```

### Android Chrome
Same steps as iOS Safari

**Check**:
- Touch targets are large enough (min 44x44px)
- Buttons work on tap
- No layout shifts
- Smooth scrolling

---

## 🐛 Known Issues to Check For

1. **WhatsApp Link**: Should open WhatsApp, not regular browser
2. **Theme Persistence**: Theme resets on reload (expected for now)
3. **Long Text**: Check if very long responses overflow properly
4. **Special Characters**: Test with Indonesian characters (é, ñ, etc.)

---

## ✅ Integration Checklist

Once local tests pass, integrate into main chat:

1. [ ] Update `js/app.js` to use MessageFormatter
2. [ ] Modify `addMessage()` function
3. [ ] Test with real API responses
4. [ ] Test streaming mode compatibility
5. [ ] Verify no conflicts with existing code
6. [ ] Check performance (no lag on message add)

---

## 📊 Expected Output Examples

### Structured Message
```
━━━━━━━━━━━━━━━━━━━━━━
 Summary
━━━━━━━━━━━━━━━━━━━━━━
Content paragraph here...

━━━━━━━━━━━━━━━━━━━━━━
 Special Cases  
━━━━━━━━━━━━━━━━━━━━━━
Option A: ...
Option B: ...

━━━━━━━━━━━━━━━━━━━━━━
 Practical Steps
━━━━━━━━━━━━━━━━━━━━━━
First, ... Second, ...

─────────────────────────
Untuk bantuan langsung, hubungi kami:
[WhatsApp +62 859 0436 9574] [Email info@balizero.com]
```

---

## 🔧 Debugging

### If styles don't load:
```bash
# Check file exists
ls -la styles/message-formatter.css

# Check browser console for 404 errors
# Open DevTools (F12) > Network tab
```

### If formatter doesn't work:
```bash
# Check JavaScript console for errors
# Open DevTools (F12) > Console tab
```

### If CTA links don't work:
- Check if browser blocks popups
- Try opening links in new tab manually
- Verify phone number format (no spaces in WhatsApp URL)

---

## 📝 Feedback Checklist

After testing, note:
- [ ] Visual appeal (1-10): ___
- [ ] Readability (1-10): ___
- [ ] CTA prominence (1-10): ___
- [ ] Mobile experience (1-10): ___
- [ ] Performance (fast/slow): ___
- Issues found: _______________
- Suggestions: _______________

---

## 🚀 Next Steps

After successful local testing:
1. Integrate into main `chat.html`
2. Update `app.js` to use formatter
3. Test with real backend responses
4. Deploy to staging (test subdomain)
5. User acceptance testing
6. Deploy to production

---

**Happy Testing! 🎉**

Per problemi o domande, controlla il diary:
`.claude/diaries/2025-10-14_sonnet-4.5_m5.md`

