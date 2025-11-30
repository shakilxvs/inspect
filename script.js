// script.js — Default ON overlay; disable per-site in config.js
(function () {
  const BASE = 'https://shakilxvs.github.io/inspect';
  const CONFIG_URL = BASE + '/config.js';
  const INTERFACE_URL = BASE + '/interface.html';

  function loadScript(url, cb) {
    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.onload = () => cb && cb(null);
    s.onerror = () => cb && cb(new Error('load-error'));
    document.head.appendChild(s);
  }

  function isDisabledHost(cfg, host) {
    if (!cfg) return false;
    // exact matches
    if (Array.isArray(cfg.disabledStores) && cfg.disabledStores.indexOf(host) !== -1) return true;
    // wildcard patterns (supports * -> .*)
    if (Array.isArray(cfg.disabledPatterns)) {
      for (let p of cfg.disabledPatterns) {
        let esc = p.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
        let re = new RegExp('^' + esc + '$', 'i');
        if (re.test(host)) return true;
      }
    }
    return false;
  }

  function createIframeOverlay(cfg) {
    if (document.getElementById('remote-overlay-root')) return;

    const overlay = document.createElement('div');
    overlay.id = 'remote-overlay-root';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      background: (cfg && cfg.background) || 'rgba(0,0,0,0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      margin: '0',
      border: 'none',
      boxSizing: 'border-box',
      overflow: 'hidden'
    });

    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      boxSizing: 'border-box',
      background: 'transparent'
    });

    const iframe = document.createElement('iframe');
    iframe.id = 'remote-overlay-iframe';
    // cache-bust to ensure interface updates when you edit it; remove ?cb= for stable caching later
    iframe.src = INTERFACE_URL + '?cb=' + Date.now();
    iframe.setAttribute('title', (cfg && cfg.title) || 'Remote Interface');
    Object.assign(iframe.style, {
      width: '100%',
      height: '100%',
      border: '0',
      borderRadius: '0',
      boxShadow: 'none',
      overflow: 'hidden',
      display: 'block',
      background: 'transparent'
    });

    // allow interactions inside iframe if needed
    iframe.setAttribute('allow', 'fullscreen');

    wrap.appendChild(iframe);
    overlay.appendChild(wrap);

    if (cfg && cfg.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      Object.assign(closeBtn.style, {
        position: 'fixed',
        right: '18px',
        top: '18px',
        zIndex: '2147483648',
        padding: '10px 14px',
        fontSize: '14px',
        cursor: 'pointer'
      });
      closeBtn.addEventListener('click', () => overlay.remove());
      overlay.appendChild(closeBtn);
    }

    // append to documentElement so it covers entire viewport reliably
    (document.documentElement || document.body).appendChild(overlay);
  }

  // Orchestration
  loadScript(CONFIG_URL, (err) => {
    // NOTE: we intentionally do NOT abort when config load fails.
    // Default is: overlay is ON unless the host is explicitly disabled.
    const cfg = window.__overlayConfig || {};
    try {
      const host = (window.location && window.location.hostname || '').toLowerCase();
      const disabled = isDisabledHost(cfg, host);
      if (!disabled) {
        createIframeOverlay(cfg.overlay || {});
      } else {
        // overlay explicitly disabled for this host
        // (no action)
        // console.info('overlay disabled for host', host);
      }
    } catch (e) {
      // If anything unexpectedly throws, show the overlay (fail-open)
      try { createIframeOverlay(window.__overlayConfig && window.__overlayConfig.overlay || {}); } catch (e2) {}
    }
  });
})();
