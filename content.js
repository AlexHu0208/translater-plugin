const MAX_Z_INDEX = '2147483647';

function validateSelection(text) {
  return text.length >= 2 && text.length <= 500;
}

function createTooltipElement() {
  const el = document.createElement('div');
  el.id = 'translator-tooltip';

  const label = document.createElement('span');
  label.className = 'translator-label';
  label.textContent = 'ZH';

  const text = document.createElement('span');
  text.className = 'translator-text';

  el.appendChild(label);
  el.appendChild(text);
  return el;
}

function positionTooltip(tooltip, rect) {
  const OFFSET = 8;
  const FLIP_THRESHOLD = 60;
  const top = rect.top < FLIP_THRESHOLD
    ? rect.bottom + OFFSET
    : rect.top - tooltip.offsetHeight - OFFSET;
  tooltip.style.position = 'fixed';
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.zIndex = MAX_Z_INDEX;
}

function showLoading(tooltip) {
  tooltip.querySelector('.translator-text').textContent = '...';
  tooltip.classList.add('loading');
}

function showResult(tooltip, translatedText) {
  tooltip.querySelector('.translator-text').textContent = translatedText;
  tooltip.classList.remove('loading');
  tooltip.classList.add('loaded');
}

function showError(tooltip) {
  tooltip.querySelector('.translator-text').textContent = 'Translation unavailable';
  tooltip.classList.remove('loading');
  tooltip.classList.add('error');
}

let currentTooltip = null;

function hideTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

function handleMouseUp() {
  const selection = window.getSelection();
  const text = selection ? selection.toString().trim() : '';
  if (!validateSelection(text)) return;

  if (!selection.rangeCount) return;

  hideTooltip();

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const tooltip = createTooltipElement();
  document.body.appendChild(tooltip);
  positionTooltip(tooltip, rect);
  showLoading(tooltip);
  currentTooltip = tooltip;

  chrome.runtime.sendMessage({ type: 'translate', text }, (response) => {
    if (!currentTooltip) return; // tooltip was dismissed before response arrived
    if (response && response.success) {
      showResult(currentTooltip, response.translatedText);
    } else {
      showError(currentTooltip);
    }
  });
}

function handleMouseDown(event) {
  if (currentTooltip && !currentTooltip.contains(event.target)) {
    hideTooltip();
  }
}

function handleScroll() {
  hideTooltip();
}

document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('scroll', handleScroll, true);

if (typeof module !== 'undefined') {
  module.exports = { validateSelection, createTooltipElement, positionTooltip, showLoading, showResult, showError };
}
