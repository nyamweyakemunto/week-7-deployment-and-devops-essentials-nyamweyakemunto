import React from 'react';
import ReactDOM from 'react-dom/client';  // Use ReactDOM from 'react-dom/client' for React 18+
import App from './App';  // Importing the main App component
import reportWebVitals from './reportWebVitals';  // Optional: for measuring performance

// Importing Sentry for error tracking (if you integrated it)
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

// Initialize Sentry (make sure to replace <your-sentry-dsn> with your actual DSN)
Sentry.init({
  dsn: '<your-sentry-dsn>',
  integrations: [new Integrations.BrowserTracing()],
  // Adjust this value in production, or use tracesSampler
  tracesSampleRate: 1.0,
});

// Creating the root element in the main HTML file (usually public/index.html)
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component inside the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: Report web vitals to your analytics endpoint
reportWebVitals();