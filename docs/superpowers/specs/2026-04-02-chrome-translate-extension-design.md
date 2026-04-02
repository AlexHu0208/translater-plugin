# Chrome Translation Extension — Design Spec

**Date:** 2026-04-02
**Status:** Approved

---

## Overview

A Chrome extension that automatically translates highlighted English text into Simplified Chinese. When the user selects text on any webpage, a tooltip appears near the selection showing the translation. Translation is powered by a self-hosted LibreTranslate instance running at `http://localhost:5000`.

---

## Architecture

Four files, Manifest V3:

```
translater-plugin/
├── manifest.json       # MV3 extension manifest
├── background.js       # Service worker — makes API calls to LibreTranslate
├── content.js          # Content script — detects selection, renders tooltip
└── content.css         # Tooltip styles
```

### Why Content Script + Background Service Worker

Content scripts run in the page's context and are subject to the page's CORS policy. Making a direct `fetch` to `localhost:5000` from a content script can be blocked on many sites. The background service worker runs in the extension's context and is not subject to page-level CORS restrictions, making it the reliable path for network requests in MV3.

---

## Data Flow

1. User highlights English text on any webpage
2. `mouseup` fires — `content.js` checks: non-empty, 2–500 characters
3. Content script calculates tooltip position from the selection's bounding rect
4. Content script renders tooltip in loading state
5. Content script sends `chrome.runtime.sendMessage({ type: "translate", text })` to background
6. Background POSTs to `http://localhost:5000/translate`:
   ```json
   { "q": "<selected text>", "source": "en", "target": "zh", "format": "text" }
   ```
7. Background returns `{ success: true, translatedText }` or `{ success: false, error }` to content script
8. Content script updates tooltip with the translation or an error message
9. Tooltip dismisses on `mousedown` anywhere on the page, or when a new selection begins

---

## Components

### manifest.json

- Manifest version: 3
- `permissions`: `[]` — no special permissions needed; declarative content scripts don't require `activeTab`
- `host_permissions`: `["http://localhost:5000/*"]` — required to call the local LibreTranslate server
- `content_scripts`: injects `content.js` and `content.css` on `<all_urls>` at `document_idle`
- `background`: service worker pointing to `background.js`

### content.js

Responsibilities:
- Listen for `mouseup` on `document`
- Validate selection: non-empty, 2–500 characters, English-only input assumed
- Dismiss any existing tooltip before proceeding
- Calculate tooltip position using `Range.getBoundingClientRect()`, flipping below the selection if near the top of the viewport
- Render tooltip with a loading/pulse state while awaiting response
- On response: swap in translated text (success) or "Translation unavailable" (error)
- Listen for `mousedown` to dismiss the tooltip

### background.js

Responsibilities:
- Register `chrome.runtime.onMessage` listener
- On `{ type: "translate", text }`: POST to LibreTranslate, return result
- Return `{ success: true, translatedText: string }` on success
- Return `{ success: false, error: string }` on network error or non-200 response

### content.css

Tooltip styles:
- Gradient purple background (`linear-gradient(135deg, #667eea, #764ba2)`)
- White text, `border-radius: 8px`, `padding: 8px 14px`
- Drop shadow: `box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4)`
- Small "ZH" label above the translated text at reduced opacity
- Loading state: pulsing opacity animation on a placeholder bar
- `z-index` high enough to appear above typical page content

---

## Edge Cases & Error Handling

| Scenario | Behaviour |
|---|---|
| Selection < 2 characters | Ignore, no tooltip shown |
| Selection > 500 characters | Ignore, no tooltip shown |
| LibreTranslate unreachable | Tooltip shows "Translation unavailable" |
| LibreTranslate returns non-200 | Tooltip shows "Translation unavailable" |
| User selects again before response | Dismiss old tooltip, start fresh |
| Tooltip near top of viewport | Position below the selection instead of above |

---

## Out of Scope (v1)

- Configurable endpoint URL or API key
- Languages other than English → Simplified Chinese
- Traditional Chinese support
- Min/max character count settings UI
- Translation history or caching
- Support for non-text content (images, PDFs)

---

## Testing Plan

- Load unpacked extension in Chrome and verify it loads without errors
- Highlight English text on a plain webpage — confirm tooltip appears with correct translation
- Highlight < 2 characters — confirm no tooltip
- Highlight > 500 characters — confirm no tooltip
- Stop LibreTranslate server — confirm "Translation unavailable" appears
- Highlight near top of viewport — confirm tooltip flips below
- Highlight new text while tooltip is open — confirm old tooltip dismisses cleanly
- Click anywhere — confirm tooltip dismisses
