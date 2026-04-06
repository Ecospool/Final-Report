/* EcoSpool — chapter viewer */

(function () {
  'use strict';

  const chapterStage = document.getElementById('chapter-stage');
  const viewerHeading = document.getElementById('viewer-heading');
  const viewerPosition = document.getElementById('viewer-position');
  const prevButton = document.getElementById('prev-chapter');
  const nextButton = document.getElementById('next-chapter');
  const toggle = document.getElementById('nav-toggle');
  const chapterList = document.getElementById('nav-chapters');

  if (!chapterStage || !viewerHeading || !viewerPosition || !prevButton || !nextButton || !toggle || !chapterList) {
    return;
  }

  const chapterOrder = [
    'hero',
    'acknowledgements',
    'ch1',
    'ch2',
    'ch3',
    'ch4',
    'ch5',
    'ch6',
    'ch7',
    'ch8',
    'ch9',
    'ch10',
    'appendices'
  ];

  const chapterMeta = {
    hero: { file: 'chapters/hero.html', title: 'EcoSpool Overview' },
    acknowledgements: { file: 'chapters/acknowledgements.html', title: 'Acknowledgements' },
    ch1: { file: 'chapters/ch1.html', title: 'Chapter 1 · Introduction' },
    ch2: { file: 'chapters/ch2.html', title: 'Chapter 2 · Problem Analysis' },
    ch3: { file: 'chapters/ch3.html', title: 'Chapter 3 · Design Methodology' },
    ch4: { file: 'chapters/ch4.html', title: 'Chapter 4 · Compression Screw' },
    ch5: { file: 'chapters/ch5.html', title: 'Chapter 5 · Heating & Melting Mechanisms' },
    ch6: { file: 'chapters/ch6.html', title: 'Chapter 6 · Cooling Systems' },
    ch7: { file: 'chapters/ch7.html', title: 'Chapter 7 · Final Prototype & Test Configuration' },
    ch8: { file: 'chapters/ch8.html', title: 'Chapter 8 · Integrated Prototype Validation' },
    ch9: { file: 'chapters/ch9.html', title: 'Chapter 9 · Limitations & Future Work' },
    ch10: { file: 'chapters/ch10.html', title: 'Chapter 10 · Conclusion' },
    appendices: { file: 'chapters/appendices.html', title: 'Appendices' }
  };

  const navState = {
    topLinks: new Map(),
    subsectionLinks: new Map(),
    subsectionParents: new Map()
  };

  let suppressHashChange = false;
  let currentChapterId = null;
  let currentTargetId = null;

  function isMobileNav() {
    return window.getComputedStyle(toggle).display !== 'none';
  }

  function closeMobileNav() {
    chapterList.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.chapter-item.open').forEach((item) => item.classList.remove('open'));
  }

  function closeAllDropdowns(exceptItem = null) {
    document.querySelectorAll('.chapter-item.open').forEach((item) => {
      if (item !== exceptItem) item.classList.remove('open');
    });
  }

  function positionDropdown(item) {
    const dropdown = item.querySelector(':scope > .dropdown');
    const link = item.querySelector(':scope > .chapter-link');
    if (!dropdown || !link || isMobileNav()) return;

    const linkRect = link.getBoundingClientRect();
    const navRect = document.getElementById('main-nav').getBoundingClientRect();
    const width = Math.ceil(linkRect.width);
    dropdown.style.width = `${width}px`;
    const left = Math.max(8, Math.min(linkRect.left, window.innerWidth - width - 8));

    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${navRect.bottom - 1}px`;
  }

  function buildNavMaps() {
    document.querySelectorAll('.chapter-item').forEach((item) => {
      const topLink = item.querySelector(':scope > .chapter-link');
      if (!topLink) return;

      const topHref = topLink.getAttribute('href');
      if (!topHref || !topHref.startsWith('#')) return;

      const topId = topHref.slice(1);
      navState.topLinks.set(topId, topLink);

      item.querySelectorAll('.dropdown a').forEach((subLink) => {
        const href = subLink.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        const targetId = href.slice(1);
        navState.subsectionLinks.set(targetId, subLink);
        navState.subsectionParents.set(targetId, topId);
      });
    });
  }

  function getChapterId(targetId) {
    if (!targetId) return 'hero';
    if (chapterMeta[targetId]) return targetId;
    if (navState.subsectionParents.has(targetId)) return navState.subsectionParents.get(targetId);
    if (targetId.startsWith('appendix-')) return 'appendices';

    const chapterMatch = targetId.match(/^ch\d+/);
    if (chapterMatch && chapterMeta[chapterMatch[0]]) {
      return chapterMatch[0];
    }

    return 'hero';
  }

  function updateViewerMeta(chapterId) {
    const chapterIndex = chapterOrder.indexOf(chapterId);
    const chapterNumber = chapterIndex === -1 ? 1 : chapterIndex + 1;

    viewerHeading.textContent = chapterMeta[chapterId].title;
    viewerPosition.textContent = `${chapterNumber} / ${chapterOrder.length}`;

    prevButton.disabled = chapterIndex <= 0;
    nextButton.disabled = chapterIndex === -1 || chapterIndex >= chapterOrder.length - 1;
  }

  function clearActiveLinks() {
    document.querySelectorAll('.chapter-link, .dropdown a').forEach((link) => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });
  }

  function updateActiveLinks(chapterId, targetId) {
    clearActiveLinks();

    const topLink = navState.topLinks.get(chapterId);
    if (topLink) {
      topLink.classList.add('active');
      topLink.setAttribute('aria-current', 'page');
    }

    const activeSubLink = navState.subsectionLinks.get(targetId);
    if (activeSubLink) {
      activeSubLink.classList.add('active');
      activeSubLink.setAttribute('aria-current', 'location');
    }
  }

  function animateLoadedContent() {
    chapterStage.querySelectorAll('.chapter-header, .subsection, .abstract-grid, .hero-left, .hero-right, .conclusion-body').forEach((element, index) => {
      element.classList.add('fade-up');
      element.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;
      requestAnimationFrame(() => {
        element.classList.add('visible');
      });
    });
  }

  function syncVisibleSubsection() {
    if (!currentChapterId) return;

    const subsectionIds = Array.from(navState.subsectionParents.entries())
      .filter(([, parentId]) => parentId === currentChapterId)
      .map(([subsectionId]) => subsectionId);

    if (subsectionIds.length === 0) {
      return;
    }

    let activeSubsectionId = null;
    const stageTop = chapterStage.getBoundingClientRect().top;

    subsectionIds.forEach((subsectionId) => {
      const subsection = chapterStage.querySelector(`#${CSS.escape(subsectionId)}`);
      if (!subsection) return;

      const offset = subsection.getBoundingClientRect().top - stageTop;
      if (offset <= 140) {
        activeSubsectionId = subsectionId;
      }
    });

    if (activeSubsectionId) {
      currentTargetId = activeSubsectionId;
      updateActiveLinks(currentChapterId, activeSubsectionId);
      return;
    }

    currentTargetId = currentChapterId;
    updateActiveLinks(currentChapterId, currentChapterId);
  }

  function scrollToTarget(targetId, behavior) {
    if (!targetId || targetId === currentChapterId) {
      chapterStage.scrollTo({ top: 0, behavior });
      currentTargetId = currentChapterId;
      updateActiveLinks(currentChapterId, currentChapterId);
      return;
    }

    const target = chapterStage.querySelector(`#${CSS.escape(targetId)}`);
    if (!target) {
      chapterStage.scrollTo({ top: 0, behavior });
      currentTargetId = currentChapterId;
      updateActiveLinks(currentChapterId, currentChapterId);
      return;
    }

    target.scrollIntoView({ behavior, block: 'start' });
    currentTargetId = targetId;
    updateActiveLinks(currentChapterId, targetId);
  }

  async function renderChapter(targetId, options = {}) {
    const { updateHash = true, behavior = 'auto' } = options;
    const chapterId = getChapterId(targetId);
    const chapter = chapterMeta[chapterId];

    if (!chapter) return;

    if (currentChapterId !== chapterId) {
      chapterStage.innerHTML = '<div class="chapter-loading">Loading chapter…</div>';

      try {
        const response = await fetch(chapter.file, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load ${chapter.file}`);
        }

        chapterStage.innerHTML = await response.text();
      } catch (error) {
        chapterStage.innerHTML = `<div class="chapter-loading">${error.message}</div>`;
        return;
      }

      currentChapterId = chapterId;
      chapterStage.scrollTo({ top: 0, behavior: 'auto' });
      animateLoadedContent();
    }

    updateViewerMeta(chapterId);
    scrollToTarget(targetId, behavior);

    if (updateHash) {
      suppressHashChange = true;
      window.location.hash = `#${targetId || chapterId}`;
    }
  }

  function navigateRelative(step) {
    const currentIndex = chapterOrder.indexOf(currentChapterId);
    if (currentIndex === -1) return;

    const nextId = chapterOrder[currentIndex + step];
    if (!nextId) return;

    renderChapter(nextId, { updateHash: true, behavior: 'auto' });
  }

  function handleTopLinkClick(link, item, event) {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const targetId = href.slice(1);
    const hasDropdown = Boolean(item.querySelector(':scope > .dropdown'));

    if (hasDropdown) {
      event.preventDefault();

      if (isMobileNav()) {
        if (!item.classList.contains('open')) {
          closeAllDropdowns(item);
          item.classList.add('open');
          return;
        }

        renderChapter(targetId, { updateHash: true, behavior: 'auto' });
        closeMobileNav();
        return;
      }

      const willOpen = !item.classList.contains('open');
      closeAllDropdowns(item);
      item.classList.toggle('open', willOpen);
      if (willOpen) {
        requestAnimationFrame(() => positionDropdown(item));
      }
      return;
    }

    event.preventDefault();
    renderChapter(targetId, { updateHash: true, behavior: 'auto' });
    closeMobileNav();
  }

  function bindNavigation() {
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', () => {
      const open = chapterList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    document.querySelectorAll('.chapter-item').forEach((item) => {
      const topLink = item.querySelector(':scope > .chapter-link');
      if (!topLink) return;

      topLink.addEventListener('click', (event) => handleTopLinkClick(topLink, item, event));

      item.querySelectorAll('.dropdown a').forEach((subLink) => {
        subLink.addEventListener('click', (event) => {
          const href = subLink.getAttribute('href');
          if (!href || !href.startsWith('#')) return;

          event.preventDefault();
          renderChapter(href.slice(1), { updateHash: true, behavior: 'smooth' });
          closeAllDropdowns();
          closeMobileNav();
        });
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.chapter-item')) {
        closeAllDropdowns();
      }
    });

    window.addEventListener('resize', () => {
      document.querySelectorAll('.chapter-item.open').forEach((item) => positionDropdown(item));
    });

    chapterList.addEventListener('scroll', () => {
      document.querySelectorAll('.chapter-item.open').forEach((item) => positionDropdown(item));
    }, { passive: true });

    prevButton.addEventListener('click', () => navigateRelative(-1));
    nextButton.addEventListener('click', () => navigateRelative(1));

    chapterStage.addEventListener('scroll', syncVisibleSubsection, { passive: true });

    window.addEventListener('hashchange', () => {
      if (suppressHashChange) {
        suppressHashChange = false;
        return;
      }

      const targetId = window.location.hash.slice(1) || 'hero';
      renderChapter(targetId, { updateHash: false, behavior: 'auto' });
    });

    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', (event) => {
        event.preventDefault();
        renderChapter('hero', { updateHash: true, behavior: 'auto' });
        closeMobileNav();
      });
    }
  }

  buildNavMaps();
  bindNavigation();
  renderChapter(window.location.hash.slice(1) || 'hero', { updateHash: false, behavior: 'auto' });
})();
