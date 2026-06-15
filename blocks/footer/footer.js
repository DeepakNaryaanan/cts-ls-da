import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// AbbVie wordmark (matches the source footer logo)
const ABBVIE_LOGO = `<a class="footer-abbvie-logo" href="https://www.abbvie.com/" target="_blank" rel="noopener" aria-label="AbbVie — opens in a new window">
  <svg role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124.4 21.5">
    <path d="M123.8,20.8c0-1.3-0.8-1.8-2-1.8c-0.7,0-9.2,0-9.2,0c-4.5,0-5.6-2.7-5.8-4.4c0,0,9.5,0,12.5,0c3.8,0,5-2.8,5-4.6 c0-1.9-1.2-4.6-5-4.6c-3.4,0-6.9,0-6.9,0c-6.5,0-8.6,4.4-8.6,8c0,3.9,2.4,8,8.6,8h11.4C123.8,21.5,123.8,20.9,123.8,20.8z M112.6,7.8c1,0,4.6,0,6,0c2.2,0,2.7,1.3,2.7,2.2c0,0.8-0.5,2.2-2.7,2.2c-1.5,0-12,0-12,0C106.8,10.8,108.1,7.8,112.6,7.8z M85.9,20.5c-0.7,0.9-1,1.3-1.7,1.3c-0.9,0-1.1-0.4-1.7-1.3c-1.4-2-9.8-15-9.8-15s0.6,0,1.2,0c2,0,2.6,0.9,3.2,1.9 c0.5,0.8,7.3,11.2,7.3,11.2s6.4-9.9,7.3-11.3c0.6-0.9,1.4-1.8,3.3-1.8c0.4,0,0.9,0,0.9,0S87.1,18.9,85.9,20.5z M22.8,21.5 c-1.5,0-2.1-0.6-2.3-1.8L20.1,18c-0.4,0.7-2.4,3.5-6.8,3.5c0,0-2.2,0-4.5,0c-6.8,0-8.7-4.6-8.7-8c0-3.8,2.3-8,8.7-8 c1.3,0,2.7,0,4.8,0c4.9,0,7.6,2.8,8.2,6.3c0.5,2.9,1.8,9.7,1.8,9.7S23.3,21.5,22.8,21.5z M12.9,8c-1.6,0-2,0-3.8,0 C4.5,8,3,10.9,3,13.5S4.5,19,9.1,19c1.9,0,2.5,0,3.8,0c4.8,0,6.1-3,6.1-5.5C19,11.3,17.8,8,12.9,8z M99,2.9c0.7,0,1.4-0.4,1.4-1.3 c0-0.2,0-0.4,0-0.5c0-0.8-0.7-1.3-1.4-1.3c-0.7,0-1.4,0.4-1.4,1.3c0,0.1,0,0.3,0,0.5C97.6,2.5,98.3,2.9,99,2.9z M97.7,5.5 c0,0,0.4,0,0.6,0c1.3,0,2.1,0.7,2.1,2.1c0,0.2,0,13.9,0,13.9s-0.3,0-0.6,0c-1.3,0-2.1-0.8-2.1-2.2C97.7,19.2,97.7,5.5,97.7,5.5z M28.1,7.8c0.6-0.6,2.4-2.3,5.9-2.3c0,0,2.2,0,4.5,0c6.8,0,8.8,4.6,8.8,8c0,3.8-2.4,8-8.8,8c-1.3,0-2.7,0-4.8,0 c-4.9,0-8.4-3.1-8.4-8c0-1.6,0-13.4,0-13.4s0.5,0,0.8,0c1.4,0,2,0.7,2,1.9C28.1,2.2,28.1,7.8,28.1,7.8z M34.4,19c1.6,0,2,0,3.8,0 c4.5,0,6.1-2.9,6.1-5.5S42.8,8,38.2,8c-1.9,0-2.5,0-3.8,0c-4.8,0-6.1,3-6.1,5.5C28.2,15.7,29.5,19,34.4,19z M53.2,7.8 c0.6-0.6,2.4-2.3,5.9-2.3c0,0,2.2,0,4.5,0c6.8,0,8.7,4.6,8.7,8c0,3.8-2.3,8-8.7,8c-1.3,0-2.7,0-4.8,0c-4.9,0-8.4-3.1-8.4-8 c0-1.6,0-13.4,0-13.4s0.5,0,0.8,0c1.4,0,2,0.7,2,1.9C53.2,2.2,53.2,7.8,53.2,7.8z M59.5,19c1.6,0,2,0,3.8,0c4.6,0,6.1-2.9,6.1-5.5 S67.9,8,63.3,8c-1.9,0-2.4,0-3.8,0c-4.8,0-6.1,3-6.1,5.5C53.3,15.7,54.6,19,59.5,19z"/>
  </svg>
</a>`;

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment && fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // tag the three sections: primary links, secondary links, legal
  const sections = [...footer.children];
  const [main, sub, legal] = sections;
  if (main) main.classList.add('footer-nav-main');
  if (sub) sub.classList.add('footer-nav-sub');
  if (legal) {
    legal.classList.add('footer-legal');
    // append the AbbVie logo to the legal section
    const logo = document.createElement('div');
    logo.className = 'footer-logo';
    logo.innerHTML = ABBVIE_LOGO;
    legal.append(logo);
  }

  // open external links in a new tab
  footer.querySelectorAll('a[href^="http"]').forEach((a) => {
    if (!a.href.includes(window.location.hostname)) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });

  block.append(footer);
}
