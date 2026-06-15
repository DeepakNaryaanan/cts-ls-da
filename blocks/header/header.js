import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Collapses any open utility dropdown.
 * @param {Element} nav The nav element
 */
function closeDropdowns(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    drop.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Toggles the mobile navigation panel.
 * @param {Element} nav The header nav container
 * @param {Boolean} forceExpanded Optional flag to force a specific state
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
  if (expanded || isDesktop.matches) closeDropdowns(nav);
}

/**
 * Wires up a list item that contains a nested <ul> as an expandable dropdown.
 * @param {Element} li The list item
 * @param {Element} nav The nav element
 */
function decorateDropdown(li, nav) {
  li.classList.add('nav-drop');
  li.setAttribute('aria-expanded', 'false');
  li.setAttribute('role', 'button');
  li.setAttribute('tabindex', '0');

  const toggle = () => {
    const open = li.getAttribute('aria-expanded') === 'true';
    closeDropdowns(nav);
    li.setAttribute('aria-expanded', open ? 'false' : 'true');
  };

  // toggle only when interacting with the label, not the links inside the submenu
  li.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    e.stopPropagation();
    toggle();
  });
  li.addEventListener('keydown', (e) => {
    if ((e.code === 'Enter' || e.code === 'Space') && !e.target.closest('a')) {
      e.preventDefault();
      toggle();
    }
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  while (fragment && fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // assign semantic classes by section order: brand, utility, sections
  const classes = ['brand', 'utility', 'sections'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // brand — strip button styling from the logo link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) brandLink.className = '';
    navBrand.querySelectorAll('.button-container, .button').forEach((el) => {
      el.className = '';
    });
  }

  // utility nav — top navy bar; mark dropdown items
  const navUtility = nav.querySelector('.nav-utility');
  if (navUtility) {
    navUtility.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
      if (li.querySelector('ul')) decorateDropdown(li, nav);
    });
    // flag the final call-to-action item
    const lastItem = navUtility.querySelector(':scope .default-content-wrapper > ul > li:last-child');
    if (lastItem) lastItem.classList.add('nav-utility-cta');
  }

  // main sections — mark any nested dropdowns and highlight the active link
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
      if (li.querySelector('ul')) decorateDropdown(li, nav);
    });
    const here = window.location.pathname;
    navSections.querySelectorAll('a').forEach((a) => {
      if (a.getAttribute('href') === here) a.closest('li').classList.add('nav-active');
    });
  }

  // tools — search affordance
  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';
  navTools.innerHTML = `<button type="button" class="nav-search" aria-label="Search">
      <span class="nav-search-icon"></span>
    </button>`;

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));

  // group the white "main bar" (brand + menu + tools) so the navy utility
  // bar above it can stretch full-bleed while this row stays centered
  const navMain = document.createElement('div');
  navMain.className = 'nav-main';
  navMain.append(hamburger);
  if (navBrand) navMain.append(navBrand);
  if (navSections) navMain.append(navSections);
  navMain.append(navTools);
  nav.append(navMain);

  // close menu/dropdowns on escape
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav);
      nav.querySelector('.nav-hamburger button').focus();
    } else {
      closeDropdowns(nav);
    }
  });

  // close dropdowns when clicking outside the nav
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeDropdowns(nav);
  });

  // reset state on breakpoint change
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
