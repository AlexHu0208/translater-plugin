const {
  validateSelection,
  createTooltipElement,
  positionTooltip,
  showLoading,
  showResult,
  showError
} = require('../content');

describe('validateSelection', () => {
  test('returns false for empty string', () => {
    expect(validateSelection('')).toBe(false);
  });
  test('returns false for single character', () => {
    expect(validateSelection('a')).toBe(false);
  });
  test('returns true for 2 characters', () => {
    expect(validateSelection('ab')).toBe(true);
  });
  test('returns true for normal text', () => {
    expect(validateSelection('Hello world')).toBe(true);
  });
  test('returns true for exactly 500 characters', () => {
    expect(validateSelection('a'.repeat(500))).toBe(true);
  });
  test('returns false for 501 characters', () => {
    expect(validateSelection('a'.repeat(501))).toBe(false);
  });
});

describe('createTooltipElement', () => {
  test('creates a div with id translator-tooltip', () => {
    const el = createTooltipElement();
    expect(el.tagName).toBe('DIV');
    expect(el.id).toBe('translator-tooltip');
  });
  test('contains .translator-label with text ZH', () => {
    const el = createTooltipElement();
    expect(el.querySelector('.translator-label').textContent).toBe('ZH');
  });
  test('contains an empty .translator-text element', () => {
    const el = createTooltipElement();
    const textEl = el.querySelector('.translator-text');
    expect(textEl).not.toBeNull();
    expect(textEl.textContent).toBe('');
  });
});

describe('positionTooltip', () => {
  test('positions above selection when rect.top >= 60', () => {
    const tooltip = document.createElement('div');
    Object.defineProperty(tooltip, 'offsetHeight', { value: 40, configurable: true });
    positionTooltip(tooltip, { top: 200, bottom: 220, left: 100 });
    // above: top = 200 - 40 - 8 = 152
    expect(tooltip.style.position).toBe('fixed');
    expect(tooltip.style.top).toBe('152px');
    expect(tooltip.style.left).toBe('100px');
  });
  test('positions below selection when rect.top < 60', () => {
    const tooltip = document.createElement('div');
    Object.defineProperty(tooltip, 'offsetHeight', { value: 40, configurable: true });
    positionTooltip(tooltip, { top: 30, bottom: 50, left: 100 });
    // below: top = 50 + 8 = 58
    expect(tooltip.style.top).toBe('58px');
    expect(tooltip.style.left).toBe('100px');
  });
});

describe('showLoading', () => {
  test('sets text to "..."', () => {
    const el = createTooltipElement();
    showLoading(el);
    expect(el.querySelector('.translator-text').textContent).toBe('...');
  });
  test('adds loading class', () => {
    const el = createTooltipElement();
    showLoading(el);
    expect(el.classList.contains('loading')).toBe(true);
  });
});

describe('showResult', () => {
  test('sets translated text', () => {
    const el = createTooltipElement();
    showResult(el, '你好世界');
    expect(el.querySelector('.translator-text').textContent).toBe('你好世界');
  });
  test('removes loading class and adds loaded class', () => {
    const el = createTooltipElement();
    el.classList.add('loading');
    showResult(el, '你好');
    expect(el.classList.contains('loading')).toBe(false);
    expect(el.classList.contains('loaded')).toBe(true);
  });
});

describe('showError', () => {
  test('sets error message', () => {
    const el = createTooltipElement();
    showError(el);
    expect(el.querySelector('.translator-text').textContent).toBe('Translation unavailable');
  });
  test('removes loading class and adds error class', () => {
    const el = createTooltipElement();
    el.classList.add('loading');
    showError(el);
    expect(el.classList.contains('loading')).toBe(false);
    expect(el.classList.contains('error')).toBe(true);
  });
});
