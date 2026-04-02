const TRANSLATE_API_URL = 'http://localhost:5001/translate';

async function translateText(text) {
  try {
    const response = await fetch(TRANSLATE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'en', target: 'zh', format: 'text' })
    });
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    const data = await response.json();
    if (typeof data.translatedText !== 'string') {
      return { success: false, error: 'Unexpected API response format' };
    }
    return { success: true, translatedText: data.translatedText };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'translate') {
    if (typeof message.text !== 'string' || message.text.trim() === '') {
      sendResponse({ success: false, error: 'Missing or empty text' });
      return true;
    }
    translateText(message.text).then(sendResponse);
    return true; // keep message channel open for async response
  }
});

if (typeof module !== 'undefined') module.exports = { translateText };
