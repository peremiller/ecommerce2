// Keep keyboard focus inside an open dialog without altering stored storefront data.
// The caller passes the active element so this helper can be tested without a browser.
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function keepModalFocus(event, panel, activeElement) {
  if (event.key !== 'Tab' || !panel) return false;
  const elements = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
    (element) => element.getClientRects().length > 0 && element.getAttribute('aria-hidden') !== 'true'
  );

  if (elements.length === 0) {
    event.preventDefault();
    panel.focus();
    return true;
  }

  const first = elements[0];
  const last = elements[elements.length - 1];
  if (event.shiftKey && (activeElement === first || !panel.contains(activeElement))) {
    event.preventDefault();
    last.focus();
    return true;
  }
  if (!event.shiftKey && (activeElement === last || !panel.contains(activeElement))) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}
