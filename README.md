# Translate to Chinese — Chrome Extension

A Chrome extension that automatically translates highlighted English text into Simplified Chinese. When you select text on any webpage, a tooltip appears near your selection with the translation.

## Features

- Highlight any English text (2–500 characters) to instantly see the Simplified Chinese translation
- Gradient purple tooltip appears above the selection (flips below when near the top of the viewport)
- Dismisses on click, scroll, or new selection
- Shows "Translation unavailable" gracefully if the translation server is unreachable

## Requirements

- Chrome (Manifest V3)
- [LibreTranslate](https://github.com/LibreTranslate/LibreTranslate) running locally on port 5001

## Setup

### 1. Start LibreTranslate

```bash
pip install libretranslate
libretranslate --load-only en,zh --port 5001
```

Wait for the models to finish loading (first run may take a few minutes).

### 2. Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select this repository folder
4. The extension is now active on all pages

## Usage

Highlight any English text on a webpage. A purple tooltip will appear with the Simplified Chinese translation.

## Development

### Install dependencies

```bash
npm install
```

### Run tests

```bash
npm test
```

### Project structure

| File | Role |
|---|---|
| `manifest.json` | Chrome MV3 extension manifest |
| `background.js` | Service worker — calls LibreTranslate API |
| `content.js` | Content script — detects selection, renders tooltip |
| `content.css` | Tooltip styles |
| `tests/` | Jest unit tests |

## Architecture

Text selection is detected by a content script. The translation request is handled by a background service worker (bypassing page-level CORS restrictions) which POSTs to the local LibreTranslate instance at `http://localhost:5001/translate`.

> **Note:** Port 5000 conflicts with macOS AirPlay Receiver. Port 5001 is used instead.
