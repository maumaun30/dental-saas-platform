import React, { useState } from 'react';
import { useSystem } from '@ohif/core';
import { useDentalState } from '../hooks/useDental';
import { dentalService } from '../DentalService';
import { MEASUREMENT_PRESETS } from '../presets';
import { toothLabel } from '../teeth';

export function MeasurementsButton() {
  const { commandsManager } = useSystem();
  const { selectedTooth, numberingSystem, armedPresetId, theme } = useDentalState();
  const [open, setOpen] = useState(false);

  if (theme !== 'dental') {
    return null;
  }

  const choose = (presetId: string, toolName: string) => {
    dentalService.armPreset(presetId);
    commandsManager.run('setToolActiveToolbar', {
      toolName,
      toolGroupIds: ['default', 'mpr', 'SRToolGroup', 'volume3d'],
    });
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="dental-chip"
        style={{
          background: 'var(--dental-accent, #3a8dde)',
          color: 'var(--dental-accent-contrast, #042b25)',
          borderColor: 'var(--dental-accent, #3a8dde)',
          fontWeight: 600,
        }}
        onClick={() => setOpen(o => !o)}
        title="Dental measurement presets"
      >
        🦷 Measurements ▾
      </button>

      {open && (
        <div className="dental-popover" style={{ right: 0 }}>
          <div style={{ fontSize: 12, color: '#93a1b0', padding: '2px 4px 8px' }}>
            Measurement presets
          </div>
          {MEASUREMENT_PRESETS.map(p => (
            <button
              key={p.id}
              className="dental-preset-btn"
              onClick={() => choose(p.id, p.toolName)}
              style={armedPresetId === p.id ? { borderColor: 'var(--dental-accent, #3a8dde)' } : undefined}
            >
              <span className="dental-preset-icon">{p.icon}</span>
              <span>
                <div style={{ fontWeight: 600 }}>
                  {p.name} <span style={{ opacity: 0.6 }}>({p.unit})</span>
                </div>
                <div style={{ fontSize: 11, color: '#93a1b0' }}>{p.description}</div>
              </span>
            </button>
          ))}
          <div style={{ fontSize: 11, color: '#93a1b0', padding: '6px 4px 2px' }}>
            Tagged to tooth{' '}
            <strong className="dental-accent">{toothLabel(selectedTooth, numberingSystem)}</strong>. Pick a
            preset, then draw on an image.
          </div>
        </div>
      )}
    </div>
  );
}

export default MeasurementsButton;
