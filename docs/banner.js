(function() {
  // Prevent multiple loads
  if (window.__GLOBAL_TOP_BANNER_LOADER__) return;
  window.__GLOBAL_TOP_BANNER_LOADER__ = true;

  // Read configuration from data-* attributes on the script tag
  const currentScript = document.currentScript;
  const normalizeHex = (raw) => raw
    ? (raw.startsWith('#') ? raw : '#' + raw)
    : null;
  const rawColor = currentScript && currentScript.dataset.color;
  const rawTextColor = currentScript && currentScript.dataset.textcolor;
  const rawLang = currentScript && currentScript.dataset.lang;
  window.__BANNER_CONFIG__ = {
    color: normalizeHex(rawColor),
    textColor: normalizeHex(rawTextColor),
    lang: rawLang || 'auto'
  };

  // Get the current script src to resolve relative URLs
  const scriptSrc = currentScript && currentScript.src;
  
  // Create the implementation script URL with timestamp for cache busting
  const timestamp = Date.now();
  const implUrl = new URL('banner.impl.js', scriptSrc || location.href);
  implUrl.searchParams.set('ts', timestamp);

  // Load the implementation script dynamically
  const script = document.createElement('script');
  script.src = implUrl.toString();
  script.async = true;
  
  // Handle errors
  script.onerror = function() {
    console.error('Failed to load banner implementation');
  };

  // Append to head for faster loading
  document.head.appendChild(script);
})();
