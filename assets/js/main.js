/* ==========================================================================
   MODELO BASE ODONTOLÓGICO «ARCO» — MOTOR PRINCIPAL (assets/js/main.js)
   22 Módulos isolados em try/catch · Agendador único rAF (Ticker) · CAPS reativo
   Leitura viva de config.js e profiles.js · Modo Vendedor (?vendedor=1) · Debug (?debug=1)
   ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================================
     UTILITÁRIOS GLOBAIS SEGUROS (Storage, Saneamento, Analytics, Haptics)
     ========================================================================== */
  window.dataLayer = window.dataLayer || [];
  const debugErrors = [];

  function logModuleError(modName, err) {
    const msg = `[Arco:${modName}] ${err && err.message ? err.message : String(err)}`;
    debugErrors.push(msg);
    if (window.console && console.warn) console.warn(msg, err);
  }

  function runSafe(modName, fn) {
    try {
      return fn();
    } catch (err) {
      logModuleError(modName, err);
      return null;
    }
  }

  function safeStorageGet(type, key) {
    try {
      const s = type === 'session' ? window.sessionStorage : window.localStorage;
      return s ? s.getItem(key) : null;
    } catch (e) {
      return null;
    }
  }

  function safeStorageSet(type, key, val) {
    try {
      const s = type === 'session' ? window.sessionStorage : window.localStorage;
      if (s) s.setItem(key, val);
    } catch (e) {}
  }

  function triggerHaptic() {
    try {
      if (navigator.vibrate) navigator.vibrate(8);
    } catch (e) {}
  }

  function sanitizeText(val, maxLen = 140) {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/<[^>]*>/g, '')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .trim()
      .slice(0, maxLen);
  }

  function sanitizeDigits(val, maxLen = 15) {
    return String(val || '').replace(/\D/g, '').slice(0, maxLen);
  }

  function sanitizeHandle(val) {
    const clean = String(val || '').replace(/[^A-Za-z0-9._]/g, '').slice(0, 40);
    return clean ? `@${clean}` : '';
  }

  function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
  }

  /* Analytics opcional após consentimento de cookies (Seção 15.3) */
  let analyticsInitialized = false;
  function initAnalyticsIfAllowed(cfg) {
    if (analyticsInitialized || !cfg || !cfg.analytics) return;
    if (!safeStorageGet('local', 'arco_lgpd_cookies_ok')) return;
    const gtmId = sanitizeText(cfg.analytics.gtmId, 24);
    const pixelId = sanitizeText(cfg.analytics.metaPixelId, 24);
    if (gtmId && /^GTM-[A-Z0-9]+$/i.test(gtmId)) {
      analyticsInitialized = true;
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
      document.head.appendChild(s);
    }
    if (pixelId && /^\d+$/.test(pixelId)) {
      analyticsInitialized = true;
    }
  }

  function trackConversion(eventName, eventParams = {}) {
    try {
      window.dataLayer.push({ event: eventName, ...eventParams });
      if (typeof window.gtag === 'function') window.gtag('event', eventName, eventParams);
      if (typeof window.fbq === 'function') window.fbq('trackCustom', eventName, eventParams);
    } catch (e) {}
  }

  /* ==========================================================================
     OBJETO DE CAPACIDADES REATIVO (`CAPS` — Seção 15.3 e 11)
     ========================================================================== */
  const CAPS = {
    reducedMotion: false,
    finePointer: false,
    coarseOrMobile: false,
    saveData: false,
    lowEnd: false,
    listeners: new Set(),
    init() {
      const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      const mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
      const mqMob = window.matchMedia('(max-width: 1023px), (pointer: coarse)');

      const update = () => {
        this.reducedMotion = mqReduce.matches;
        this.finePointer = mqFine.matches;
        this.coarseOrMobile = mqMob.matches;
        this.saveData = Boolean(navigator.connection && navigator.connection.saveData);
        this.lowEnd = Boolean(
          this.saveData ||
          (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
          (navigator.deviceMemory && navigator.deviceMemory <= 4)
        );
        document.documentElement.classList.toggle('is-low-end', this.lowEnd);
        document.documentElement.classList.toggle('is-reduced-motion', this.reducedMotion);
        this.listeners.forEach(fn => {
          try { fn(this); } catch (e) {}
        });
      };

      update();
      [mqReduce, mqFine, mqMob].forEach(mq => {
        if (mq.addEventListener) mq.addEventListener('change', update);
        else if (mq.addListener) mq.addListener(update);
      });
    },
    onChange(fn) {
      this.listeners.add(fn);
    }
  };

  /* ==========================================================================
     AGENDADOR ÚNICO `Ticker` (Um único requestAnimationFrame — Seção 15.3)
     ========================================================================== */
  const Ticker = {
    tasks: new Map(),
    running: false,
    fps: 60,
    _frames: 0,
    _lastFpsTime: performance.now(),
    add(name, fn) {
      this.tasks.set(name, fn);
      this.wake();
    },
    remove(name) {
      this.tasks.delete(name);
    },
    wake() {
      if (!this.running && !document.hidden && this.tasks.size > 0) {
        this.running = true;
        requestAnimationFrame( now => this.loop(now) );
      }
    },
    loop(now) {
      if (document.hidden || this.tasks.size === 0) {
        this.running = false;
        return;
      }
      this._frames++;
      if (now - this._lastFpsTime >= 1000) {
        this.fps = Math.round((this._frames * 1000) / (now - this._lastFpsTime));
        this._frames = 0;
        this._lastFpsTime = now;
      }
      let keepAlive = false;
      this.tasks.forEach((fn, key) => {
        try {
          const active = fn(now);
          if (active) keepAlive = true;
        } catch (err) {
          logModuleError(`Ticker:${key}`, err);
        }
      });
      if (keepAlive) {
        requestAnimationFrame( nextNow => this.loop(nextNow) );
      } else {
        this.running = false;
      }
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) Ticker.wake();
  });

  /* ==========================================================================
     ESTADO COMPARTILHADO E CADEIA DE CONTATO (Seção 13.2)
     ========================================================================== */
  const DEFAULT_CONFIG = JSON.parse(JSON.stringify(window.SITE_CONFIG || {}));
  let activeConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  let activeProfileKey = activeConfig.profile || 'geral';

  const IMAGE_FILES = {
    'T-01': { base: 'assets/trat-exame-v1', alt: 'Exame clínico odontológico cuidadoso com espelho e sonda' },
    'T-02': { base: 'assets/trat-prevencao-v1', alt: 'Prevenção e profilaxia com escova macia e fio dental sobre pedra verde' },
    'T-03': { base: 'assets/trat-estetica-v1', alt: 'Planejamento estético com escala de tons dentais naturais' },
    'T-04': { base: 'assets/trat-implante-v1', alt: 'Modelo anatômico dental com implante de titânio e pilar de precisão' },
    'T-05': { base: 'assets/trat-orto-v1', alt: 'Alinhadores ortodônticos transparentes em estojo sobre mármore claro' },
    'T-06': { base: 'assets/trat-radiografia-v1', alt: 'Radiografia panorâmica odontológica digital em monitor clínico' }
  };

  function getContactChain(customMessage) {
    const waDigits = sanitizeDigits(activeConfig.contact && activeConfig.contact.whatsapp);
    const igHandle = sanitizeHandle(activeConfig.contact && activeConfig.contact.instagram).replace(/^@/, '');
    const email = sanitizeText(activeConfig.contact && activeConfig.contact.email, 80);
    const brandName = sanitizeText(activeConfig.brand && activeConfig.brand.name, 60) || 'Arco Odontologia';
    const msg = customMessage || `Olá! Vim pelo site da ${brandName} e gostaria de agendar uma consulta.`;

    if (waDigits.length >= 10) {
      return {
        type: 'whatsapp',
        url: `https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`,
        label: 'Agendar pelo WhatsApp',
        shortLabel: 'WhatsApp',
        modalAction: 'Abrir conversa no WhatsApp',
        icon: '#icon-whatsapp'
      };
    }
    if (igHandle) {
      return {
        type: 'instagram',
        url: `https://ig.me/m/${encodeURIComponent(igHandle)}`,
        label: 'Agendar pelo Instagram',
        shortLabel: 'Instagram',
        modalAction: 'Abrir Direct do Instagram',
        icon: '#icon-instagram'
      };
    }
    if (email) {
      return {
        type: 'mailto',
        url: `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Agendamento — ' + brandName)}&body=${encodeURIComponent(msg)}`,
        label: 'Agendar por E-mail',
        shortLabel: 'E-mail',
        modalAction: 'Enviar por E-mail',
        icon: '#icon-mail'
      };
    }
    return {
      type: 'anchor',
      url: '#agendar',
      label: 'Agendar atendimento',
      shortLabel: 'Agendar',
      modalAction: 'Ir para o formulário',
      icon: '#icon-arrow-right'
    };
  }

  function buildWhatsAppUrl(customMessage) {
    return getContactChain(customMessage).url;
  }

  /* ==========================================================================
     MÓDULO 1 — RichTitle (`setRichTitle` — Seção 3.4 Bug 3 e Seção 6)
     Monta máscaras por palavra, mantém espaços reais como nós de texto e desenha arco no *itálico*
     ========================================================================== */
  const RichTitle = {
    registry: new Map(),
    set(el, rawMarkup) {
      if (!el || typeof rawMarkup !== 'string') return;
      this.registry.set(el, rawMarkup);
      this.render(el, rawMarkup);
    },
    render(el, rawMarkup) {
      while (el.firstChild) el.removeChild(el.firstChild);
      // Separa segmentos mantendo asteriscos de *palavra-chave*
      const tokens = [];
      const regex = /\*([^*]+)\*([^\s*]*)|(\S+)/g;
      let match;
      while ((match = regex.exec(rawMarkup)) !== null) {
        if (match[1] !== undefined) {
          tokens.push({ text: match[1], italic: true, suffix: match[2] || '' });
        } else if (match[3] !== undefined) {
          match[2] = match[3];
          // Verifica se contém *palavra* com pontuação colada como *sorriso*.
          const subMatch = match[2].match(/^\*([^*]+)\*(.*)$/);
          if (subMatch) {
            tokens.push({ text: subMatch[1], italic: true, suffix: subMatch[2] || '' });
          } else {
            tokens.push({ text: match[2], italic: false });
          }
        }
      }

      tokens.forEach((tok, idx) => {
        const mask = document.createElement('span');
        mask.className = 'reveal-title-mask';
        const inner = document.createElement('span');
        inner.className = 'reveal-title-inner';
        inner.style.setProperty('--stagger', String(idx));

        if (tok.italic) {
          const em = document.createElement('em');
          em.textContent = tok.text;
          const svgNS = 'http://www.w3.org/2000/svg';
          const svg = document.createElementNS(svgNS, 'svg');
          svg.setAttribute('class', 'italic-arc');
          svg.setAttribute('viewBox', '0 0 120 14');
          svg.setAttribute('preserveAspectRatio', 'none');
          svg.setAttribute('aria-hidden', 'true');
          const path = document.createElementNS(svgNS, 'path');
          path.setAttribute('pathLength', '1');
          path.setAttribute('d', 'M3 4 Q60 14 117 3');
          svg.appendChild(path);
          em.appendChild(svg);
          inner.appendChild(em);
          if (tok.suffix) {
            inner.appendChild(document.createTextNode(tok.suffix));
          }
        } else {
          inner.textContent = tok.text;
        }

        mask.appendChild(inner);
        el.appendChild(mask);
        // Espaço real como nó de texto entre palavras (Bug 3 corrigido)
        if (idx < tokens.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });
    },
    refreshAll() {
      this.registry.forEach((markup, el) => {
        if (document.body.contains(el)) this.render(el, markup);
      });
    }
  };

  /* ==========================================================================
     MÓDULO 2 — Config (Leitura de config.js + Parâmetros de URL + Metadados + JSON-LD)
     ========================================================================== */
  const Config = {
    applyUrlOverrides() {
      const params = new URLSearchParams(window.location.search);
      const pPerfil = sanitizeText(params.get('perfil'), 24).toLowerCase();
      if (pPerfil && window.SITE_PROFILES && window.SITE_PROFILES[pPerfil]) {
        activeConfig.profile = pPerfil;
      } else if (params.has('perfil')) {
        activeConfig.profile = 'geral';
      }
      const pVar = sanitizeText(params.get('variante'), 16).toLowerCase();
      if (['dupla', 'ele', 'ela'].includes(pVar)) {
        activeConfig.heroVariant = pVar;
      }
      if (params.has('clinica')) {
        const c = sanitizeText(params.get('clinica'), 40);
        if (c) {
          activeConfig.brand.name = c;
          activeConfig.brand.short = c.split(' ')[0].slice(0, 18);
        }
      }
      if (params.has('cidade')) {
        const cid = sanitizeText(params.get('cidade'), 36);
        if (cid) activeConfig.location.city = cid;
      }
      if (params.has('uf')) {
        const uf = sanitizeText(params.get('uf'), 4).toUpperCase();
        if (uf) activeConfig.location.uf = uf;
      }
      if (params.has('wa')) {
        const wa = sanitizeDigits(params.get('wa'), 15);
        activeConfig.contact.whatsapp = wa;
        if (wa.length >= 12 && wa.startsWith('55')) {
          const ddd = wa.slice(2, 4);
          const rest = wa.slice(4);
          activeConfig.contact.phoneDisplay = rest.length === 9
            ? `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
            : `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
        } else if (!wa) {
          activeConfig.contact.phoneDisplay = '';
        }
      }
      if (params.has('ig')) {
        activeConfig.contact.instagram = sanitizeHandle(params.get('ig'));
      }
      if (params.has('titular')) {
        const tit = sanitizeText(params.get('titular'), 40);
        if (tit) activeConfig.owner.name = tit;
      }
      activeProfileKey = (window.SITE_PROFILES && window.SITE_PROFILES[activeConfig.profile])
        ? activeConfig.profile
        : 'geral';
    },

    renderDOM() {
      const cfg = activeConfig;
      const cityUf = [cfg.location.city, cfg.location.uf].filter(Boolean).join(' – ');

      // 1. data-config text bindings (somente textContent — Seção 13.2)
      document.querySelectorAll('[data-config]').forEach(el => {
        const key = el.getAttribute('data-config');
        if (key === 'location.cityUf') {
          el.textContent = cityUf;
          return;
        }
        if (key === 'owner.fullIdentity') {
          const parts = [
            `${cfg.owner.title || ''} ${cfg.owner.name || ''}`.trim(),
            cfg.owner.profession || '',
            cfg.owner.cro || ''
          ].filter(Boolean);
          el.textContent = parts.join(' · ');
          return;
        }
        const val = getNestedValue(cfg, key);
        if (val !== undefined && val !== null) {
          el.textContent = sanitizeText(val, 180);
        }
      });

      // 2. data-show-if visibility bindings (some sem deixar buraco — Seção 13.2)
      document.querySelectorAll('[data-show-if]').forEach(el => {
        const path = el.getAttribute('data-show-if');
        let val = getNestedValue(cfg, path);
        if (path === 'hours') {
          val = cfg.hours && cfg.hours.week && Object.values(cfg.hours.week).some(Boolean);
        }
        const hasVal = Array.isArray(val) ? val.length > 0 : Boolean(val && String(val).trim() !== '');
        el.hidden = !hasVal;
      });

      // 3. Cadeia de links data-config-href (wa | instagram | maps | mailto | tel)
      const chain = getContactChain();
      const igHandleClean = sanitizeHandle(cfg.contact && cfg.contact.instagram).replace(/^@/, '');
      const igUrl = igHandleClean ? `https://www.instagram.com/${encodeURIComponent(igHandleClean)}/` : '#contato';
      const mapsQ = encodeURIComponent((cfg.location && cfg.location.mapsQuery) || (cfg.location && cfg.location.address) || '');
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQ}`;
      const mailUrl = cfg.contact && cfg.contact.email ? `mailto:${encodeURIComponent(cfg.contact.email)}` : '#agendar';
      const telDigits = sanitizeDigits(cfg.contact && cfg.contact.whatsapp);
      const telUrl = telDigits ? `tel:+${telDigits}` : '#contato';

      document.querySelectorAll('[data-config-href]').forEach(link => {
        const type = link.getAttribute('data-config-href');
        const customText = link.getAttribute('data-wa-text') || '';
        if (type === 'wa') {
          const c = getContactChain(customText);
          link.setAttribute('href', c.url);
          if (c.url.startsWith('http')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          } else {
            link.removeAttribute('target');
          }
          // Atualiza rótulo se o botão acompanhar a cadeia de contato
          link.querySelectorAll('[data-chain-label]').forEach(sp => {
            sp.textContent = c.label;
          });
          link.querySelectorAll('[data-chain-short]').forEach(sp => {
            sp.textContent = c.shortLabel;
          });
          const useEl = link.querySelector('svg use[data-chain-icon]');
          if (useEl) useEl.setAttribute('href', c.icon);
        } else if (type === 'instagram') {
          link.setAttribute('href', igUrl);
        } else if (type === 'maps') {
          link.setAttribute('href', mapsUrl);
        } else if (type === 'mailto') {
          link.setAttribute('href', mailUrl);
        } else if (type === 'tel') {
          link.setAttribute('href', telUrl);
        }
      });

      // 4. Variante da Hero (dupla | ele | ela — Seção 10.5 e 14.2)
      const variant = ['dupla', 'ele', 'ela'].includes(cfg.heroVariant) ? cfg.heroVariant : 'dupla';
      const heroBase = `assets/hero-cena-${variant}-v1`;
      const heroAvif = document.getElementById('hero-scene-source-avif');
      const heroWebp = document.getElementById('hero-scene-source-webp');
      const heroImg = document.getElementById('hero-scene-img');
      if (heroAvif) {
        heroAvif.setAttribute('srcset', `${heroBase}-480w.avif 480w, ${heroBase}-720w.avif 720w, ${heroBase}-960w.avif 960w, ${heroBase}-1280w.avif 1280w, ${heroBase}-1600w.avif 1600w`);
      }
      if (heroWebp) {
        heroWebp.setAttribute('srcset', `${heroBase}-480w.webp 480w, ${heroBase}-720w.webp 720w, ${heroBase}-960w.webp 960w, ${heroBase}-1280w.webp 1280w, ${heroBase}-1600w.webp 1600w`);
      }
      if (heroImg) {
        heroImg.setAttribute('src', `${heroBase}.jpg`);
        heroImg.setAttribute('srcset', `${heroBase}-480w.jpg 480w, ${heroBase}-720w.jpg 720w, ${heroBase}-960w.jpg 960w, ${heroBase}-1280w.jpg 1280w, ${heroBase}-1600w.jpg 1600w`);
      }
      const cutoutImg = document.getElementById('hero-cutout-img');
      const heroStage = document.getElementById('hero-stage');
      if (cutoutImg && heroStage) {
        if (cfg.features && cfg.features.popoutCutout === true) {
          heroStage.classList.remove('is-contained');
        } else {
          heroStage.classList.add('is-contained');
        }
        cutoutImg.onerror = () => {
          heroStage.classList.add('is-contained');
        };
        cutoutImg.src = `assets/hero-recorte-${variant}-v1.webp`;
      }

      // 5. Equipe dinâmica (0 a 3 pessoas — Seção 9.7 e 13.1)
      this.renderTeam();

      // 6. Tabela de horários em Contato (Seção 9.12)
      this.renderHoursTable();

      // 7. Demo Mode & Robots noindex (Seção 13.2 e 15.6)
      const demoBanner = document.getElementById('footer-demo-banner');
      if (demoBanner) demoBanner.hidden = !cfg.demoMode;
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) {
        metaRobots.setAttribute('content', cfg.demoMode ? 'noindex, nofollow' : 'index, follow');
      }

      // 8. Metadados e JSON-LD Dentist vivos (Seção 13.2 e 15.6)
      this.updateSeoAndJsonLd();
      initAnalyticsIfAllowed(cfg);
    },

    renderTeam() {
      const teamSec = document.getElementById('equipe');
      const teamGrid = document.getElementById('team-carousel');
      const teamDots = document.getElementById('team-dots');
      const navTeamLinks = document.querySelectorAll('a[href="#equipe"]');
      const members = Array.isArray(activeConfig.team) ? activeConfig.team.slice(0, 3) : [];

      if (members.length === 0) {
        if (teamSec) teamSec.hidden = true;
        navTeamLinks.forEach(l => { l.hidden = true; });
        return;
      }

      if (teamSec) teamSec.hidden = false;
      navTeamLinks.forEach(l => { l.hidden = false; });
      if (!teamGrid) return;

      teamGrid.setAttribute('data-count', String(members.length));
      while (teamGrid.firstChild) teamGrid.removeChild(teamGrid.firstChild);
      if (teamDots) {
        while (teamDots.firstChild) teamDots.removeChild(teamDots.firstChild);
      }

      const delays = [0, 120, 60];
      members.forEach((m, idx) => {
        const photoBase = sanitizeText(m.photo || `equipe-0${idx + 1}`, 30);
        const fullName = `${sanitizeText(m.title, 12)} ${sanitizeText(m.name, 40)}`.trim();
        const role = sanitizeText(m.role, 70);
        const cro = sanitizeText(m.cro, 28);
        const bio = sanitizeText((m.bio || '').replace('// CONFIRMAR COM O PROFISSIONAL', ''), 200);

        const article = document.createElement('article');
        article.className = 'team-card';
        article.style.setProperty('--team-delay', `${delays[idx] || 0}ms`);

        const fig = document.createElement('figure');
        fig.className = 'frame-capsule reveal-curtain-capsule';
        fig.setAttribute('tabindex', '0');
        fig.setAttribute('data-cursor-mode', 'Ver');

        const pic = document.createElement('picture');
        const sAvif = document.createElement('source');
        sAvif.type = 'image/avif';
        sAvif.srcset = `assets/${photoBase}-v1-480w.avif 480w, assets/${photoBase}-v1-720w.avif 720w, assets/${photoBase}-v1-960w.avif 960w`;
        sAvif.sizes = '(max-width: 1023px) 78vw, 360px';

        const sWebp = document.createElement('source');
        sWebp.type = 'image/webp';
        sWebp.srcset = `assets/${photoBase}-v1-480w.webp 480w, assets/${photoBase}-v1-720w.webp 720w, assets/${photoBase}-v1-960w.webp 960w`;
        sWebp.sizes = '(max-width: 1023px) 78vw, 360px';

        const img = document.createElement('img');
        img.src = `assets/${photoBase}-v1.jpg`;
        img.srcset = `assets/${photoBase}-v1-480w.jpg 480w, assets/${photoBase}-v1-720w.jpg 720w, assets/${photoBase}-v1-960w.jpg 960w`;
        img.sizes = '(max-width: 1023px) 78vw, 360px';
        img.width = 900;
        img.height = 1200;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = `${fullName} — ${role}`;

        pic.appendChild(sAvif);
        pic.appendChild(sWebp);
        pic.appendChild(img);
        fig.appendChild(pic);

        const glass = document.createElement('figcaption');
        glass.className = 'frame-capsule__glass';
        if (cro) {
          const croSpan = document.createElement('span');
          croSpan.className = 'team-card__glass-cro';
          croSpan.textContent = cro;
          glass.appendChild(croSpan);
        }
        const gName = document.createElement('strong');
        gName.className = 'team-card__glass-name';
        gName.textContent = fullName;
        glass.appendChild(gName);
        if (bio) {
          const gBio = document.createElement('p');
          gBio.className = 'team-card__glass-bio';
          gBio.textContent = bio;
          glass.appendChild(gBio);
        }
        fig.appendChild(glass);
        article.appendChild(fig);

        const meta = document.createElement('div');
        meta.className = 'team-card__meta';
        const h3 = document.createElement('h3');
        h3.className = 'team-card__name';
        h3.textContent = fullName;
        const pRole = document.createElement('p');
        pRole.className = 'team-card__role';
        pRole.textContent = role;
        meta.appendChild(h3);
        meta.appendChild(pRole);
        article.appendChild(meta);

        teamGrid.appendChild(article);

        if (teamDots) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = `team-dot${idx === 0 ? ' is-active' : ''}`;
          dot.setAttribute('data-team-dot', String(idx));
          dot.setAttribute('aria-label', `Ver profissional ${idx + 1}`);
          dot.innerHTML = '<svg viewBox="0 0 28 12" aria-hidden="true"><path d="M2 3 Q14 11 26 3"/></svg>';
          teamDots.appendChild(dot);
        }
      });
    },

    renderHoursTable() {
      const tbody = document.getElementById('hours-table-body');
      if (!tbody) return;
      while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
      const hrs = activeConfig.hours && activeConfig.hours.week;
      if (!hrs) return;

      const dayNames = [
        { key: 'mon', label: 'Segunda-feira', jsDay: 1 },
        { key: 'tue', label: 'Terça-feira', jsDay: 2 },
        { key: 'wed', label: 'Quarta-feira', jsDay: 3 },
        { key: 'thu', label: 'Quinta-feira', jsDay: 4 },
        { key: 'fri', label: 'Sexta-feira', jsDay: 5 },
        { key: 'sat', label: 'Sábado', jsDay: 6 },
        { key: 'sun', label: 'Domingo', jsDay: 0 }
      ];

      let currentDay = new Date().getDay();
      try {
        const tz = (activeConfig.hours && activeConfig.hours.timezone) || 'America/Sao_Paulo';
        const shortWeekday = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(new Date());
        const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        if (map[shortWeekday] !== undefined) currentDay = map[shortWeekday];
      } catch (e) {}

      dayNames.forEach((d, idx) => {
        const tr = document.createElement('tr');
        tr.style.setProperty('--row-idx', String(idx));
        if (d.jsDay === currentDay) tr.className = 'is-today';
        const tdDay = document.createElement('td');
        tdDay.textContent = d.label;
        const tdTime = document.createElement('td');
        const range = hrs[d.key];
        tdTime.textContent = Array.isArray(range) && range.length === 2 ? `${range[0]} às ${range[1]}` : 'Fechado';
        tr.appendChild(tdDay);
        tr.appendChild(tdTime);
        tbody.appendChild(tr);
      });
    },

    updateSeoAndJsonLd() {
      const cfg = activeConfig;
      const prof = (window.SITE_PROFILES && window.SITE_PROFILES[activeProfileKey]) || window.SITE_PROFILES.geral;
      const brand = sanitizeText(cfg.brand && cfg.brand.name, 60) || 'Arco Odontologia';
      const city = [cfg.location && cfg.location.city, cfg.location && cfg.location.uf].filter(Boolean).join(' – ');

      const rawTitle = (prof && prof.seo && prof.seo.title) || '{brand} | Dentista em {city}';
      const rawDesc = (prof && prof.seo && prof.seo.description) || '';
      const finalTitle = rawTitle.replace('{brand}', brand).replace('{city}', city);
      const finalDesc = rawDesc.replace('{brand}', brand).replace('{city}', city).slice(0, 155);

      document.title = finalTitle;
      const setMeta = (sel, val) => {
        const m = document.querySelector(sel);
        if (m && val) m.setAttribute('content', val);
      };
      setMeta('meta[name="description"]', finalDesc);
      setMeta('meta[property="og:site_name"]', brand);
      setMeta('meta[property="og:title"]', finalTitle);
      setMeta('meta[property="og:description"]', finalDesc);
      setMeta('meta[name="twitter:title"]', finalTitle);
      setMeta('meta[name="twitter:description"]', finalDesc);

      const schemaEl = document.getElementById('schema-dentist');
      if (schemaEl) {
        const schema = {
          '@context': 'https://schema.org',
          '@type': 'Dentist',
          name: brand,
          description: finalDesc,
          image: 'assets/og-image.jpg'
        };
        if (cfg.location && cfg.location.address) {
          schema.address = {
            '@type': 'PostalAddress',
            streetAddress: cfg.location.address,
            addressLocality: cfg.location.city || '',
            addressRegion: cfg.location.uf || '',
            postalCode: cfg.location.cep || '',
            addressCountry: 'BR'
          };
        }
        const wa = sanitizeDigits(cfg.contact && cfg.contact.whatsapp);
        if (wa.length >= 10) schema.telephone = `+${wa}`;
        if (cfg.contact && cfg.contact.email) schema.email = cfg.contact.email;
        const ig = sanitizeHandle(cfg.contact && cfg.contact.instagram).replace(/^@/, '');
        if (ig) schema.sameAs = [`https://www.instagram.com/${ig}/`];
        schemaEl.textContent = JSON.stringify(schema, null, 2);
      }
    }
  };

  /* ==========================================================================
     MÓDULO 3 — Profile (Renderiza o perfil ativo de profiles.js sem recarregar layout)
     ========================================================================== */
  const Profile = {
    apply(profileKey) {
      const profiles = window.SITE_PROFILES || {};
      const key = profiles[profileKey] ? profileKey : 'geral';
      activeProfileKey = key;
      activeConfig.profile = key;
      const p = profiles[key];
      if (!p) return;

      // 1. Palavra gigante da Hero (L3)
      const heroWord = sanitizeText((activeConfig.brand && activeConfig.brand.heroWord) || (p.hero && p.hero.word) || 'arco', 18);
      const wordEl = document.getElementById('hero-layer-word');
      if (wordEl) {
        while (wordEl.firstChild) wordEl.removeChild(wordEl.firstChild);
        Array.from(heroWord).forEach(ch => {
          const sp = document.createElement('span');
          sp.className = 'hero-word-char';
          sp.textContent = ch;
          wordEl.appendChild(sp);
        });
      }

      // 2. Títulos e textos de perfil (data-profile)
      const heroTitleEl = document.getElementById('hero-title');
      if (heroTitleEl && p.hero && p.hero.title) {
        RichTitle.set(heroTitleEl, p.hero.title);
      }
      const heroSubEl = document.getElementById('hero-sub');
      if (heroSubEl && p.hero && p.hero.sub) {
        heroSubEl.textContent = p.hero.sub;
      }

      // Botão B3 da Hero
      const heroB3 = document.getElementById('hero-b3-btn');
      const heroB3Text = document.getElementById('hero-b3-text');
      if (heroB3 && p.hero && p.hero.b3) {
        heroB3.setAttribute('href', p.hero.b3.target || '#destaque');
        if (heroB3Text) heroB3Text.textContent = p.hero.b3.label;
      }

      // Chips da Hero
      const chipsList = document.getElementById('hero-chips');
      if (chipsList && Array.isArray(p.hero && p.hero.chips)) {
        while (chipsList.firstChild) chipsList.removeChild(chipsList.firstChild);
        p.hero.chips.forEach((chipText, idx) => {
          const li = document.createElement('li');
          li.className = 'hero__chip';
          li.style.setProperty('--chip-idx', String(idx));
          li.textContent = chipText;
          chipsList.appendChild(li);
        });
      }

      // 3. Faixa (Marquee) separada por amostras da escala de tons (Seção 9.3)
      this.renderMarquee(p.marquee || []);

      // 4. Tratamentos (6 serviços + painel sticky M3)
      Services.renderList(p.services || []);

      // 5. Em Destaque (#destaque)
      if (p.featured) {
        const featEyebrow = document.getElementById('featured-eyebrow');
        const featTitle = document.getElementById('featured-title');
        const featText = document.getElementById('featured-text');
        const featCta = document.getElementById('featured-cta');
        const featCase = document.getElementById('featured-case-label');
        if (featEyebrow) featEyebrow.textContent = p.featured.eyebrow || 'Em destaque';
        if (featTitle) RichTitle.set(featTitle, p.featured.title || '');
        if (featText) featText.textContent = p.featured.text || '';
        if (featCta) {
          const cSpan = featCta.querySelector('[data-featured-cta-text]');
          if (cSpan) cSpan.textContent = p.featured.cta || 'Quero saber mais';
          featCta.setAttribute('data-select-triage', p.featured.triage || '');
        }
        if (featCase) featCase.textContent = p.featured.caseLabel || 'Caso ilustrativo';
      }

      // 6. Jornada (#jornada — 4 momentos)
      Journey.renderNodes(p.journey || []);

      // 7. Dúvidas (#duvidas — 6 perguntas)
      Faq.renderItems(p.faq || []);

      // 8. Mini-triagem (#agendar — 5 opções)
      Triage.renderChips(p.triage || []);

      Config.updateSeoAndJsonLd();
      trackConversion('profile_view', { profile: key });
    },

    renderMarquee(items) {
      const groupA = document.getElementById('marquee-group-a');
      const groupB = document.getElementById('marquee-group-b');
      if (!groupA || !groupB) return;

      const shades = ['#C8AD84', '#D2B78E', '#DCC49C', '#E6D3B0', '#EFE3C6', '#F4EEDC', '#F7F3E6', '#FBF8EF'];

      const populateGroup = (container, isClone) => {
        while (container.firstChild) container.removeChild(container.firstChild);
        items.forEach((raw, idx) => {
          const itemSpan = document.createElement('span');
          itemSpan.className = 'marquee-item';
          // Converte *palavra* em <em>palavra</em> usando DOM seguro
          const parts = String(raw).split(/\*([^*]+)\*/g);
          parts.forEach((part, pIdx) => {
            if (pIdx % 2 === 1) {
              const em = document.createElement('em');
              em.textContent = part;
              itemSpan.appendChild(em);
            } else if (part) {
              itemSpan.appendChild(document.createTextNode(part));
            }
          });
          const swatch = document.createElement('span');
          swatch.className = 'marquee-shade-swatch';
          swatch.setAttribute('aria-hidden', 'true');
          swatch.style.setProperty('--swatch-a', shades[idx % shades.length]);
          swatch.style.setProperty('--swatch-b', shades[(idx + 2) % shades.length]);
          itemSpan.appendChild(swatch);
          container.appendChild(itemSpan);
        });
        if (isClone) container.setAttribute('aria-hidden', 'true');
      };

      populateGroup(groupA, false);
      populateGroup(groupB, true);
    }
  };

  /* ==========================================================================
     MÓDULO 4 — Intro (Preloader Arcada <= 900ms + Hero em camadas <= 2.2s/1.6s + Scanner N-5)
     ========================================================================== */
  const Intro = {
    finished: false,
    init() {
      const preloader = document.getElementById('preloader');
      const hero = document.getElementById('inicio');
      const header = document.getElementById('site-header');
      const heroScanner = document.getElementById('hero-scanner-line');

      const finishNow = () => {
        if (this.finished) return;
        this.finished = true;
        if (preloader) preloader.classList.add('is-hidden');
        if (hero) {
          hero.classList.remove('intro-active');
          hero.classList.add('hero-intro-done');
        }
        if (header) header.classList.remove('intro-pending');
      };

      const seen = safeStorageGet('session', 'arco_preloader_seen');
      if (CAPS.reducedMotion) {
        finishNow();
        return;
      }

      const preDelay = seen ? 40 : 480;
      safeStorageSet('session', 'arco_preloader_seen', '1');

      if (!seen && preloader) {
        setTimeout(() => preloader.classList.add('is-flying'), 360);
      }

      setTimeout(() => {
        if (preloader) preloader.classList.add('is-hidden');
        requestAnimationFrame(() => {
          if (hero) hero.classList.remove('intro-active');
        });
      }, preDelay);

      // N-5 Scanner de luz na janela da hero (1300-1700ms)
      setTimeout(() => {
        if (heroScanner && !CAPS.reducedMotion) {
          Scanner.trigger(heroScanner);
        }
      }, preDelay + 850);

      setTimeout(() => {
        if (header) header.classList.remove('intro-pending');
      }, preDelay + (CAPS.coarseOrMobile ? 750 : 1100));

      setTimeout(finishNow, preDelay + (CAPS.coarseOrMobile ? 1100 : 1650));

      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, finishNow, { once: true, passive: true });
      });

      const heroStage = document.getElementById('hero-stage');
      if (heroStage && heroScanner) {
        heroStage.addEventListener('pointerenter', () => Scanner.trigger(heroScanner));
      }
    }
  };

  /* Helper N-5 — Scanner de luz com intervalo mínimo de 6s */
  const Scanner = {
    lastRunMap: new WeakMap(),
    trigger(lineEl) {
      if (!lineEl || CAPS.reducedMotion) return;
      const now = performance.now();
      const last = this.lastRunMap.get(lineEl) || 0;
      if (now - last < 6000) return;
      this.lastRunMap.set(lineEl, now);
      lineEl.classList.remove('is-scanning');
      void lineEl.offsetWidth;
      lineEl.classList.add('is-scanning');
    }
  };

  /* ==========================================================================
     MÓDULO 5 — Shader (WebGL fbm com leitura de variáveis CSS via getComputedStyle — Seção 8.2)
     ========================================================================== */
  const Shader = {
    canvas: null,
    gl: null,
    prog: null,
    uRes: null,
    uTime: null,
    uMouse: null,
    uColors: {},
    inView: true,
    contextLost: false,
    startTime: performance.now(),
    lastDraw: 0,

    parseCssColorToRgb01(varName, fallback) {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      const hex = raw.startsWith('#') ? raw.slice(1) : fallback.slice(1);
      if (hex.length === 6) {
        return [
          parseInt(hex.slice(0, 2), 16) / 255,
          parseInt(hex.slice(2, 4), 16) / 255,
          parseInt(hex.slice(4, 6), 16) / 255
        ];
      }
      return [0.04, 0.16, 0.18];
    },

    init() {
      this.canvas = document.getElementById('hero-shader-canvas');
      if (!this.canvas || !activeConfig.features || !activeConfig.features.shader) return;
      if (CAPS.reducedMotion || CAPS.lowEnd) return;

      this.setupContext();
      window.addEventListener('resize', () => this.resize(), { passive: true });
      this.canvas.addEventListener('webglcontextlost', e => {
        e.preventDefault();
        this.contextLost = true;
      });
      this.canvas.addEventListener('webglcontextrestored', () => {
        this.setupContext();
      });

      const hero = document.getElementById('inicio');
      if (hero && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entries => {
          this.inView = entries[0].isIntersecting;
          if (this.inView) Ticker.wake();
        }, { threshold: 0.01 });
        obs.observe(hero);
      }

      Ticker.add('shader', now => this.tick(now));
    },

    setupContext() {
      if (!this.canvas || CAPS.reducedMotion || CAPS.lowEnd) return;
      const gl = this.canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        powerPreference: 'low-power',
        preserveDrawingBuffer: false
      });
      if (!gl) return;

      const isMob = window.innerWidth < 768;
      const oct = isMob ? 3 : 4;
      const vsSrc = 'attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }';
      const fsSrc = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
