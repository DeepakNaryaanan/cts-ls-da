/**
 * Loads and decorates the ISI (Important Safety Information) block.
 * Renders as a sticky footer bar that is collapsed by default.
 * The bar shows a summary label and an expand/collapse toggle.
 * The full ISI content is revealed when expanded.
 * Fully keyboard-operable and screen-reader accessible.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // EDS block structure: block > row-div > cell-div > authored content
  // Collect the children of the first cell so we get the actual headings/paragraphs/lists
  const firstCell = block.querySelector(':scope > div > div');
  const contentNodes = firstCell ? [...firstCell.childNodes] : [...block.childNodes];

  // Build the sticky container that will replace the in-flow block
  const sticky = document.createElement('div');
  sticky.classList.add('isi-sticky');

  // Header bar (always visible)
  const header = document.createElement('div');
  header.classList.add('isi-header');

  const label = document.createElement('span');
  label.classList.add('isi-label');
  label.textContent = 'Important Safety Information';

  const toggle = document.createElement('button');
  toggle.classList.add('isi-toggle');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'isi-content');
  toggle.setAttribute('type', 'button');
  toggle.innerHTML = '<span class="isi-toggle-text">Expand</span><span class="isi-toggle-icon" aria-hidden="true"></span>';

  header.append(label, toggle);

  // Content panel (hidden when collapsed)
  const panel = document.createElement('div');
  panel.classList.add('isi-content');
  panel.id = 'isi-content';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Important Safety Information');
  panel.setAttribute('aria-hidden', 'true');

  // Move authored content into the panel
  contentNodes.forEach((node) => panel.append(node));

  sticky.append(header, panel);

  // Replace block with the sticky structure
  block.replaceWith(sticky);

  // Toggle expand/collapse
  function setExpanded(expanded) {
    toggle.setAttribute('aria-expanded', String(expanded));
    panel.setAttribute('aria-hidden', String(!expanded));
    toggle.querySelector('.isi-toggle-text').textContent = expanded ? 'Collapse' : 'Expand';
    sticky.classList.toggle('isi-expanded', expanded);
  }

  toggle.addEventListener('click', () => {
    const current = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!current);
  });

  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle.click();
    }
  });
}
