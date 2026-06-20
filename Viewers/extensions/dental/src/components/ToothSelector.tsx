import React, { useState } from 'react';
import { useDentalState } from '../hooks/useDental';
import { dentalService } from '../DentalService';
import { TEETH, toothLabel, NumberingSystem } from '../teeth';

export function ToothSelector() {
  const { numberingSystem, selectedTooth, theme } = useDentalState();
  const [open, setOpen] = useState(false);

  if (theme !== 'dental') {
    return null;
  }

  const setNumbering = (sys: NumberingSystem) => dentalService.setState({ numberingSystem: sys });
  const pick = (fdi: number) =>
    dentalService.setState({ selectedTooth: selectedTooth === fdi ? null : fdi });

  return (
    <div style={{ position: 'relative' }}>
      <button className="dental-chip" onClick={() => setOpen(o => !o)} title="Select tooth">
        🦷 Tooth: <strong className="dental-accent">{toothLabel(selectedTooth, numberingSystem)}</strong>
        <span style={{ opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <div className="dental-popover" style={{ left: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#93a1b0' }}>Numbering</span>
            <div className="dental-seg">
              {(['FDI', 'Universal'] as NumberingSystem[]).map(sys => (
                <button
                  key={sys}
                  className={numberingSystem === sys ? 'active' : ''}
                  onClick={() => setNumbering(sys)}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 10, color: '#93a1b0', textTransform: 'uppercase', margin: '6px 0 3px' }}>
            Upper arch
          </div>
          <div className="dental-tooth-grid">
            {TEETH.upper.map(t => (
              <button
                key={t.fdi}
                className={`dental-tooth-btn ${selectedTooth === t.fdi ? 'selected' : ''}`}
                onClick={() => pick(t.fdi)}
                title={`FDI ${t.fdi} · Universal ${t.universal}`}
              >
                {toothLabel(t.fdi, numberingSystem)}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 10, color: '#93a1b0', textTransform: 'uppercase', margin: '8px 0 3px' }}>
            Lower arch
          </div>
          <div className="dental-tooth-grid">
            {TEETH.lower.map(t => (
              <button
                key={t.fdi}
                className={`dental-tooth-btn ${selectedTooth === t.fdi ? 'selected' : ''}`}
                onClick={() => pick(t.fdi)}
                title={`FDI ${t.fdi} · Universal ${t.universal}`}
              >
                {toothLabel(t.fdi, numberingSystem)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ToothSelector;
