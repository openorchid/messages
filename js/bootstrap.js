!(function (exports) {
  'use strict';

  // Check if the browser supports service workers
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    SpatialNavigation.init();
    SpatialNavigation.add({
      selector: '.tablist a, .tablist button, .tablist .lists ul li, .visible a, .visible button, .visible .lists ul li, .visible .lists ul li input'
    });
    SpatialNavigation.makeFocusable();
    SpatialNavigation.focus();
  });
})(window);
