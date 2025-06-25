// public/js/gtag-config.js
(function() {
  // Initialize dataLayer and gtag function if not already defined
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  
  // Initialize Google Analytics with current timestamp
  gtag('js', new Date());
  
  // Get the script tag that loaded this file to read attributes
  const scriptTag = document.currentScript;
  if (!scriptTag) {
    console.error('GA Config: document.currentScript is not available.');
    return;
  }
  
  const gaTrackingId = scriptTag.getAttribute('data-ga-id');

  if (gaTrackingId && typeof gtag === 'function') {
    console.log('External GA Config: Configuring with ID ' + gaTrackingId + ' for path ' + window.location.pathname);
    gtag('config', gaTrackingId, {
      'page_path': window.location.pathname,
    });
  } else {
    if (!gaTrackingId) {
      console.error('External GA Config: data-ga-id attribute not found.');
    }
    if (typeof gtag !== 'function') {
      console.error('External GA Config: gtag function is not defined. Ensure main gtag.js library (gtag-manager) is loaded before this script.');
    }
  }
})(); 