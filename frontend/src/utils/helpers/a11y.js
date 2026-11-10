/**
 * Props that make a non-button element (a card, a div with an image) behave like a
 * button: reachable with Tab and activated with Enter or Space, not just a click.
 * Prefer a real <button> or <a> when the markup allows it.
 */
export const buttonProps = (onActivate, label) => ({
  role: 'button',
  tabIndex: 0,
  ...(label ? { 'aria-label': label } : {}),
  onClick: onActivate,
  onKeyDown: (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate(event);
    }
  },
});
