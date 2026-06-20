import React from 'react';
import { useDentalState } from '../hooks/useDental';
import { dentalService } from '../DentalService';

export function ThemeToggle() {
  const { theme } = useDentalState();
  const isDental = theme === 'dental';
  return (
    <button
      className="dental-chip"
      onClick={() => dentalService.setState({ theme: isDental ? 'default' : 'dental' })}
      title="Toggle Dental Mode theme"
    >
      {isDental ? '🦷 Dental Mode' : '🌙 Standard'}
    </button>
  );
}

export default ThemeToggle;