#define OCT ${oct}
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_c1, u_c2, u_c3, u_brass;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < OCT; i++){
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / max(u_res, vec2(1.0));
  vec2 p = (uv - 0.5) * vec2(u_res.x / max(u_res.y, 1.0), 1.0);
  float t = u_time * 0.03;
  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 5.2));
  float n = fbm(p * 1.1 + 1.7 * q + u_mouse * 0.12);
  vec3 col = mix(u_c1, u_c2, smoothstep(0.15, 0.7, n));
  col = mix(col, u_c3, smoothstep(0.55, 1.0, n) * 0.7);
  float beam = smoothstep(0.0, 0.55, 1.0 - abs(p.x * 0.55 + p.y * 0.4 - 0.08 + (q.x - 0.5) * 0.25) * 2.3);
  col += u_brass * beam * 0.07;
  col *= 1.0 - dot(uv - 0.5, uv - 0.5) * 0.85;
  gl_FragColor = vec4(col, 1.0);
}`;

      const compile = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          logModuleError('ShaderCompile', new Error(gl.getShaderInfoLog(s) || 'Shader compile failed'));
          gl.deleteShader(s);
          return null;
        }
        return s;
      };

      const vs = compile(gl.VERTEX_SHADER, vsSrc);
      const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
      if (!vs || !fs) return;

      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      this.gl = gl;
      this.prog = prog;
      this.uRes = gl.getUniformLocation(prog, 'u_res');
      this.uTime = gl.getUniformLocation(prog, 'u_time');
      this.uMouse = gl.getUniformLocation(prog, 'u_mouse');
      this.uColors = {
        c1: gl.getUniformLocation(prog, 'u_c1'),
        c2: gl.getUniformLocation(prog, 'u_c2'),
        c3: gl.getUniformLocation(prog, 'u_c3'),
        brass: gl.getUniformLocation(prog, 'u_brass')
      };
      this.contextLost = false;

      this.syncColorsFromCss();
      this.resize();
      gl.uniform1f(this.uTime, 0);
      gl.uniform2f(this.uMouse, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      this.canvas.classList.add('is-ready');
    },

    syncColorsFromCss() {
      if (!this.gl || !this.prog) return;
      const c1 = this.parseCssColorToRgb01('--abyss', '#0A2A2E');
      const c2 = this.parseCssColorToRgb01('--pine', '#0E3830');
      const c3 = this.parseCssColorToRgb01('--deepsea', '#0B2B45');
      const br = this.parseCssColorToRgb01('--brass-1', '#D8B46E');
      this.gl.uniform3fv(this.uColors.c1, c1);
      this.gl.uniform3fv(this.uColors.c2, c2);
      this.gl.uniform3fv(this.uColors.c3, c3);
      this.gl.uniform3fv(this.uColors.brass, br);
    },

    resize() {
      if (!this.gl || this.contextLost || !this.canvas) return;
      const isMob = window.innerWidth < 768;
      const scale = isMob ? 0.6 : Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(this.canvas.clientWidth * scale));
      const h = Math.max(1, Math.floor(this.canvas.clientHeight * scale));
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.gl.viewport(0, 0, w, h);
        this.gl.uniform2f(this.uRes, w, h);
      }
    },

    tick(now) {
      if (!this.gl || !this.inView || this.contextLost || CAPS.reducedMotion || CAPS.lowEnd) return false;
      if (now - this.lastDraw >= 33) {
        this.lastDraw = now;
        const elapsed = (now - this.startTime) * 0.001;
        this.gl.uniform1f(this.uTime, elapsed);
        this.gl.uniform2f(this.uMouse, Parallax.lerpNormX, -Parallax.lerpNormY);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      }
      return true;
    }
  };

  /* ==========================================================================
     MÓDULO 6 — Parallax & Cursor (Mouse lerp 0.08 + N-9 Moldura que desloca + Scroll)
     ========================================================================== */
  const Parallax = {
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.5,
    curX: window.innerWidth * 0.5,
    curY: window.innerHeight * 0.5,
    normX: 0,
    normY: 0,
    lerpNormX: 0,
    lerpNormY: 0,
    hasMoved: false,

    init() {
      const heroBg = document.getElementById('hero-layer-bg');
      const heroWord = document.getElementById('hero-layer-word');
      const heroWin = document.getElementById('hero-arch-wrap');
      const heroCut = document.getElementById('hero-layer-cutout');
      const heroGlow = document.getElementById('hero-layer-glow');
      const cursorEl = document.getElementById('custom-cursor');

      if (CAPS.finePointer) {
        window.addEventListener('mousemove', e => {
          if (!this.hasMoved) {
            this.hasMoved = true;
            this.curX = e.clientX;
            this.curY = e.clientY;
            if (cursorEl && activeConfig.features && activeConfig.features.cursor) {
              cursorEl.classList.add('is-moved');
            }
          }
          this.targetX = e.clientX;
          this.targetY = e.clientY;
          this.normX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
          this.normY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
          Ticker.wake();
        }, { passive: true });
      }

      // N-9: Hover com contorno deslocado que se move até 8px em direção ao ponteiro
      document.querySelectorAll('.frame-arch-wrap, .frame-chamfer, .frame-mat').forEach(frame => {
        frame.addEventListener('pointermove', e => {
          if (!CAPS.finePointer || CAPS.reducedMotion) return;
          const r = frame.getBoundingClientRect();
          const dx = ((e.clientX - (r.left + r.width * 0.5)) / Math.max(1, r.width * 0.5)) * 8;
          const dy = ((e.clientY - (r.top + r.height * 0.5)) / Math.max(1, r.height * 0.5)) * 8;
          frame.style.setProperty('--frame-dx', `${dx.toFixed(1)}px`);
          frame.style.setProperty('--frame-dy', `${dy.toFixed(1)}px`);
        }, { passive: true });

        frame.addEventListener('pointerleave', () => {
          frame.style.setProperty('--frame-dx', '0px');
          frame.style.setProperty('--frame-dy', '0px');
          if (frame.classList.contains('frame-mat') && !CAPS.reducedMotion) {
            frame.classList.add('is-breathing');
            setTimeout(() => frame.classList.remove('is-breathing'), 420);
          }
        });
      });

      Ticker.add('pointerParallax', () => {
        if (CAPS.reducedMotion || !CAPS.finePointer || !this.hasMoved) return false;
        const dxC = this.targetX - this.curX;
        const dyC = this.targetY - this.curY;
        const dxN = this.normX - this.lerpNormX;
        const dyN = this.normY - this.lerpNormY;
        const moving = Math.abs(dxC) > 0.05 || Math.abs(dyC) > 0.05 || Math.abs(dxN) > 0.002 || Math.abs(dyN) > 0.002;

        if (!moving) return false;

        this.lerpNormX += dxN * 0.08;
        this.lerpNormY += dyN * 0.08;
        this.curX += dxC * 0.22;
        this.curY += dyC * 0.22;

        if (cursorEl && activeConfig.features && activeConfig.features.cursor) {
          cursorEl.style.transform = `translate3d(${this.curX.toFixed(1)}px, ${this.curY.toFixed(1)}px, 0)`;
        }

        // Parallax oposto ao ponteiro por camada da Hero (Seção 10.5: fundo 4, palavra 10, janela 8, recorte 18, glow 24, texto 0)
        if (Shader.inView) {
          const nx = -this.lerpNormX;
          const ny = -this.lerpNormY;
          if (heroBg) {
            heroBg.style.setProperty('--par-bg-x', `${(nx * 4).toFixed(1)}px`);
            heroBg.style.setProperty('--par-bg-y', `${(ny * 4).toFixed(1)}px`);
          }
          if (heroWord) {
            heroWord.style.setProperty('--par-word-x', `${(nx * 10).toFixed(1)}px`);
            heroWord.style.setProperty('--par-word-y', `${(ny * 10).toFixed(1)}px`);
          }
          if (heroWin) {
            heroWin.style.setProperty('--par-win-x', `${(nx * 8).toFixed(1)}px`);
            heroWin.style.setProperty('--par-win-y', `${(ny * 8).toFixed(1)}px`);
          }
          if (heroCut) {
            heroCut.style.setProperty('--par-cut-x', `${(nx * 18).toFixed(1)}px`);
            heroCut.style.setProperty('--par-cut-y', `${(ny * 18).toFixed(1)}px`);
          }
          if (heroGlow) {
            heroGlow.style.setProperty('--par-glow-x', `${(nx * 24).toFixed(1)}px`);
            heroGlow.style.setProperty('--par-glow-y', `${(ny * 24).toFixed(1)}px`);
          }
        }
        return true;
      });
    }
  };

  /* ==========================================================================
     MÓDULO 7 — Atmosphere & Reveal (Fusão de atmosferas 750ms + N-10 Borda-feixe)
     ========================================================================== */
  const Atmosphere = {
    revealObs: null,
    init() {
      const navLinks = document.querySelectorAll('.nav-desktop .nav-link');

      this.revealObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            entry.target.querySelectorAll('.border-beam').forEach(b => b.classList.add('is-beaming'));
            this.revealObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.02, rootMargin: '120px 0px' });

      document.querySelectorAll('.section-block, .site-footer').forEach(sec => this.revealObs.observe(sec));

      const atmoObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const sec = entry.target;
          const bg = sec.getAttribute('data-atmo-bg');
          const txt = sec.getAttribute('data-atmo-text');
          if (bg) document.documentElement.style.setProperty('--atmo-bg', bg);
          if (txt) document.documentElement.style.setProperty('--atmo-text', txt);

          const id = sec.getAttribute('id');
          if (id) {
            navLinks.forEach(l => {
              l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`);
            });
          }
        });
      }, { rootMargin: '-38% 0px -48% 0px' });

      document.querySelectorAll('section[id]').forEach(sec => atmoObs.observe(sec));

      // Pausa animações infinitas fora da tela (Seção 15.4)
      const pauseObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
        });
      }, { rootMargin: '100px 0px' });

      document.querySelectorAll('section[id], .marquee-section, .site-footer').forEach(el => pauseObs.observe(el));
    }
  };

  /* ==========================================================================
     MÓDULO 8 — Progress & Scroll Metrics (N-2 Escala de tons + N-4 Régua + N-6 Clareia + Cortina)
     ========================================================================== */
  const Progress = {
    segments: [],
    clarifyWords: [],
    metrics: {
      winH: window.innerHeight,
      docH: 1000,
      sobreTop: 0,
      sobreH: 500,
      resultsTop: 0,
      resultsH: 800,
      journeyTop: 0,
      journeyH: 500,
      waveLen: 1000,
      footerTop: 0
    },
    lastScrollY: window.scrollY,
    waPulsed: false,

    init() {
      this.segments = Array.from(document.querySelectorAll('.shade-progress__seg'));
      this.setupClarifyParagraph();
      this.measure();

      window.addEventListener('resize', () => this.measure(), { passive: true });
      window.addEventListener('orientationchange', () => setTimeout(() => this.measure(), 150), { passive: true });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          RichTitle.refreshAll();
          this.measure();
          Services.updateLiquidIndicator();
        });
      }
      if (typeof ResizeObserver === 'function') {
        const ro = new ResizeObserver(() => this.measure());
        ro.observe(document.body);
      }

      let scrollPending = false;
      window.addEventListener('scroll', () => {
        if (!scrollPending) {
          scrollPending = true;
          requestAnimationFrame(() => {
            scrollPending = false;
            this.onScroll();
          });
        }
      }, { passive: true });

      this.onScroll();
    },

    setupClarifyParagraph() {
      const p = document.getElementById('sobre-clarify-text');
      if (!p) return;
      const text = p.textContent.trim();
      while (p.firstChild) p.removeChild(p.firstChild);
      const words = text.split(/\s+/);
      this.clarifyWords = words.map((w, i) => {
        const sp = document.createElement('span');
        sp.className = 'clarify-word';
        sp.textContent = w;
        sp.style.setProperty('--w-op', '0.28');
        p.appendChild(sp);
        if (i < words.length - 1) p.appendChild(document.createTextNode(' '));
        return sp;
      });
    },

    measure() {
      const sy = window.scrollY;
      this.metrics.winH = Math.max(1, window.innerHeight);
      this.metrics.docH = Math.max(1, document.documentElement.scrollHeight - this.metrics.winH);

      const sobre = document.getElementById('sobre');
      if (sobre) {
        const r = sobre.getBoundingClientRect();
        this.metrics.sobreTop = r.top + sy;
        this.metrics.sobreH = Math.max(1, r.height);
      }

      const res = document.getElementById('resultados');
      if (res) {
        const r = res.getBoundingClientRect();
        this.metrics.resultsTop = r.top + sy;
        this.metrics.resultsH = Math.max(1, r.height - this.metrics.winH);
      }

      const jor = document.getElementById('journey-wave-wrap');
      if (jor) {
        const r = jor.getBoundingClientRect();
        this.metrics.journeyTop = r.top + sy;
        this.metrics.journeyH = Math.max(240, r.height);
      }

      const wavePath = document.getElementById('journey-wave-progress');
      if (wavePath && wavePath.getTotalLength) {
        try { this.metrics.waveLen = wavePath.getTotalLength(); } catch (e) {}
      }

      const foot = document.getElementById('rodape');
      if (foot) {
        this.metrics.footerTop = foot.getBoundingClientRect().top + sy;
      }
    },

    onScroll() {
      const y = window.scrollY;
      const winH = this.metrics.winH;
      const prog = Math.min(1, Math.max(0, y / this.metrics.docH));

      // 1. N-2 Escala de tons de dente como progresso no header (8 segmentos)
      const litCount = Math.round(prog * this.segments.length);
      this.segments.forEach((seg, idx) => {
        const shouldLit = idx < litCount;
        const wasLit = seg.classList.contains('is-lit');
        if (shouldLit !== wasLit) {
          seg.classList.toggle('is-lit', shouldLit);
          if (shouldLit && !CAPS.reducedMotion) {
            seg.classList.add('is-popping');
            setTimeout(() => seg.classList.remove('is-popping'), 280);
          }
        }
      });

      // 2. Header e Barra Mobile escondem ao rolar para baixo e voltam ao subir (Seção 9.1 e 9.14)
      const dy = y - this.lastScrollY;
      const header = document.getElementById('site-header');
      const sheetOpen = document.getElementById('mobile-bottom-sheet')?.classList.contains('is-open');
      const headerFocused = header && header.contains(document.activeElement);

      if (header && !sheetOpen && !headerFocused) {
        header.classList.toggle('is-scrolled', y > 24);
        if (y > 140 && dy > 6) {
          header.classList.add('is-hidden-scroll');
        } else if (dy < -6 || y <= 80) {
          header.classList.remove('is-hidden-scroll');
        }
      }

      // 3. Anel de voltar ao topo e Mini-botão de WhatsApp Desktop
      const backBtn = document.getElementById('back-to-top-btn');
      const backCircle = document.getElementById('back-to-top-circle');
      const floatWa = document.getElementById('floating-wa-btn');
      if (backCircle) backCircle.style.strokeDashoffset = (1 - prog).toFixed(3);
      if (backBtn) backBtn.classList.toggle('is-visible', y > winH * 0.65);
      if (floatWa) {
        const showWa = y > winH * 0.75;
        floatWa.classList.toggle('is-visible', showWa);
        if (showWa && !this.waPulsed && !CAPS.reducedMotion) {
          this.waPulsed = true;
          floatWa.classList.add('is-pulsing');
        }
      }

      // 4. Barra Mobile e Cookies
      const cookieBar = document.getElementById('cookie-bar');
      const mobileBar = document.getElementById('mobile-app-bar');
      const cookiesOk = Boolean(safeStorageGet('local', 'arco_lgpd_cookies_ok'));
      const showCookie = !cookiesOk && y > 320 && !Form.inView;
      if (cookieBar) cookieBar.classList.toggle('is-visible', showCookie);
      if (mobileBar) {
        if (Form.inView || showCookie || (y > 180 && dy > 8)) {
          mobileBar.classList.add('is-hidden-scroll');
        } else if (dy < -8 || y <= 100) {
          mobileBar.classList.remove('is-hidden-scroll');
        }
      }
      this.lastScrollY = y;

      if (CAPS.reducedMotion) return;

      // 5. Saída da Hero em camadas (Seção 10.5)
      if (y < winH * 1.2) {
        const heroProg = Math.min(1, Math.max(0, y / winH));
        const heroCut = document.getElementById('hero-layer-cutout');
        const heroCopy = document.getElementById('hero-copy-col');
        if (heroCut) {
          heroCut.style.setProperty('--scroll-cut-scale', (1 + heroProg * 0.06).toFixed(3));
          heroCut.style.setProperty('--scroll-cut-op', (1 - heroProg * 0.35).toFixed(3));
        }
        if (heroCopy) {
          heroCopy.style.setProperty('--scroll-copy-y', `${(-heroProg * 36).toFixed(1)}px`);
        }
      }

      // 6. N-6 Texto que clareia e Parallax do mosaico em #sobre (4 / 10 / 16 px — Seção 9.4)
      const sobreRel = (y + winH * 0.65 - this.metrics.sobreTop) / this.metrics.sobreH;
      if (sobreRel >= -0.2 && sobreRel <= 1.4) {
        const cProg = Math.min(1, Math.max(0, (sobreRel - 0.05) / 0.55));
        const totalW = this.clarifyWords.length;
        this.clarifyWords.forEach((wEl, i) => {
          const wThreshold = i / Math.max(1, totalW);
          const op = Math.min(1, Math.max(0.28, 0.28 + ((cProg - wThreshold * 0.65) / 0.35) * 0.72));
          wEl.style.setProperty('--w-op', op.toFixed(2));
        });

        const mosaic = document.getElementById('sobre-mosaic');
        if (mosaic && !CAPS.coarseOrMobile) {
          const mShift = (sobreRel - 0.5) * 2;
          mosaic.style.setProperty('--par-m1', `${(mShift * -4).toFixed(1)}px`);
          mosaic.style.setProperty('--par-m2', `${(mShift * -10).toFixed(1)}px`);
          mosaic.style.setProperty('--par-m3', `${(mShift * -16).toFixed(1)}px`);
        }
      }

      // 7. Cortina guiada por scroll em #resultados (15% a 85% — Seção 9.8)
      Curtain.updateFromScroll(y, winH, this.metrics.resultsTop, this.metrics.resultsH);

      // 8. Linha em onda e fagulha brasa em #jornada (Seção 9.9)
      Journey.updateFromScroll(y, winH, this.metrics.journeyTop, this.metrics.journeyH, this.metrics.waveLen);

      // 9. N-12 Parallax lento da palavra gigante no rodapé
      if (y + winH > this.metrics.footerTop) {
        const fProg = Math.min(1, Math.max(0, (y + winH - this.metrics.footerTop) / (winH * 0.8)));
        const fWord = document.getElementById('footer-giant-word');
        if (fWord) fWord.style.setProperty('--footer-par-x', `${((fProg - 0.5) * 48).toFixed(1)}px`);
      }
    }
  };

  /* ==========================================================================
     MÓDULO 9 — Services (Abas com Indicador Líquido FLIP N-7 + Painel Sticky M3)
     ========================================================================== */
  const Services = {
    items: [],
    activeIdx: 0,
    iconPaths: {
      espelho: '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L21 21"/>',
      escova: '<path d="M4 18h16M7 18v-4h6v4M17 14v4"/>',
      dente: '<path d="M7 4c-2.5 0-4 2-4 5 0 4 2 6 3 10 .5 1.5 2 1.5 2.5 0l1.5-4 1.5 4c.5 1.5 2 1.5 2.5 0 1-4 3-6 3-10 0-3-1.5-5-4-5-1.5 0-2.5 1-3 1s-1.5-1-3-1z"/>',
      raiz: '<path d="M12 3v18M8 7c2 2 6 2 8 0M9 14c1.5 2 4.5 2 6 0"/>',
      implante: '<rect x="8" y="3" width="8" height="5" rx="1"/><path d="M9 8h6l-1 13h-4L9 8zM8 11h8M8.5 15h7"/>',
      aparelho: '<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M3 12h18M8 10v4M12 10v4M16 10v4"/>'
    },

    init() {
      const tablist = document.getElementById('services-tablist');
      if (!tablist) return;

      // Delegação de eventos para suportar troca de perfil sem duplicar listeners (Seção 13.4)
      tablist.addEventListener('click', e => {
        const btn = e.target.closest('.service-tab');
        if (!btn) return;
        const idx = Number(btn.getAttribute('data-service-idx') || 0);
        triggerHaptic();
        this.setActive(idx, true);
      });

      tablist.addEventListener('keydown', e => {
        const tabs = Array.from(tablist.querySelectorAll('.service-tab'));
        if (!tabs.length) return;
        let nextIdx = this.activeIdx;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          nextIdx = (this.activeIdx + 1) % tabs.length;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          nextIdx = (this.activeIdx - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          nextIdx = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          nextIdx = tabs.length - 1;
        } else {
          return;
        }
        this.setActive(nextIdx, true);
        if (tabs[nextIdx]) tabs[nextIdx].focus();
      });

      if (typeof ResizeObserver === 'function') {
        const ro = new ResizeObserver(() => this.updateLiquidIndicator());
        ro.observe(tablist);
      }

      // Gesto de deslizar horizontal no card do palco mobile para trocar de item (Seção 9.5)
      const stageCard = document.getElementById('service-stage-card');
      if (stageCard) {
        let startX = 0;
        stageCard.addEventListener('touchstart', e => {
          if (e.touches && e.touches[0]) startX = e.touches[0].clientX;
        }, { passive: true });
        stageCard.addEventListener('touchend', e => {
          if (!e.changedTouches || !e.changedTouches[0]) return;
          const dx = e.changedTouches[0].clientX - startX;
          if (Math.abs(dx) > 48 && this.items.length) {
            const next = dx < 0
              ? Math.min(this.items.length - 1, this.activeIdx + 1)
              : Math.max(0, this.activeIdx - 1);
            this.setActive(next, true);
          }
        }, { passive: true });
      }
    },

    renderList(services) {
      this.items = services;
      this.activeIdx = 0;
      const tablist = document.getElementById('services-tablist');
      if (!tablist) return;

      const indicator = document.getElementById('services-liquid-indicator');
      Array.from(tablist.querySelectorAll('.service-tab')).forEach(el => el.remove());

      services.forEach((srv, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `service-tab spotlight-surface${idx === 0 ? ' is-active' : ''}`;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('id', `service-tab-${idx}`);
        btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        btn.setAttribute('aria-controls', 'service-stage-card');
        btn.setAttribute('data-service-idx', String(idx));

        const tag = document.createElement('span');
        tag.className = 'service-tab__tag';
        tag.textContent = srv.tag || '';

        const head = document.createElement('div');
        head.className = 'service-tab__head';

        const h3 = document.createElement('h3');
        h3.className = 'service-tab__title';
        h3.textContent = srv.title || '';

        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('class', 'service-tab__icon');
        iconSvg.setAttribute('viewBox', '0 0 24 24');
        iconSvg.setAttribute('aria-hidden', 'true');
        iconSvg.innerHTML = this.iconPaths[srv.icon] || this.iconPaths.dente;

        head.appendChild(h3);
        head.appendChild(iconSvg);

        const body = document.createElement('div');
        body.className = 'service-tab__body';
        const inner = document.createElement('div');
        inner.className = 'service-tab__body-inner';
        const p = document.createElement('p');
        p.className = 'service-tab__text';
        p.textContent = srv.text || '';
        const more = document.createElement('span');
        more.className = 'service-tab__more';
        more.textContent = 'Saiba mais →';
        inner.appendChild(p);
        inner.appendChild(more);
        body.appendChild(inner);

        btn.appendChild(tag);
        btn.appendChild(head);
        btn.appendChild(body);
        tablist.appendChild(btn);
      });

      if (indicator && !tablist.contains(indicator)) {
        tablist.prepend(indicator);
      }
      this.updateStage(0, false);
      requestAnimationFrame(() => this.updateLiquidIndicator());
    },

    setActive(idx, animate = true) {
      if (!this.items[idx]) return;
      this.activeIdx = idx;
      const tablist = document.getElementById('services-tablist');
      if (tablist) {
        tablist.querySelectorAll('.service-tab').forEach((btn, i) => {
          const active = i === idx;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
      }
      this.updateStage(idx, animate);
      setTimeout(() => this.updateLiquidIndicator(), 40);
    },

    updateLiquidIndicator() {
      const tablist = document.getElementById('services-tablist');
      const indicator = document.getElementById('services-liquid-indicator');
      if (!tablist || !indicator || window.innerWidth < 1024) return;
      const activeBtn = tablist.querySelector(`.service-tab[data-service-idx="${this.activeIdx}"]`);
      if (!activeBtn) return;
      const top = activeBtn.offsetTop;
      const height = activeBtn.offsetHeight;
      indicator.style.setProperty('--liq-y', `${top}px`);
      indicator.style.height = `${height}px`;
    },

    updateStage(idx, animate) {
      const srv = this.items[idx];
      if (!srv) return;
      const card = document.getElementById('service-stage-card');
      const img = document.getElementById('service-stage-img');
      const sAvif = document.getElementById('service-stage-avif');
      const sWebp = document.getElementById('service-stage-webp');
      const pillIcon = document.getElementById('service-stage-icon');
      const pillTitle = document.getElementById('service-stage-pill-title');
      const desc = document.getElementById('service-stage-desc');
      const cta = document.getElementById('service-stage-cta');

      const applyData = () => {
        const imgInfo = IMAGE_FILES[srv.image] || IMAGE_FILES['T-01'];
        if (sAvif) sAvif.srcset = `${imgInfo.base}-480w.avif 480w, ${imgInfo.base}-720w.avif 720w, ${imgInfo.base}-960w.avif 960w`;
        if (sWebp) sWebp.srcset = `${imgInfo.base}-480w.webp 480w, ${imgInfo.base}-720w.webp 720w, ${imgInfo.base}-960w.webp 960w`;
        if (img) {
          img.src = `${imgInfo.base}.jpg`;
          img.srcset = `${imgInfo.base}-480w.jpg 480w, ${imgInfo.base}-720w.jpg 720w, ${imgInfo.base}-960w.jpg 960w`;
          img.alt = imgInfo.alt;
        }
        if (pillIcon) pillIcon.innerHTML = this.iconPaths[srv.icon] || this.iconPaths.dente;
        if (pillTitle) pillTitle.textContent = srv.title || '';
        if (desc) desc.textContent = srv.text || '';
        if (cta) {
          cta.setAttribute('data-select-triage', srv.title || '');
        }
      };

      if (animate && card && !CAPS.reducedMotion) {
        card.classList.add('is-switching');
        setTimeout(() => {
          applyData();
          card.classList.remove('is-switching');
        }, 180);
      } else {
        applyData();
      }
    }
  };

  /* ==========================================================================
     MÓDULO 10 — Slider (Comparador Antes/Depois M6 Lâmina + Scanner N-5 + Demo única)
     ========================================================================== */
  const Slider = {
    dragging: false,
    init() {
      const card = document.getElementById('ba-slider-a');
      const range = document.getElementById('ba-range-a');
      const scanner = document.getElementById('slider-scanner-line');
      if (!card || !range) return;

      const update = val => {
        range.value = val;
        card.style.setProperty('--ba-pos', `${val}%`);
      };

      range.addEventListener('input', e => update(e.target.value));
      card.addEventListener('pointerdown', () => { this.dragging = true; });
      window.addEventListener('pointerup', () => { this.dragging = false; }, { passive: true });

      card.addEventListener('pointerenter', () => {
        if (!this.dragging && scanner) Scanner.trigger(scanner);
      });

      if (!CAPS.reducedMotion && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries, o) => {
          if (!entries[0].isIntersecting) return;
          o.unobserve(card);
          if (scanner) Scanner.trigger(scanner);
          let touched = false;
          const stop = () => { touched = true; };
          card.addEventListener('pointerdown', stop, { once: true });
          range.addEventListener('keydown', stop, { once: true });

          setTimeout(() => { if (!touched) update(34); }, 320);
          setTimeout(() => { if (!touched) update(66); }, 780);
          setTimeout(() => { if (!touched) update(50); }, 1240);
        }, { threshold: 0.55 });
        obs.observe(card);
      }
    }
  };

  /* ==========================================================================
     MÓDULO 11 & 12 — Curtain & Loupe (Palco Sticky #resultados + Lupa 180px 2.4x)
     ========================================================================== */
  const Curtain = {
    stage: null,
    init() {
      this.stage = document.getElementById('results-curtain-stage');
    },
    updateFromScroll(y, winH, resTop, resScrollableH) {
      if (!this.stage) return;
      const raw = (y - resTop) / Math.max(1, resScrollableH);
      // Revela entre 15% e 85% da seção (Seção 9.8)
      const prog = Math.min(1, Math.max(0, (raw - 0.15) / 0.7));
      this.stage.style.setProperty('--curtain-prog', prog.toFixed(3));
      const loupeEnabled = Boolean(activeConfig.features && activeConfig.features.loupe);
      this.stage.classList.toggle('is-loupe-ready', loupeEnabled && prog >= 0.85);
    }
  };

  const Loupe = {
    x: 220,
    y: 260,
    tx: 220,
    ty: 260,
    active: false,
    init() {
      const stage = document.getElementById('results-curtain-stage');
      const loupe = document.getElementById('results-loupe');
      if (!stage || !loupe) return;

      loupe.style.backgroundImage = 'url("assets/ba-b-after-zoom-v1.webp")';

      const updateBg = () => {
        const w = stage.clientWidth || 440;
        const h = stage.clientHeight || 550;
        const zoom = 2.4;
        loupe.style.backgroundSize = `${(w * zoom).toFixed(0)}px ${(h * zoom).toFixed(0)}px`;
        const bx = -(this.x * zoom - 90);
        const by = -(this.y * zoom - 90);
        loupe.style.backgroundPosition = `${bx.toFixed(1)}px ${by.toFixed(1)}px`;
        stage.style.setProperty('--loupe-x', `${this.x.toFixed(1)}px`);
        stage.style.setProperty('--loupe-y', `${this.y.toFixed(1)}px`);
      };

      stage.addEventListener('pointermove', e => {
        if (!CAPS.finePointer) return;
        const r = stage.getBoundingClientRect();
        this.tx = Math.min(r.width, Math.max(0, e.clientX - r.left));
        this.ty = Math.min(r.height, Math.max(0, e.clientY - r.top));
        this.active = true;
        Ticker.wake();
      }, { passive: true });

      stage.addEventListener('pointerleave', () => {
        this.active = false;
      });

      // Acessível por teclado: setas movem a lupa quando o palco está focado (Seção 9.8)
      stage.addEventListener('keydown', e => {
        const step = 18;
        const w = stage.clientWidth || 440;
        const h = stage.clientHeight || 550;
        if (e.key === 'ArrowRight') { e.preventDefault(); this.tx = Math.min(w, this.tx + step); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); this.tx = Math.max(0, this.tx - step); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); this.ty = Math.min(h, this.ty + step); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); this.ty = Math.max(0, this.ty - step); }
        else return;
        this.x = this.tx;
        this.y = this.ty;
        stage.classList.add('is-loupe-ready');
        updateBg();
      });

      Ticker.add('loupe', () => {
        if (!this.active || !CAPS.finePointer) return false;
        const dx = this.tx - this.x;
        const dy = this.ty - this.y;
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return false;
        this.x += dx * 0.18;
        this.y += dy * 0.18;
        updateBg();
        return true;
      });
    }
  };

  /* ==========================================================================
     MÓDULO 13 — Journey (Onda SVG + Fagulha Brasa + Partículas <= 40 pontos)
     ========================================================================== */
  const Journey = {
    nodes: [],
    inView: false,
    particles: [],
    init() {
      const canvas = document.getElementById('jornada-particles');
      const sec = document.getElementById('jornada');
      if (!canvas || !sec || !CAPS.finePointer || CAPS.reducedMotion || CAPS.lowEnd) return;

      const ctx = canvas.getContext('2d');
      const resize = () => {
        canvas.width = sec.clientWidth;
        canvas.height = sec.clientHeight;
      };
      resize();
      window.addEventListener('resize', resize, { passive: true });

      for (let i = 0; i < 32; i++) {
        this.particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 0.8 + Math.random() * 1.4,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.08 - Math.random() * 0.18,
          alpha: 0.15 + Math.random() * 0.38
        });
      }

      const obs = new IntersectionObserver(entries => {
        this.inView = entries[0].isIntersecting;
        if (this.inView) Ticker.wake();
      }, { threshold: 0.05 });
      obs.observe(sec);

      Ticker.add('journeyParticles', () => {
        if (!this.inView || CAPS.reducedMotion || CAPS.lowEnd) return false;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        this.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) p.y = h + 10;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168, 230, 209, ${p.alpha})`;
          ctx.fill();
        });
        return true;
      });
    },

    renderNodes(journeyItems) {
      const grid = document.getElementById('journey-nodes-grid');
      if (!grid) return;
      while (grid.firstChild) grid.removeChild(grid.firstChild);
      this.nodes = journeyItems.map((item, idx) => {
        const art = document.createElement('article');
        art.className = `journey-node spotlight-surface${idx === 0 ? ' is-lit' : ''}`;
        const circle = document.createElement('div');
        circle.className = 'journey-node__circle';
        circle.setAttribute('aria-hidden', 'true');
        circle.innerHTML = `<svg viewBox="0 0 24 24">${Services.iconPaths[item.icon] || Services.iconPaths.espelho}</svg>`;
        const copy = document.createElement('div');
        const h3 = document.createElement('h3');
        h3.textContent = item.title || '';
        const p = document.createElement('p');
        p.textContent = item.text || '';
        copy.appendChild(h3);
        copy.appendChild(p);
        art.appendChild(circle);
        art.appendChild(copy);
        grid.appendChild(art);
        return art;
      });
    },

    updateFromScroll(y, winH, jTop, jH, waveLen) {
      const rel = jTop - y;
      if (rel > winH * 0.9 || rel + jH < 0) return;
      const r = Math.min(1, Math.max(0.08, (winH * 0.72 - rel) / jH));
      const wavePath = document.getElementById('journey-wave-progress');
      const spark = document.getElementById('journey-wave-spark');
      if (wavePath) wavePath.style.strokeDashoffset = (1 - r).toFixed(3);
      if (spark && wavePath && wavePath.getPointAtLength) {
        try {
          const pt = wavePath.getPointAtLength(waveLen * r);
          spark.setAttribute('cx', pt.x.toFixed(1));
          spark.setAttribute('cy', pt.y.toFixed(1));
        } catch (e) {}
      }
      const litCount = Math.max(1, Math.ceil(r * this.nodes.length));
      this.nodes.forEach((n, idx) => n.classList.toggle('is-lit', idx < litCount));
    }
  };

  /* ==========================================================================
     MÓDULO 14 — Faq (Acordeão acessível, 1 aberto por vez, delegação de eventos)
     ========================================================================== */
  const Faq = {
    init() {
      const list = document.getElementById('faq-list');
      if (!list) return;
      list.addEventListener('click', e => {
        const btn = e.target.closest('.faq-trigger');
        if (!btn) return;
        triggerHaptic();
        const item = btn.closest('.faq-item');
        if (!item) return;
        const willOpen = !item.classList.contains('is-open');
        list.querySelectorAll('.faq-item').forEach(other => {
          const isTarget = other === item && willOpen;
          other.classList.toggle('is-open', isTarget);
          const t = other.querySelector('.faq-trigger');
          if (t) t.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
        });
      });
    },

    renderItems(faqList) {
      const list = document.getElementById('faq-list');
      if (!list) return;
      while (list.firstChild) list.removeChild(list.firstChild);
      faqList.forEach((f, idx) => {
        const item = document.createElement('div');
        item.className = `faq-item${idx === 0 ? ' is-open' : ''}`;
        item.style.setProperty('--faq-idx', String(idx));

        const panelId = `faq-panel-${idx}`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'faq-trigger';
        btn.setAttribute('aria-expanded', idx === 0 ? 'true' : 'false');
        btn.setAttribute('aria-controls', panelId);

        const qSpan = document.createElement('span');
        qSpan.textContent = f.q || '';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'faq-icon';
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="2" y1="7" x2="12" y2="7"/><line class="line-v" x1="7" y1="2" x2="7" y2="12"/></svg>';

        btn.appendChild(qSpan);
        btn.appendChild(iconSpan);

        const panel = document.createElement('div');
        panel.className = 'faq-panel';
        panel.id = panelId;
        const inner = document.createElement('div');
        inner.className = 'faq-panel__inner';
        const p = document.createElement('p');
        p.textContent = f.a || '';
        inner.appendChild(p);
        panel.appendChild(inner);

        item.appendChild(btn);
        item.appendChild(panel);
        list.appendChild(item);
      });
    }
  };

  /* ==========================================================================
     MÓDULO 15 & 16 — Triage & Form (Mini-triagem + Validação + Modal explícito iOS-safe)
     ========================================================================== */
  const Triage = {
    options: [],
    selected: '',
    init() {
      const container = document.getElementById('triage-chips');
      const selectEl = document.getElementById('p-treatment');

      if (container) {
        container.addEventListener('click', e => {
          const chip = e.target.closest('.triage-chip');
          if (!chip) return;
          triggerHaptic();
          this.select(chip.getAttribute('data-triage') || '');
        });
      }

      if (selectEl) {
        selectEl.addEventListener('change', e => this.select(e.target.value));
      }

      document.addEventListener('click', e => {
        const trigger = e.target.closest('[data-select-triage]');
        if (!trigger) return;
        const topic = trigger.getAttribute('data-select-triage');
        if (topic) this.select(topic);
      });
    },

    renderChips(triageList) {
      this.options = triageList;
      const container = document.getElementById('triage-chips');
      const selectEl = document.getElementById('p-treatment');
      if (!container) return;
      while (container.firstChild) container.removeChild(container.firstChild);
      if (selectEl) {
        while (selectEl.firstChild) selectEl.removeChild(selectEl.firstChild);
      }

      triageList.forEach((t, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'triage-chip';
        btn.setAttribute('aria-pressed', idx === 0 ? 'true' : 'false');
        btn.setAttribute('data-triage', t.label);
        btn.textContent = t.label;
        container.appendChild(btn);

        if (selectEl) {
          const opt = document.createElement('option');
          opt.value = t.label;
          opt.textContent = t.label;
          if (idx === 0) opt.selected = true;
          selectEl.appendChild(opt);
        }
      });

      if (triageList[0]) this.select(triageList[0].label, false);
    },

    select(label, track = true) {
      if (!label) return;
      this.selected = label;
      const container = document.getElementById('triage-chips');
      const guideBox = document.getElementById('triage-guidance-box');
      const selectEl = document.getElementById('p-treatment');

      if (container) {
        container.querySelectorAll('.triage-chip').forEach(c => {
          c.setAttribute('aria-pressed', c.getAttribute('data-triage') === label ? 'true' : 'false');
        });
      }

      const found = this.options.find(o => o.label.toLowerCase() === label.toLowerCase()) || this.options[0];
      if (guideBox && found) {
        guideBox.textContent = found.guide;
      }

      if (selectEl) {
        const matchOpt = Array.from(selectEl.options).find(o => o.value.toLowerCase() === label.toLowerCase());
        if (matchOpt) selectEl.value = matchOpt.value;
      }

      if (track) trackConversion('triage_select', { topic: label });
    }
  };

  const Form = {
    inView: false,
    init() {
      const form = document.getElementById('schedule-form');
      const nameInput = document.getElementById('p-name');
      const phoneInput = document.getElementById('p-phone');
      const selectEl = document.getElementById('p-treatment');
      const lgpdCheck = document.getElementById('p-lgpd');
      const errorBox = document.getElementById('form-error-live');
      const submitBtn = document.getElementById('form-submit-btn');
      const agendarSec = document.getElementById('agendar');

      // Garantir LGPD nunca pré-marcado (Seção 3.4 Bug 7)
      if (lgpdCheck) lgpdCheck.checked = false;

      if (agendarSec && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entries => {
          this.inView = entries[0].isIntersecting;
          Progress.onScroll();
        }, { threshold: 0.15 });
        obs.observe(agendarSec);
      }

      // Rolar campo para o centro considerando visualViewport no mobile (Seção 16)
      [nameInput, phoneInput, selectEl].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('focus', () => {
          if (CAPS.coarseOrMobile) {
            setTimeout(() => {
              try { inp.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
            }, 260);
          }
        });
      });

      if (nameInput) {
        nameInput.addEventListener('input', () => {
          const wrap = document.getElementById('field-wrap-name');
          if (wrap) wrap.classList.toggle('is-valid', nameInput.value.trim().length >= 2);
          if (errorBox) errorBox.textContent = '';
        });
      }

      if (phoneInput) {
        phoneInput.addEventListener('input', e => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
          if (digits.length > 6) {
            e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
          } else if (digits.length > 2) {
            e.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
          } else if (digits.length > 0) {
            e.target.value = `(${digits}`;
          }
          const wrap = document.getElementById('field-wrap-phone');
          if (wrap) wrap.classList.toggle('is-valid', digits.length >= 10);
          if (errorBox) errorBox.textContent = '';
        });
      }

      if (form) {
        form.addEventListener('submit', e => {
          e.preventDefault();
          const nameVal = sanitizeText(nameInput ? nameInput.value : '', 80);
          const phoneVal = sanitizeText(phoneInput ? phoneInput.value : '', 30);
          const interestVal = sanitizeText(selectEl ? selectEl.value : Triage.selected, 80);
          const periodEl = form.querySelector('input[name="period"]:checked');
          const periodVal = periodEl ? sanitizeText(periodEl.value, 24) : 'Manhã';

          if (nameVal.length < 2) {
            if (errorBox) errorBox.textContent = 'Por favor, informe seu nome para continuarmos.';
            if (nameInput) nameInput.focus();
            return;
          }
          if (phoneVal.replace(/\D/g, '').length < 10) {
            if (errorBox) errorBox.textContent = 'Por favor, informe um telefone ou WhatsApp válido com DDD.';
            if (phoneInput) phoneInput.focus();
            return;
          }
          if (lgpdCheck && !lgpdCheck.checked) {
            if (errorBox) errorBox.textContent = 'Para prosseguir, marque a concordância com a Política de Privacidade (LGPD).';
            lgpdCheck.focus();
            return;
          }

          const brandName = sanitizeText(activeConfig.brand && activeConfig.brand.name, 60) || 'Arco Odontologia';
          const composed =
            `Olá! Vim pelo site da ${brandName} e gostaria de agendar uma consulta.\n\n` +
            `• Nome: ${nameVal}\n` +
            `• Contato: ${phoneVal}\n` +
            `• Interesse: ${interestVal}\n` +
            `• Período preferido: ${periodVal}`;

          const chain = getContactChain(composed);
          const tyModal = document.getElementById('thankyou-modal');
          const tyAction = document.getElementById('ty-modal-action-link');
          const tyActionText = document.getElementById('ty-modal-action-text');
          const tyActionCopy = document.getElementById('ty-modal-action-copy');

          if (tyAction) {
            tyAction.setAttribute('href', chain.url);
            if (tyActionText) tyActionText.textContent = chain.modalAction;
            if (tyActionCopy) tyActionCopy.textContent = chain.modalAction;
          }

          triggerHaptic();
          trackConversion('lead_form_submit', {
            interest: interestVal,
            period: periodVal,
            channel: chain.type
          });

          Modals.open(tyModal, submitBtn);
        });
      }
    }
  };

  /* ==========================================================================
     MÓDULO 17 & 18 — Sheet & Modals (Focus Trap, Esc, inert, restauração de foco, Mapa e Equipe mobile)
     ========================================================================== */
  const Modals = {
    activeEl: null,
    lastTrigger: null,

    setInert(isInert) {
      const header = document.getElementById('site-header');
      const main = document.getElementById('conteudo-principal');
      const footer = document.getElementById('rodape');
      [header, main, footer].forEach(el => {
        if (!el) return;
        if (isInert) {
          el.setAttribute('inert', '');
          el.setAttribute('aria-hidden', 'true');
        } else {
          el.removeAttribute('inert');
          el.removeAttribute('aria-hidden');
        }
      });
    },

    open(overlayEl, triggerEl) {
      if (!overlayEl) return;
      this.lastTrigger = triggerEl || document.activeElement;
      this.activeEl = overlayEl;
      overlayEl.classList.add('is-open');
      overlayEl.setAttribute('aria-hidden', 'false');
      this.setInert(true);
      document.body.classList.add('is-scroll-locked');

      const focusables = overlayEl.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (focusables.length > 0) {
        setTimeout(() => focusables[0].focus(), 40);
      }
    },

    close(overlayEl) {
      const target = overlayEl || this.activeEl;
      if (!target) return;
      target.classList.remove('is-open');
      target.setAttribute('aria-hidden', 'true');
      const backdrop = document.getElementById('sheet-backdrop');
      const sheet = document.getElementById('mobile-bottom-sheet');
      const openBtn = document.getElementById('open-sheet-btn');
      if (target === sheet && backdrop) {
        backdrop.classList.remove('is-open');
        if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
      }
      this.setInert(false);
      document.body.classList.remove('is-scroll-locked');
      this.activeEl = null;
      if (this.lastTrigger && typeof this.lastTrigger.focus === 'function') {
        this.lastTrigger.focus();
      }
    },

    init() {
      const openSheetBtn = document.getElementById('open-sheet-btn');
      const sheetBackdrop = document.getElementById('sheet-backdrop');
      const bottomSheet = document.getElementById('mobile-bottom-sheet');
      const dragHandle = document.getElementById('sheet-drag-handle');

      if (openSheetBtn && bottomSheet && sheetBackdrop) {
        openSheetBtn.addEventListener('click', () => {
          triggerHaptic();
          sheetBackdrop.classList.add('is-open');
          openSheetBtn.setAttribute('aria-expanded', 'true');
          this.open(bottomSheet, openSheetBtn);
        });
        sheetBackdrop.addEventListener('click', () => this.close(bottomSheet));
        bottomSheet.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', () => this.close(bottomSheet));
        });
      }

      if (dragHandle && bottomSheet) {
        let startY = 0, deltaY = 0, dragging = false;
        dragHandle.addEventListener('pointerdown', e => {
          dragging = true;
          startY = e.clientY;
          deltaY = 0;
          bottomSheet.style.transition = 'none';
          dragHandle.setPointerCapture(e.pointerId);
        });
        dragHandle.addEventListener('pointermove', e => {
          if (!dragging) return;
          deltaY = Math.max(0, e.clientY - startY);
          bottomSheet.style.transform = `translateY(${deltaY}px)`;
        });
        dragHandle.addEventListener('pointerup', () => {
          if (!dragging) return;
          dragging = false;
          bottomSheet.style.transition = '';
          bottomSheet.style.transform = '';
          if (deltaY > 75) this.close(bottomSheet);
        });
      }

      // Modais de Privacidade, Agradecimento e Zoom Mobile
      const privModal = document.getElementById('privacidade');
      const tyModal = document.getElementById('thankyou-modal');
      const zoomModal = document.getElementById('zoom-modal');

      document.querySelectorAll('[data-open-privacy]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          this.open(privModal, btn);
        });
      });

      document.getElementById('close-privacy-modal-btn')?.addEventListener('click', () => this.close(privModal));
      document.getElementById('close-ty-modal-btn')?.addEventListener('click', () => this.close(tyModal));
      document.getElementById('ty-modal-action-link')?.addEventListener('click', () => this.close(tyModal));
      document.getElementById('close-zoom-modal-btn')?.addEventListener('click', () => this.close(zoomModal));

      // Toque no palco de resultados no mobile abre modal com pinch-zoom (Seção 9.8)
      const openZoomBtn = document.getElementById('open-results-zoom-btn');
      const resultsStage = document.getElementById('results-curtain-stage');
      [openZoomBtn, resultsStage].forEach(el => {
        if (!el) return;
        el.addEventListener('click', e => {
          if (el === resultsStage && !CAPS.coarseOrMobile) return;
          e.preventDefault();
          this.open(zoomModal, el);
        });
      });

      // Fechar modal com Esc e Focus Trap com Tab
      window.addEventListener('keydown', e => {
        if (!this.activeEl) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          this.close(this.activeEl);
          return;
        }
        if (e.key === 'Tab') {
          const focusables = Array.from(this.activeEl.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      // Click-to-load do Google Maps em #contato (Seção 9.12)
      const loadMapBtn = document.getElementById('load-map-btn');
      const mapPlaceholder = document.getElementById('map-placeholder');
      const mapIframe = document.getElementById('contact-map-iframe');
      if (loadMapBtn && mapPlaceholder && mapIframe) {
        loadMapBtn.addEventListener('click', () => {
          triggerHaptic();
          const customEmbed = sanitizeText(activeConfig.location && activeConfig.location.mapsEmbedUrl, 300);
          const q = encodeURIComponent((activeConfig.location && activeConfig.location.mapsQuery) || (activeConfig.location && activeConfig.location.address) || '');
          mapIframe.src = customEmbed || `https://www.google.com/maps?q=${q}&output=embed`;
          mapPlaceholder.classList.add('is-loaded');
          trackConversion('map_load');
        });
      }

      // Cookies e Voltar ao topo
      document.getElementById('accept-cookies-btn')?.addEventListener('click', () => {
        safeStorageSet('local', 'arco_lgpd_cookies_ok', '1');
        document.getElementById('cookie-bar')?.classList.remove('is-visible');
        initAnalyticsIfAllowed(activeConfig);
        Progress.onScroll();
      });

      document.getElementById('back-to-top-btn')?.addEventListener('click', () => {
        triggerHaptic();
        window.scrollTo({ top: 0, behavior: CAPS.reducedMotion ? 'auto' : 'smooth' });
      });

      // N-11 Equipe empilhada no mobile (interpolação de escala/opacidade no carrossel) + toque abre cápsula
      const teamCarousel = document.getElementById('team-carousel');
      if (teamCarousel) {
        teamCarousel.addEventListener('click', e => {
          const cap = e.target.closest('.frame-capsule');
          if (cap && CAPS.coarseOrMobile) {
            cap.classList.toggle('is-glass-open');
          }
        });

        let teamScrollTick = false;
        const updateTeamCards = () => {
          teamScrollTick = false;
          if (window.innerWidth >= 1024) return;
          const cards = Array.from(teamCarousel.querySelectorAll('.team-card'));
          if (!cards.length) return;
          const center = teamCarousel.scrollLeft + teamCarousel.clientWidth * 0.5;
          let closestIdx = 0;
          let minDist = Infinity;

          cards.forEach((c, idx) => {
            const cCenter = c.offsetLeft + c.offsetWidth * 0.5;
            const dist = Math.min(1, Math.abs(center - cCenter) / Math.max(1, c.offsetWidth));
            if (dist < minDist) {
              minDist = dist;
              closestIdx = idx;
            }
            const scale = 1 - dist * 0.06; // 1 -> 0.94
            const op = 1 - dist * 0.3;     // 1 -> 0.70
            c.style.setProperty('--card-scale', scale.toFixed(3));
            c.style.setProperty('--card-op', op.toFixed(2));
          });

          document.querySelectorAll('.team-dot').forEach((d, i) => {
            d.classList.toggle('is-active', i === closestIdx);
          });
        };

        teamCarousel.addEventListener('scroll', () => {
          if (!teamScrollTick) {
            teamScrollTick = true;
            requestAnimationFrame(updateTeamCards);
          }
        }, { passive: true });
      }
    }
  };

  /* ==========================================================================
     MÓDULO 19 — Cursor & Microinteractions (Botões magnéticos, Spotlight, Cursor Lente)
     ========================================================================== */
  const Cursor = {
    init() {
      const cursorEl = document.getElementById('custom-cursor');
      const labelEl = document.getElementById('custom-cursor-label');

      if (CAPS.finePointer && cursorEl) {
        document.addEventListener('mouseover', e => {
          const t = e.target;
          if (!t || !t.closest) return;
          const modeEl = t.closest('[data-cursor-mode]');
          if (modeEl && labelEl) {
            labelEl.textContent = modeEl.getAttribute('data-cursor-mode') || '';
            cursorEl.classList.add('is-mode');
            cursorEl.classList.remove('is-button', 'is-input');
            return;
          }
          cursorEl.classList.remove('is-mode');
          if (t.closest('input:not([type="range"]), select, textarea')) {
            cursorEl.classList.add('is-input');
            cursorEl.classList.remove('is-button');
          } else if (t.closest('a, button, .triage-chip, .faq-trigger, .service-tab')) {
            cursorEl.classList.add('is-button');
            cursorEl.classList.remove('is-input');
          } else {
            cursorEl.classList.remove('is-button', 'is-input');
          }
        }, { passive: true });
      }

      // Botões B1/B2 magnéticos até 6px + ponto de entrada --px/--py + onda de toque mobile
      document.addEventListener('pointermove', e => {
        const btn = e.target.closest && e.target.closest('.btn-b1, .btn-b2');
        if (btn) {
          const r = btn.getBoundingClientRect();
          btn.style.setProperty('--px', `${(e.clientX - r.left).toFixed(1)}px`);
          btn.style.setProperty('--py', `${(e.clientY - r.top).toFixed(1)}px`);
          if (CAPS.finePointer && !CAPS.reducedMotion && btn.classList.contains('magnetic-btn')) {
            const dx = ((e.clientX - (r.left + r.width * 0.5)) / Math.max(1, r.width * 0.5)) * 6;
            const dy = ((e.clientY - (r.top + r.height * 0.5)) / Math.max(1, r.height * 0.5)) * 6;
            btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
          }
        }
        const spot = e.target.closest && e.target.closest('.spotlight-surface');
        if (spot && CAPS.finePointer) {
          const r = spot.getBoundingClientRect();
          spot.style.setProperty('--spot-x', `${(e.clientX - r.left).toFixed(1)}px`);
          spot.style.setProperty('--spot-y', `${(e.clientY - r.top).toFixed(1)}px`);
        }
      }, { passive: true });

      document.querySelectorAll('.btn-b1, .btn-b2').forEach(btn => {
        btn.addEventListener('pointerleave', () => {
          btn.style.transform = '';
        });
        btn.addEventListener('pointerdown', e => {
          if (CAPS.finePointer || CAPS.reducedMotion) return;
          triggerHaptic();
          const r = btn.getBoundingClientRect();
          const ripple = document.createElement('span');
          ripple.className = 'touch-ripple';
          const sz = Math.max(r.width, r.height);
          ripple.style.width = ripple.style.height = `${sz}px`;
          ripple.style.left = `${e.clientX - r.left - sz * 0.5}px`;
          ripple.style.top = `${e.clientY - r.top - sz * 0.5}px`;
          btn.appendChild(ripple);
          setTimeout(() => ripple.remove(), 520);
        });
      });

      // Rastreamento de cliques em CTAs de contato
      document.addEventListener('click', e => {
        const link = e.target.closest && e.target.closest('[data-config-href]');
        if (!link) return;
        const type = link.getAttribute('data-config-href');
        if (type === 'wa') {
          const chain = getContactChain();
          trackConversion(chain.type === 'whatsapp' ? 'whatsapp_click' : 'instagram_click', {
            id: link.id || 'cta'
          });
        } else if (type === 'instagram') {
          trackConversion('instagram_click', { id: link.id || 'ig_link' });
        }
      });
    }
  };

  /* ==========================================================================
     MÓDULO 20 — Availability (N-3 Selo «Aberto agora» via Intl.DateTimeFormat a cada 60s)
     ========================================================================== */
  const Availability = {
    timer: null,
    init() {
      this.update();
      this.timer = setInterval(() => {
        if (!document.hidden) this.update();
      }, 60000);
    },

    update() {
      const badges = document.querySelectorAll('[data-availability-badge]');
      const hrs = activeConfig.hours;
      const hasHours = hrs && hrs.week && Object.values(hrs.week).some(Boolean);

      if (!hasHours) {
        badges.forEach(b => { b.hidden = true; });
        return;
      }

      const tz = hrs.timezone || 'America/Sao_Paulo';
      let dayKey = 'mon';
      let curMinutes = 10 * 60;

      try {
        const now = new Date();
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).formatToParts(now);
        const mapDay = { Sun: 'sun', Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat' };
        let h = 10, m = 0;
        parts.forEach(p => {
          if (p.type === 'weekday' && mapDay[p.value]) dayKey = mapDay[p.value];
          if (p.type === 'hour') h = parseInt(p.value, 10) % 24;
          if (p.type === 'minute') m = parseInt(p.value, 10);
        });
        curMinutes = h * 60 + m;
      } catch (e) {}

      const toMin = str => {
        const [hh, mm] = String(str || '08:00').split(':').map(Number);
        return (hh || 0) * 60 + (mm || 0);
      };
      const fmtHour = str => {
        const [hh, mm] = String(str || '08:00').split(':');
        return mm === '00' ? `${parseInt(hh, 10)}h` : `${parseInt(hh, 10)}h${mm}`;
      };

      const todayRange = hrs.week[dayKey];
      let isOpen = false;
      let statusText = 'Agende seu horário';

      if (Array.isArray(todayRange) && todayRange.length === 2) {
        const openMin = toMin(todayRange[0]);
        const closeMin = toMin(todayRange[1]);
        if (curMinutes >= openMin && curMinutes < closeMin) {
          isOpen = true;
          statusText = `Aberto agora · fecha às ${fmtHour(todayRange[1])}`;
        } else if (curMinutes < openMin) {
          statusText = `Fechado · abre hoje às ${fmtHour(todayRange[0])}`;
        }
      }

      if (!isOpen && statusText === 'Agende seu horário') {
        const order = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const startIdx = order.indexOf(dayKey);
        for (let offset = 1; offset <= 7; offset++) {
          const nextKey = order[(startIdx + offset) % 7];
          const nextRange = hrs.week[nextKey];
          if (Array.isArray(nextRange) && nextRange.length === 2) {
            const label = offset === 1 ? 'amanhã' : 'em breve';
            statusText = `Fechado · abre ${label} às ${fmtHour(nextRange[0])}`;
            break;
          }
        }
      }

      badges.forEach(b => {
        b.hidden = false;
        b.classList.toggle('is-open', isOpen);
        const txtEl = b.querySelector('[data-availability-text]');
        if (txtEl) txtEl.textContent = statusText;
      });
    }
  };

  /* ==========================================================================
     MÓDULO 21 — SellerMode (`?vendedor=1` — Edição ao vivo + Copiar Link + Copiar config.js)
     ========================================================================== */
  const SellerMode = {
    init() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('vendedor') !== '1' || !activeConfig.features || !activeConfig.features.sellerMode) return;

      const trigger = document.getElementById('seller-trigger-btn');
      const panel = document.getElementById('seller-panel');
      const closeBtn = document.getElementById('seller-close-btn');
      if (!trigger || !panel) return;

      trigger.hidden = false;

      const inputs = {
        brand: document.getElementById('sel-brand'),
        ownerTitle: document.getElementById('sel-owner-title'),
        ownerName: document.getElementById('sel-owner-name'),
        ownerProf: document.getElementById('sel-owner-prof'),
        city: document.getElementById('sel-city'),
        uf: document.getElementById('sel-uf'),
        address: document.getElementById('sel-address'),
        wa: document.getElementById('sel-wa'),
        ig: document.getElementById('sel-ig'),
        hoursPreset: document.getElementById('sel-hours-preset'),
        profile: document.getElementById('sel-profile'),
        variant: document.getElementById('sel-variant'),
        demo: document.getElementById('sel-demo')
      };

      const syncInputsFromConfig = () => {
        if (inputs.brand) inputs.brand.value = activeConfig.brand.name || '';
        if (inputs.ownerTitle) inputs.ownerTitle.value = activeConfig.owner.title || 'Dr.';
        if (inputs.ownerName) inputs.ownerName.value = activeConfig.owner.name || '';
        if (inputs.ownerProf) inputs.ownerProf.value = activeConfig.owner.profession || 'Cirurgião-Dentista';
        if (inputs.city) inputs.city.value = activeConfig.location.city || '';
        if (inputs.uf) inputs.uf.value = activeConfig.location.uf || '';
        if (inputs.address) inputs.address.value = activeConfig.location.address || '';
        if (inputs.wa) inputs.wa.value = activeConfig.contact.whatsapp || '';
        if (inputs.ig) inputs.ig.value = activeConfig.contact.instagram || '';
        if (inputs.profile) inputs.profile.value = activeProfileKey;
        if (inputs.variant) inputs.variant.value = activeConfig.heroVariant || 'dupla';
        if (inputs.demo) inputs.demo.checked = Boolean(activeConfig.demoMode);
      };

      syncInputsFromConfig();

      const applyLiveChanges = () => {
        if (inputs.brand) {
          activeConfig.brand.name = sanitizeText(inputs.brand.value, 40) || 'Arco Odontologia';
          activeConfig.brand.short = activeConfig.brand.name.split(' ')[0];
        }
        if (inputs.ownerTitle) activeConfig.owner.title = sanitizeText(inputs.ownerTitle.value, 10);
        if (inputs.ownerName) activeConfig.owner.name = sanitizeText(inputs.ownerName.value, 40);
        if (inputs.ownerProf) activeConfig.owner.profession = sanitizeText(inputs.ownerProf.value, 40);
        if (inputs.city) activeConfig.location.city = sanitizeText(inputs.city.value, 36);
        if (inputs.uf) activeConfig.location.uf = sanitizeText(inputs.uf.value, 4).toUpperCase();
        if (inputs.address) activeConfig.location.address = sanitizeText(inputs.address.value, 120);
        if (inputs.wa) {
          const w = sanitizeDigits(inputs.wa.value, 15);
          activeConfig.contact.whatsapp = w;
          if (w.length >= 12 && w.startsWith('55')) {
            const ddd = w.slice(2, 4);
            const rest = w.slice(4);
            activeConfig.contact.phoneDisplay = `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
          } else {
            activeConfig.contact.phoneDisplay = w;
          }
        }
        if (inputs.ig) activeConfig.contact.instagram = sanitizeHandle(inputs.ig.value);
        if (inputs.hoursPreset) {
          const preset = inputs.hoursPreset.value;
          if (preset === 'comercial') {
            activeConfig.hours.week = { mon:['08:00','18:00'], tue:['08:00','18:00'], wed:['08:00','18:00'], thu:['08:00','18:00'], fri:['08:00','18:00'], sat:['08:00','12:00'], sun:null };
          } else if (preset === 'estendido') {
            activeConfig.hours.week = { mon:['08:00','20:00'], tue:['08:00','20:00'], wed:['08:00','20:00'], thu:['08:00','20:00'], fri:['08:00','20:00'], sat:['08:00','14:00'], sun:null };
          } else if (preset === 'sem-horario') {
            activeConfig.hours.week = null;
          }
        }
        if (inputs.variant) activeConfig.heroVariant = inputs.variant.value;
        if (inputs.demo) activeConfig.demoMode = inputs.demo.checked;
        if (inputs.profile && inputs.profile.value !== activeProfileKey) {
          Profile.apply(inputs.profile.value);
        }
        Config.renderDOM();
        Availability.update();
      };

      Object.values(inputs).forEach(inp => {
        if (!inp) return;
        inp.addEventListener('input', applyLiveChanges);
        inp.addEventListener('change', applyLiveChanges);
      });

      trigger.addEventListener('click', () => {
        panel.hidden = !panel.hidden;
        if (!panel.hidden && inputs.brand) inputs.brand.focus();
      });

      closeBtn?.addEventListener('click', () => {
        panel.hidden = true;
        trigger.focus();
      });

      window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !panel.hidden) {
          panel.hidden = true;
          trigger.focus();
        }
      });

      const copyText = (text, btn, feedback) => {
        const done = () => {
          const orig = btn.textContent;
          btn.textContent = feedback;
          setTimeout(() => { btn.textContent = orig; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(() => {
            this.fallbackCopy(text);
            done();
          });
        } else {
          this.fallbackCopy(text);
          done();
        }
      };

      document.getElementById('seller-copy-link-btn')?.addEventListener('click', e => {
        const u = new URL(window.location.href);
        u.search = '';
        u.searchParams.set('perfil', activeProfileKey);
        u.searchParams.set('variante', activeConfig.heroVariant || 'dupla');
        if (activeConfig.brand.name) u.searchParams.set('clinica', activeConfig.brand.name);
        if (activeConfig.location.city) u.searchParams.set('cidade', activeConfig.location.city);
        if (activeConfig.location.uf) u.searchParams.set('uf', activeConfig.location.uf);
        if (activeConfig.contact.whatsapp) u.searchParams.set('wa', activeConfig.contact.whatsapp);
        if (activeConfig.contact.instagram) u.searchParams.set('ig', activeConfig.contact.instagram.replace(/^@/, ''));
        if (activeConfig.owner.name) u.searchParams.set('titular', activeConfig.owner.name);
        copyText(u.toString(), e.currentTarget, 'Link copiado!');
      });

      document.getElementById('seller-copy-config-btn')?.addEventListener('click', e => {
        const code = `// ÚNICO arquivo de dados do cliente. Edite aqui e recarregue a página.\nwindow.SITE_CONFIG = ${JSON.stringify(activeConfig, null, 2)};\n`;
        copyText(code, e.currentTarget, 'config.js copiado!');
      });

      document.getElementById('seller-reset-btn')?.addEventListener('click', () => {
        activeConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        Profile.apply(activeConfig.profile || 'geral');
        Config.renderDOM();
        Availability.update();
        syncInputsFromConfig();
      });
    },

    fallbackCopy(text) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      } catch (e) {}
    }
  };

  /* ==========================================================================
     MÓDULO 22 — Debug (`?debug=1` — FPS, DPR, WebGL, Perfil e Detector de Overflow Horizontal)
     ========================================================================== */
  const Debug = {
    init() {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debug') !== '1' || !activeConfig.features || !activeConfig.features.debug) return;
      const panel = document.getElementById('debug-panel');
      if (!panel) return;
      panel.hidden = false;

      const updateDebug = () => {
        if (document.hidden) return;
        const docW = document.documentElement.clientWidth;
        const offenders = [];
        document.querySelectorAll('body *').forEach(el => {
          el.classList.remove('debug-overflow-highlight');
          const r = el.getBoundingClientRect();
          if (r.width > docW + 1 || r.right > docW + 2) {
            offenders.push(el.tagName.toLowerCase() + (el.id ? `#${el.id}` : (el.className && typeof el.className === 'string' ? `.${el.className.split(' ')[0]}` : '')));
            el.classList.add('debug-overflow-highlight');
          }
        });

        panel.textContent = '';
        const lines = [
          `Viewport: ${window.innerWidth}×${window.innerHeight} (DPR ${window.devicePixelRatio || 1})`,
          `FPS (Ticker): ${Ticker.fps} | ReducedMotion: ${CAPS.reducedMotion}`,
          `WebGL: ${Shader.gl && !Shader.contextLost ? 'Ativo' : 'Fallback CSS'}`,
          `Perfil: ${activeProfileKey} | Hero: ${activeConfig.heroVariant}`,
          `Overflow-X (${offenders.length}): ${offenders.slice(0, 3).join(', ') || 'Nenhum (0)'}`,
          `Erros isolados: ${debugErrors.length}`
        ];
        lines.forEach(l => {
          const div = document.createElement('div');
          div.textContent = l;
          panel.appendChild(div);
        });
      };

      updateDebug();
      setInterval(updateDebug, 1200);
      window.addEventListener('resize', updateDebug, { passive: true });
    }
  };

  /* ==========================================================================
     INICIALIZAÇÃO ORQUESTRADA DOS 22 MÓDULOS ISOLADOS EM TRY/CATCH
     ========================================================================== */
  function initArco() {
    if (window.__arcoInitDone) return;
    window.__arcoInitDone = true;

    runSafe('CAPS', () => CAPS.init());
    runSafe('Config.Overrides', () => Config.applyUrlOverrides());
    runSafe('Services.Init', () => Services.init());
    runSafe('Faq.Init', () => Faq.init());
    runSafe('Triage.Init', () => Triage.init());
    runSafe('Profile.Apply', () => Profile.apply(activeProfileKey));
    runSafe('Config.Render', () => Config.renderDOM());
    runSafe('Intro', () => Intro.init());
    runSafe('Shader', () => Shader.init());
    runSafe('Parallax', () => Parallax.init());
    runSafe('Atmosphere', () => Atmosphere.init());
    runSafe('Curtain', () => Curtain.init());
    runSafe('Loupe', () => Loupe.init());
    runSafe('Slider', () => Slider.init());
    runSafe('Journey', () => Journey.init());
    runSafe('Form', () => Form.init());
    runSafe('Modals', () => Modals.init());
    runSafe('Cursor', () => Cursor.init());
    runSafe('Availability', () => Availability.init());
    runSafe('Progress', () => Progress.init());
    runSafe('SellerMode', () => SellerMode.init());
    runSafe('Debug', () => Debug.init());

    // Reage em tempo real a mudanças em prefers-reduced-motion (Seção 3.4 Bug 7 e 11)
    CAPS.onChange(caps => {
      if (caps.reducedMotion) {
        const hero = document.getElementById('inicio');
        if (hero) {
          hero.classList.remove('intro-active');
          hero.classList.add('hero-intro-done');
        }
        document.getElementById('preloader')?.classList.add('is-hidden');
        document.getElementById('site-header')?.classList.remove('intro-pending');
      } else {
        Ticker.wake();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArco);
  } else {
    initArco();
  }
})();