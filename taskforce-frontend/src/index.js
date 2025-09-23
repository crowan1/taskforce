import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
 
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
      .then((registration) => {
        console.log('Service Worker enregistré avec succès:', registration.scope);
         
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nouvelle version du Service Worker disponible');
            }
          });
        });
      })
      .catch((registrationError) => {
        console.warn('Échec de l\'enregistrement du Service Worker:', registrationError);
      });
  });
 
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Message du Service Worker:', event.data);
  });
}
 
reportWebVitals();
