async function translateText(text) {
  try {
    const response = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'en', target: 'zh', format: 'text' })
    });
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    const data = await response.json();
    return { success: true, translatedText: data.translatedText };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'translate') {
    translateText(message.text).then(sendResponse);
    return true; // keep message channel open for async response
  }
});

if (typeof module !== 'undefined') module.exports = { translateText };
