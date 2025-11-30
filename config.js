// config.js — Exclusion-style config
// Default behavior: overlay is ON wherever the loader script is present.
// Add hostnames to disabledStores (or patterns to disabledPatterns) to disable.

window.__overlayConfig = {
  "disabledStores": [
// "voysoul.myshopify.com"
  ],
  "disabledPatterns": [
    // Optional wildcard patterns. Examples:
    // "*.dev.example.com",
    // "*.staging.example.com"
    // "*.myshopify.com"
  ],
  "overlay": {
    "title": "Temporary Interface",
    "subtitle": "This store is showing a temporary interface controlled from GitHub Pages.",
    "showCloseButton": false,
    "background": "rgba(7, 10, 15, 0.95)",
    "color": "#ffffff"
  }
};
