(() => {
  const root = document.documentElement;
  const top = document.querySelector('.top');
  const hud = document.querySelector('.hud');
  const next = hud.querySelector('.next');
  const dist = hud.querySelector('b');
  const label = hud.querySelector('.where span');
  const turn = hud.querySelector('use');
  const stops = [...document.querySelectorAll('[data-stop]')];
  const route = document.querySelector('.route');
  const main = document.querySelector('main');
  const dots = [...document.querySelectorAll('.wp')];
  const heroCta = document.querySelector('.hero .btn.primary');
  const endCta = document.querySelector('.action .btn.primary');
  let ctaVisible = true;

  // Die Seite ist eine Fahrt: Abstand zum nächsten Abschnitt wie eine Navi-Ansage, in 50-m-Schritten.
  const update = () => {
    const y = window.scrollY;
    const mid = window.innerHeight * 0.45;
    top.classList.toggle('stuck', y > 8);

    const upcoming = stops.find((s) => s.getBoundingClientRect().top > mid);
    if (upcoming) {
      const meters = Math.max(50, Math.round((upcoming.getBoundingClientRect().top - mid) / 8) * 10);
      dist.textContent = `${hud.dataset.in} ${Math.round(meters / 50) * 50} m`;
      label.textContent = upcoming.dataset.stop;
      next.href = `#${upcoming.id}`;
      turn.setAttribute('href', '#i-up');
    } else {
      dist.textContent = hud.dataset.arrived;
      label.textContent = hud.dataset.arrivedHint;
      next.href = '#ziel';
      turn.setAttribute('href', '#i-flag');
    }
    hud.classList.toggle('show', !ctaVisible);

    const box = main.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (mid - box.top) / box.height));
    if (route) route.style.setProperty('--p', progress.toFixed(4));
    dots.forEach((d) => d.classList.toggle('on', d.getBoundingClientRect().top < mid));
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Solange ein großer Kaufknopf sichtbar ist, bleibt die Leiste weg.
  const seen = new Set();
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    ctaVisible = seen.size > 0;
    update();
  });
  [heroCta, endCta].forEach((el) => ctaObserver.observe(el));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  root.classList.add('ready');
  update();
})();
