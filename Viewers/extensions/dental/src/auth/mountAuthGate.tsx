import React from 'react';
import { createRoot } from 'react-dom/client';
import LoginGate from './LoginGate';

let mounted = false;

export function mountAuthGate(onAuthenticated: () => void) {
  if (mounted) {
    return;
  }
  mounted = true;

  const container = document.createElement('div');
  container.id = 'dental-auth-gate';
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<LoginGate onAuthenticated={onAuthenticated} />);
}
