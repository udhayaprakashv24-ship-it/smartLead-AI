import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {shouldIgnoreClientError} from './utils/logger';

function reportClientError(payload: {
  type: 'error' | 'unhandledrejection';
  message: string;
  source?: string;
  stack?: string;
}): void {
  if (!payload.message || shouldIgnoreClientError(payload.message)) {
    return;
  }
  try {
    void fetch('/api/logs/client-error', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Ignore reporting errors when offline
    });
  } catch {
    // Ignore synchronous reporting errors
  }
}

if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (shouldIgnoreClientError(first)) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

window.addEventListener('error', (event) => {
  const message =
    event.error instanceof Error ? event.error.message : String(event.message ?? '');
  reportClientError({
    type: 'error',
    message,
    source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
    stack: event.error instanceof Error ? event.error.stack : undefined,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  const msg =
    event.reason instanceof Error ? event.reason.message : String(event.reason ?? '');
  if (import.meta.env.DEV && shouldIgnoreClientError(msg)) {
    event.preventDefault();
    return;
  }
  reportClientError({
    type: 'unhandledrejection',
    message: msg,
    stack: event.reason instanceof Error ? event.reason.stack : undefined,
  });
});

createRoot(document.getElementById('root')!).render(<App />);
