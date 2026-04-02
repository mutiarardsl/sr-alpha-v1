/**
 * SR MVP — Entry Point
 * Tim 6 Fase 2 | src/main.jsx
 *
 * Boot sequence:
 *   1. Aktifkan MSW (jika VITE_USE_MSW=true) → intercept API calls
 *   2. Init Keycloak (jika VITE_USE_KEYCLOAK=true) → autentikasi SSO
 *   3. Render React app
 *
 * Urutan ini penting: MSW harus aktif SEBELUM komponen mount dan mulai fetch.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

async function enableMocking() {
  if (import.meta.env.VITE_USE_MSW !== 'true') return;
  const { worker } = await import('./mocks/browser.js');
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}

async function enableKeycloak() {
  if (import.meta.env.VITE_USE_KEYCLOAK !== 'true') return;
  const { initKeycloak } = await import('./keycloak.js');
  const authenticated = await initKeycloak();
  if (!authenticated) {
    console.warn('[Keycloak] Not authenticated after init');
  }
}

async function boot() {
  await enableMocking();
  await enableKeycloak();

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}

boot().catch(console.error);
