import { readBlockConfig } from '../../scripts/aem.js';

/**
 * Loads and decorates the section-metadata block.
 * Reads the Style row from the block config and adds the value as a CSS class
 * on the parent .section element. The block element itself is then removed from
 * the DOM so it does not affect layout.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const config = readBlockConfig(block);
  const section = block.closest('.section');
  if (section) {
    const { style } = config;
    if (style) {
      style.split(',').map((s) => s.trim()).forEach((s) => {
        section.classList.add(s);
      });
    }
  }
  block.parentElement.remove();
}
