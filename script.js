(function () {
  const app = document.getElementById('app');
  const { event } = EVENT_DATA;

  gsap.registerPlugin(ScrollTrigger);

  const ICONS = {
    spotify: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
    arrow: `<svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/></svg>`
  };

  /* ── Seeded PRNG for consistent drip placement ── */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ── Gooey drip divider SVG ──
     dripColor = the color dripping down (matches section above)
     bgColor   = the color of the section below (fills the SVG background) */
  function createDrip(dripColor, bgColor, seed, blobCount) {
    const rand = mulberry32(seed);
    const W = 1200;
    const rectH = 16;
    const totalH = 70;
    const blobs = [];

    for (let i = 0; i < (blobCount || 7); i++) {
      const cx = 40 + rand() * (W - 80);
      const cy = rectH + 2 + rand() * 4;
      const r = 7 + rand() * 11;
      blobs.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dripColor}" class="drip-blob"/>`);
    }

    return `<svg class="drip-divider" viewBox="0 0 ${W} ${totalH}" preserveAspectRatio="none">
      <rect x="0" y="0" width="${W}" height="${totalH}" fill="${bgColor}"/>
      <g filter="url(#goo)">
        <rect x="-60" y="0" width="${W + 120}" height="${rectH}" fill="${dripColor}"/>
        ${blobs.join('')}
      </g>
    </svg>`;
  }

  /* ── Decorative barcode ── */
  function barcode(n) {
    const bars = [];
    for (let i = 0; i < n; i++) {
      const h = 40 + Math.random() * 60;
      const w = Math.random() > 0.55 ? 2.5 : 1.2;
      bars.push(`<span style="height:${h}%;width:${w}px"></span>`);
    }
    return bars.join('');
  }

  /* ── Build the page ── */
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(event.venue.address.fullAddress)}`;

  const artistCards = event.artists.map((a, i) => `
    <div class="artist-card" data-index="${i}">
      <div class="artist-photo-wrap">
        <div class="artist-ring" style="border-color:${a.color}"></div>
        <div class="artist-ring-pulse" style="border-color:${a.color}"></div>
        <img class="artist-photo" src="${a.image}" alt="${a.name}"
             style="border-color:${a.color}" loading="lazy">
      </div>
      <h3 class="artist-name">${(() => {
        const w = a.name.split(' ');
        return `<span class="name-first">${w[0]}</span>${w.length > 1 ? ' ' + w.slice(1).join(' ') : ''}`;
      })()}</h3>
      <span class="tap-hint">Tap to explore</span>
      <div class="artist-details">
        <p class="artist-bio">${a.bio}</p>
        <div class="artist-links">
          <a class="artist-link link-spotify" href="${a.spotify}" target="_blank" rel="noopener">
            ${ICONS.spotify} Spotify
          </a>
          <a class="artist-link link-insta" href="${a.instagram}" target="_blank" rel="noopener">
            ${ICONS.instagram} Instagram
          </a>
        </div>
      </div>
    </div>
  `).join('');

  const notesHTML = event.notes.map(n => `<span class="note-pill">${n}</span>`).join('');

  const dateParts = event.displayDate.split(', ');
  const dateShort = dateParts[0].replace(/(\w+)\s(\d+)/, (_, m, d) => `${m.substring(0, 3).toUpperCase()} ${d}`);

  app.innerHTML = `
    <section class="hero">
      <div class="hero-blob"></div>
      <div class="hero-inner">
        <p class="hero-eyebrow">${event.subtitle}</p>
        <h1 class="hero-title">${event.title}</h1>
        <p class="hero-subtitle">${event.venue.name}</p>
      </div>
    </section>

    ${createDrip('#FF53D8', '#FFF408', 42, 7)}

    <section class="info-bar">
      <div class="info-bar-content">
        <span class="info-date">${event.displayDate}</span>
        <span class="info-venue-text">${event.venue.address.fullAddress}</span>
        <span class="info-schedule">Doors ${event.schedule.doorsOpen} · Show ${event.schedule.showStarts}</span>
      </div>
    </section>

    ${createDrip('#FFF408', '#000000', 77, 6)}

    <section class="lineup">
      <p class="lineup-label">— The Lineup —</p>
      <div class="lineup-grid">${artistCards}</div>
    </section>

    ${createDrip('#000000', '#000000', 113, 5)}

    <section class="ticket-section">
      <p class="ticket-section-label">— Tickets —</p>
      <div class="ticket-perspective">
        <div class="ticket">
          <div class="ticket-main">
            <div class="ticket-header">
              <span class="ticket-star">★</span>
              <span class="ticket-type">${event.subtitle}</span>
            </div>
            <h3 class="ticket-title">${event.title}</h3>
            <div class="ticket-info-grid">
              <div class="ticket-field">
                <span class="ticket-label">Date</span>
                <span class="ticket-value">${dateShort}, ${dateParts[1] || ''}</span>
              </div>
              <div class="ticket-field">
                <span class="ticket-label">Venue</span>
                <span class="ticket-value">${event.venue.name}</span>
              </div>
              <div class="ticket-field">
                <span class="ticket-label">Show</span>
                <span class="ticket-value">${event.schedule.showStarts}</span>
              </div>
              <div class="ticket-field">
                <span class="ticket-label">Doors</span>
                <span class="ticket-value">${event.schedule.doorsOpen}</span>
              </div>
            </div>
            <a class="ticket-cta" href="${event.ticketing.eventbriteUrl}" target="_blank" rel="noopener">
              Get Tickets ${ICONS.arrow}
            </a>
          </div>
          <div class="ticket-perf"></div>
          <div class="ticket-stub">
            <div class="ticket-price-big">$${event.ticketing.advancePrice}</div>
            <div class="ticket-price-label">Advance</div>
            <div class="ticket-barcode">${barcode(22)}</div>
            <div class="ticket-price-door">$${event.ticketing.doorPrice} at door</div>
          </div>
        </div>
      </div>
      <div class="ticket-notes">${notesHTML}</div>
    </section>

    ${createDrip('#000000', '#0a0515', 199, 6)}

    <section class="venue-section">
      <p class="venue-name">${event.venue.name}</p>
      <p class="venue-address">
        <a href="${mapsUrl}" target="_blank" rel="noopener">${event.venue.address.fullAddress}</a>
      </p>
      <div class="venue-map">
        <iframe
          src="https://www.google.com/maps?q=${encodeURIComponent(event.venue.address.fullAddress)}&output=embed"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allowfullscreen>
        </iframe>
      </div>
    </section>

    <section class="exports-section">
      <p class="exports-label">— Export Poster —</p>
      <div class="export-formats">
        <div class="export-card">
          <div class="export-preview export-preview-tall"></div>
          <div class="export-format-name">Tall</div>
          <div class="export-dims">1080 × 1920</div>
          <div class="export-btns">
            <button class="export-btn" data-format="tall" data-type="jpg">JPG</button>
            <button class="export-btn" data-format="tall" data-type="pdf">PDF</button>
          </div>
        </div>
        <div class="export-card">
          <div class="export-preview export-preview-square"></div>
          <div class="export-format-name">Square</div>
          <div class="export-dims">1080 × 1080</div>
          <div class="export-btns">
            <button class="export-btn" data-format="square" data-type="jpg">JPG</button>
            <button class="export-btn" data-format="square" data-type="pdf">PDF</button>
          </div>
        </div>
        <div class="export-card">
          <div class="export-preview export-preview-wide"></div>
          <div class="export-format-name">Wide</div>
          <div class="export-dims">1920 × 1080</div>
          <div class="export-btns">
            <button class="export-btn" data-format="wide" data-type="jpg">JPG</button>
            <button class="export-btn" data-format="wide" data-type="pdf">PDF</button>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <img class="footer-logo" src="white-oval-transparent.png" alt="">
      <p class="footer-copy">&copy; ${new Date().getFullYear()} ${event.title}</p>
    </footer>
  `;

  /* ─────────────────────────────────────
     GSAP ANIMATIONS
     ───────────────────────────────────── */

  /* Hero entrance */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.5 })
    .from('.hero-title', { y: 40, opacity: 0, duration: 0.7 }, '-=0.3')
    .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.5 }, '-=0.4');

  /* Drip blob animations (the liquid magic) */
  gsap.utils.toArray('.drip-blob').forEach(blob => {
    const dist = 8 + Math.random() * 22;
    const dur = 2.5 + Math.random() * 3;
    gsap.to(blob, {
      attr: { cy: `+=${dist}`, r: `-=${1 + Math.random() * 3}` },
      duration: dur,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: Math.random() * 2
    });
  });

  /* Artist cards entrance */
  gsap.from('.artist-card', {
    scrollTrigger: { trigger: '.lineup', start: 'top 85%' },
    scale: 0,
    rotation: -8,
    opacity: 0,
    duration: 0.7,
    ease: 'back.out(1.7)',
    stagger: 0.15
  });

  /* ─────────────────────────────────────
     CONTINUOUS SCROLL-LINKED EFFECTS
     (scrub: true = tied to scroll position, runs every time)
     ───────────────────────────────────── */

  /* Hero inner text moves together — section stays pinned for drip seam */
  gsap.to('.hero-inner', {
    y: -8,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  /* Info bar content subtle horizontal drift */
  gsap.to('.info-bar-content', {
    x: -6,
    scrollTrigger: {
      trigger: '.info-bar',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  /* Lineup label letter-spacing breathes open */
  gsap.to('.lineup-label', {
    letterSpacing: '0.38em',
    scrollTrigger: {
      trigger: '.lineup',
      start: 'top bottom',
      end: 'center center',
      scrub: true
    }
  });

  /* Artist photos subtle scale bulge as you scroll through */
  gsap.utils.toArray('.artist-photo').forEach((photo, i) => {
    gsap.fromTo(photo,
      { scale: 0.95 },
      {
        scale: 1.04,
        scrollTrigger: {
          trigger: photo,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });

  /* Artist rings rotate slowly with scroll */
  gsap.utils.toArray('.artist-ring').forEach((ring, i) => {
    gsap.to(ring, {
      rotation: i % 2 === 0 ? 90 : -90,
      scrollTrigger: {
        trigger: ring,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  /* Ticket subtle tilt tied to scroll */
  gsap.fromTo('.ticket',
    { rotation: 2 },
    {
      rotation: -1.5,
      scrollTrigger: {
        trigger: '.ticket-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    }
  );

  /* Venue name subtle scale pulse on scroll-through */
  gsap.fromTo('.venue-name',
    { scale: 0.96 },
    {
      scale: 1.04,
      scrollTrigger: {
        trigger: '.venue-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    }
  );

  /* Footer logo parallax — lags behind scroll slightly */
  gsap.to('.footer-logo', {
    y: -10,
    scrollTrigger: {
      trigger: '.footer',
      start: 'top bottom',
      end: 'bottom bottom',
      scrub: true
    }
  });

  /* ─────────────────────────────────────
     INTERACTIONS
     ───────────────────────────────────── */

  /* Artist card click */
  document.querySelectorAll('.artist-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.artist-link')) return;

      const wasActive = card.classList.contains('active');
      card.classList.toggle('active');

      if (!wasActive) {
        const pulse = card.querySelector('.artist-ring-pulse');
        gsap.fromTo(pulse,
          { scale: 1, opacity: 0.6 },
          { scale: 1.6, opacity: 0, duration: 0.7, ease: 'power2.out' }
        );
        const details = card.querySelector('.artist-details');
        gsap.from(details.children, {
          y: 10, opacity: 0, duration: 0.4, stagger: 0.08, delay: 0.15, ease: 'power2.out'
        });
      }
    });
  });

  /* ── Circular orbit emitters tracing the artist border ── */
  document.querySelectorAll('.artist-photo-wrap').forEach(wrap => {
    const color = wrap.querySelector('.artist-photo').style.borderColor;
    const half = wrap.offsetWidth / 2;
    const orbitR = half + 4;

    [0, 1].forEach(idx => {
      const dot = document.createElement('div');
      dot.className = 'particle';
      dot.style.background = color;
      dot.style.boxShadow = `0 0 8px 2px ${color}`;
      wrap.appendChild(dot);

      const size = 3.5 - idx;
      const offset = idx * Math.PI;
      const dur = 6 + idx * 2;

      gsap.set(dot, { width: size, height: size, opacity: 0.55 - idx * 0.15 });

      const proxy = { angle: offset };
      gsap.to(proxy, {
        angle: offset + Math.PI * 2,
        duration: dur,
        ease: 'none',
        repeat: -1,
        onUpdate() {
          gsap.set(dot, {
            x: half + Math.cos(proxy.angle) * orbitR - size / 2,
            y: half + Math.sin(proxy.angle) * orbitR - size / 2
          });
        }
      });
    });
  });

  /* Ticket 3D tilt on hover (desktop only) */
  const ticket = document.querySelector('.ticket');
  if (ticket && window.matchMedia('(hover: hover)').matches) {
    ticket.addEventListener('mousemove', (e) => {
      const rect = ticket.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(ticket, {
        rotateY: x * 14,
        rotateX: -y * 14,
        scale: 1.03,
        boxShadow: '0 25px 60px rgba(0,0,0,0.55)',
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    ticket.addEventListener('mouseleave', () => {
      gsap.to(ticket, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        boxShadow: '0 12px 50px rgba(0,0,0,0.5)',
        duration: 0.6,
        ease: 'elastic.out(1, 0.6)',
        overwrite: 'auto'
      });
    });
  }

  /* ─────────────────────────────────────
     POSTER EXPORT
     ───────────────────────────────────── */

  const FORMATS = {
    tall:   { w: 1080, h: 1920, layout: 'vertical' },
    square: { w: 1080, h: 1080, layout: 'vertical' },
    wide:   { w: 1920, h: 1080, layout: 'horizontal' }
  };

  function buildPoster(format) {
    const f = FORMATS[format];
    const isWide = f.layout === 'horizontal';
    const scale = f.w / (isWide ? 1920 : 1080);

    const artistNamesHTML = event.artists.map(a =>
      `<span style="display:block;font-family:'Bebas Neue',sans-serif;font-size:${isWide ? 52 : (format === 'square' ? 48 : 60)}px;color:#FAFAFA;text-transform:uppercase;letter-spacing:0.04em;line-height:1.15;">${a.name}</span>`
    ).join('');

    const ticketH = format === 'square' ? 200 : 240;
    const ticketFS = format === 'square' ? 0.85 : 1;

    const posterHTML = isWide ? `
      <div style="width:${f.w}px;height:${f.h}px;display:flex;overflow:hidden;font-family:'Space Grotesk',sans-serif;">
        <div style="flex:1;background:#FF53D8;padding:80px 60px;display:flex;flex-direction:column;justify-content:center;">
          <div style="font-size:14px;letter-spacing:0.35em;text-transform:uppercase;color:#000;opacity:0.6;margin-bottom:12px;">${event.subtitle}</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:120px;line-height:0.88;color:#000;text-transform:uppercase;">${event.title}</div>
          <div style="font-size:16px;font-weight:500;color:#000;opacity:0.7;margin-top:16px;letter-spacing:0.12em;text-transform:uppercase;">${event.venue.name}</div>
        </div>
        <div style="flex:1;background:#000;padding:60px;display:flex;flex-direction:column;justify-content:center;gap:40px;">
          <div>${artistNamesHTML}</div>
          <div style="background:#FAFAFA;border-radius:14px;padding:28px 24px;display:flex;overflow:hidden;">
            <div style="flex:1;display:flex;flex-direction:column;gap:12px;">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:#000;line-height:1;">${event.title}</div>
              <div style="display:flex;gap:24px;">
                <div><div style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.35);">Date</div><div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:#000;">${event.displayDate}</div></div>
                <div><div style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.35);">Venue</div><div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:#000;">${event.venue.name}</div></div>
              </div>
              <div style="display:flex;gap:24px;">
                <div><div style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.35);">Show</div><div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:#000;">${event.schedule.showStarts}</div></div>
                <div><div style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.35);">Doors</div><div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:#000;">${event.schedule.doorsOpen}</div></div>
              </div>
            </div>
            <div style="width:1px;border-left:2px dashed #ddd;margin:0 16px;position:relative;">
              <div style="position:absolute;width:20px;height:20px;background:#000;border-radius:50%;left:50%;top:-10px;transform:translateX(-50%);"></div>
              <div style="position:absolute;width:20px;height:20px;background:#000;border-radius:50%;left:50%;bottom:-10px;transform:translateX(-50%);"></div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:80px;">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;color:#000;line-height:1;">$${event.ticketing.advancePrice}</div>
              <div style="font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.4);">Advance</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;opacity:0.25;">
            <img src="white-oval-transparent.png" style="width:36px;filter:invert(1);">
          </div>
        </div>
      </div>
    ` : `
      <div style="width:${f.w}px;height:${f.h}px;display:flex;flex-direction:column;overflow:hidden;font-family:'Space Grotesk',sans-serif;">
        <div style="background:#FF53D8;padding:${format === 'square' ? '60px 50px 40px' : '100px 60px 60px'};text-align:center;flex-shrink:0;">
          <div style="font-size:${format === 'square' ? 12 : 14}px;letter-spacing:0.35em;text-transform:uppercase;color:#000;opacity:0.6;margin-bottom:10px;">${event.subtitle}</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:${format === 'square' ? 100 : 140}px;line-height:0.88;color:#000;text-transform:uppercase;">${event.title}</div>
          <div style="font-size:${format === 'square' ? 14 : 16}px;font-weight:500;color:#000;opacity:0.7;margin-top:14px;letter-spacing:0.12em;text-transform:uppercase;">${event.venue.name}</div>
        </div>
        <div style="background:#FFF408;padding:${format === 'square' ? '14px' : '18px'} 50px;text-align:center;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:${format === 'square' ? 22 : 26}px;color:#000;letter-spacing:0.04em;">${event.displayDate}</div>
          <div style="font-size:${format === 'square' ? 11 : 13}px;color:#000;opacity:0.55;">Doors ${event.schedule.doorsOpen} · Show ${event.schedule.showStarts}</div>
        </div>
        <div style="background:#000;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:${format === 'square' ? '30px 50px' : '50px 60px'};gap:${format === 'square' ? 24 : 36}px;">
          <div style="text-align:center;">${artistNamesHTML}</div>
          <div style="background:#FAFAFA;border-radius:14px;padding:${format === 'square' ? '20px 18px' : '28px 24px'};display:flex;overflow:hidden;width:100%;max-width:${format === 'square' ? 500 : 600}px;">
            <div style="flex:1;display:flex;flex-direction:column;gap:10px;">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:${format === 'square' ? 22 : 28}px;color:#000;line-height:1;">${event.title}</div>
              <div style="display:flex;gap:20px;">
                <div><div style="font-size:${format === 'square' ? 8 : 9}px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.35);">Venue</div><div style="font-family:'Bebas Neue',sans-serif;font-size:${format === 'square' ? 15 : 18}px;color:#000;">${event.venue.name}</div></div>
                <div><div style="font-size:${format === 'square' ? 8 : 9}px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.35);">Address</div><div style="font-family:'Bebas Neue',sans-serif;font-size:${format === 'square' ? 15 : 18}px;color:#000;">${event.venue.address.street}</div></div>
              </div>
            </div>
            <div style="width:1px;border-left:2px dashed #ddd;margin:0 14px;position:relative;">
              <div style="position:absolute;width:20px;height:20px;background:#000;border-radius:50%;left:50%;top:-10px;transform:translateX(-50%);"></div>
              <div style="position:absolute;width:20px;height:20px;background:#000;border-radius:50%;left:50%;bottom:-10px;transform:translateX(-50%);"></div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:70px;">
              <div style="font-family:'Bebas Neue',sans-serif;font-size:${format === 'square' ? 30 : 36}px;color:#000;line-height:1;">$${event.ticketing.advancePrice}</div>
              <div style="font-size:8px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(0,0,0,0.4);">Advance</div>
            </div>
          </div>
          <img src="white-oval-transparent.png" style="width:${format === 'square' ? 32 : 40}px;opacity:0.2;filter:none;">
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'poster-offscreen';
    wrapper.innerHTML = posterHTML;
    document.body.appendChild(wrapper);
    return wrapper;
  }

  async function exportPoster(format, type) {
    const wrapper = buildPoster(format);
    const el = wrapper.firstElementChild;
    const f = FORMATS[format];

    await new Promise(r => setTimeout(r, 200));

    try {
      const canvas = await html2canvas(el, {
        width: f.w,
        height: f.h,
        scale: 1,
        useCORS: true,
        backgroundColor: '#000000'
      });

      if (type === 'pdf') {
        const { jsPDF } = window.jspdf;
        const orientation = f.w > f.h ? 'landscape' : 'portrait';
        const pdf = new jsPDF({ orientation, unit: 'px', format: [f.w, f.h] });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, f.w, f.h);
        pdf.save(`artist-spotlight-${format}.pdf`);
      } else {
        const link = document.createElement('a');
        link.download = `artist-spotlight-${format}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.92);
        link.click();
      }
    } finally {
      wrapper.remove();
    }
  }

  document.querySelectorAll('.export-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const format = btn.dataset.format;
      const type = btn.dataset.type;
      btn.classList.add('generating');
      btn.textContent = '...';
      try {
        await exportPoster(format, type);
      } catch (e) {
        console.error('Export failed:', e);
      }
      btn.classList.remove('generating');
      btn.textContent = type.toUpperCase();
    });
  });

})();
