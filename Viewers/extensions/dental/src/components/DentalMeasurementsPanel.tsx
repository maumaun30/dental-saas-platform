import React, { useEffect, useMemo, useState } from 'react';
import { useSystem } from '@ohif/core';
import { useDentalMeasurements } from '../hooks/useDental';
import { dentalService, DentalMeasurement } from '../DentalService';
import { toothLabel } from '../teeth';

type SortKey = 'created' | 'label' | 'value' | 'tooth';

const SORTS: Record<SortKey, (a: DentalMeasurement, b: DentalMeasurement) => number> = {
  created: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  label: (a, b) => a.label.localeCompare(b.label),
  value: (a, b) => b.value - a.value,
  tooth: (a, b) => (a.tooth ?? 999) - (b.tooth ?? 999),
};

export function DentalMeasurementsPanel() {
  const { servicesManager } = useSystem();
  const measurements = useDentalMeasurements();
  const { numberingSystem } = dentalService.getState();

  const [sort, setSort] = useState<SortKey>('created');
  const [filterLabel, setFilterLabel] = useState('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const { displaySetService } = servicesManager.services;
    const active = displaySetService?.getActiveDisplaySets?.() || [];
    const studyUID = active[0]?.StudyInstanceUID || measurements[0]?.studyUID || null;
    if (studyUID) {
      dentalService.setState({ activeStudyUID: studyUID }, false);
    }
  }, [servicesManager, measurements]);

  const labels = useMemo(
    () => ['all', ...Array.from(new Set(measurements.map(m => m.label)))],
    [measurements]
  );

  const visible = useMemo(() => {
    let list = measurements;
    if (filterLabel !== 'all') {
      list = list.filter(m => m.label === filterLabel);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        m =>
          m.label.toLowerCase().includes(q) ||
          String(m.value).includes(q) ||
          String(m.tooth ?? '').includes(q)
      );
    }
    return [...list].sort(SORTS[sort]);
  }, [measurements, filterLabel, query, sort]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const studyUID = dentalService.getState().activeStudyUID || measurements[0]?.studyUID || undefined;

  const onExport = () => {
    if (!measurements.length) {
      return flash('No measurements to export');
    }
    dentalService.exportJSON(studyUID);
    flash('Exported measurements JSON');
  };

  const onSave = async () => {
    if (!studyUID) {
      return flash('No active study');
    }
    try {
      const n = await dentalService.saveMeasurements(studyUID);
      flash(`Saved ${n} measurement${n === 1 ? '' : 's'}`);
    } catch (e: any) {
      flash(e.message || 'Save failed');
    }
  };

  return (
    <div className="dental-panel">
      <div className="dental-panel-controls">
        <input
          className="dental-input"
          placeholder="Search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 80 }}
        />
        <select className="dental-select" value={sort} onChange={e => setSort(e.target.value as SortKey)}>
          <option value="created">Newest</option>
          <option value="label">Label A–Z</option>
          <option value="value">Value ↓</option>
          <option value="tooth">Tooth</option>
        </select>
        <select
          className="dental-select"
          value={filterLabel}
          onChange={e => setFilterLabel(e.target.value)}
        >
          {labels.map(l => (
            <option key={l} value={l}>
              {l === 'all' ? 'All labels' : l}
            </option>
          ))}
        </select>
      </div>

      <div className="dental-list">
        {visible.length === 0 && (
          <div className="dental-empty">
            No measurements yet.
            <br />
            Open <strong>🦷 Measurements</strong>, pick a preset, then draw on an image.
          </div>
        )}
        {visible.map(m => (
          <div className="dental-card" key={m.uid}>
            <div className="row">
              <span style={{ fontWeight: 600 }}>{m.label}</span>
              <span className="m-value">
                {m.value} {m.unit}
              </span>
            </div>
            <div className="m-meta">
              <span>Tooth {toothLabel(m.tooth, numberingSystem)}</span>
              <span>{m.toolName === 'Angle' ? 'Angle tool' : 'Length tool'}</span>
              <button
                onClick={() => dentalService.removeMeasurement(m.uid)}
                title="Delete"
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 0,
                  color: '#93a1b0',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dental-footer">
        <button
          className="dental-btn"
          onClick={() => dentalService.clearMeasurements()}
          disabled={!measurements.length}
        >
          Clear
        </button>
        <button className="dental-btn" onClick={onSave}>
          Save
        </button>
        <button className="dental-btn primary" onClick={onExport} disabled={!measurements.length}>
          Export JSON
        </button>
      </div>

      {toast && (
        <div
          style={{
            position: 'absolute',
            bottom: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0c1117',
            border: '1px solid var(--dental-accent, #3a8dde)',
            borderRadius: 8,
            padding: '8px 14px',
            fontSize: 12,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default DentalMeasurementsPanel;
