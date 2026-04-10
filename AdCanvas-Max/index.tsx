
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Shim process.env for the browser to ensure API keys injected by the platform are accessible
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = window.process || {};
  // @ts-ignore
  window.process.env = window.process.env || {};
  
  // Try to sync with Vite's define if possible, or just ensure the object exists
  // The platform injects API_KEY into the environment
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
