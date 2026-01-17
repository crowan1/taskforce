export const initPerformanceOptimizations = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection && connection.saveData) {
    document.documentElement.classList.add('save-data');
  }

  if ('loading' in HTMLImageElement.prototype) {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        if (!img.getAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      });
    });
  }
};

