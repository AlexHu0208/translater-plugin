/**
 * @jest-environment node
 */

global.fetch = jest.fn();
const { translateText } = require('../background');

beforeEach(() => {
  fetch.mockClear();
});

describe('translateText', () => {
  test('returns translatedText on 200 response', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ translatedText: '你好' })
    });

    const result = await translateText('Hello');

    expect(result).toEqual({ success: true, translatedText: '你好' });
    expect(fetch).toHaveBeenCalledWith('http://localhost:5000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: 'Hello', source: 'en', target: 'zh', format: 'text' })
    });
  });

  test('returns error on non-200 response', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const result = await translateText('Hello');

    expect(result).toEqual({ success: false, error: 'HTTP 503' });
  });

  test('returns error on network failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    const result = await translateText('Hello');

    expect(result).toEqual({ success: false, error: 'Failed to fetch' });
  });
});
