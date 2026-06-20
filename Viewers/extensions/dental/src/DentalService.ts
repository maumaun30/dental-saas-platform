import { dentalApi, userStore } from './dentalApi';
import { getPresetById, DentalPreset } from './presets';
import type { NumberingSystem } from './teeth';

type DentalState = {
  theme: 'dental' | 'default';
  numberingSystem: NumberingSystem;
  selectedTooth: number | null;
  armedPresetId: string | null;
  activeStudyUID: string | null;
};

type DentalSideData = {
  presetId: string | null;
  label: string;
  tooth: number | null;
  numberingSystem: NumberingSystem;
};

export type DentalMeasurement = {
  uid: string;
  label: string;
  toolName: string;
  value: number;
  unit: string;
  displayText: string;
  tooth: number | null;
  numberingSystem: NumberingSystem;
  presetId: string | null;
  studyUID: string | null;
  createdAt: string;
};

const NUMERIC_RE = /(-?\d+(?:\.\d+)?)\s*(mm|cm|°|deg|degrees)?/i;

class DentalService {
  public EVENTS = { STATE_CHANGED: 'dental:state', MEASUREMENTS_CHANGED: 'dental:measurements' };

  private state: DentalState = {
    theme: 'dental',
    numberingSystem: 'FDI',
    selectedTooth: null,
    armedPresetId: null,
    activeStudyUID: null,
  };

  private listeners = new Map<string, Set<(p: any) => void>>();
  private sideData = new Map<string, DentalSideData>();
  private servicesManager: any = null;
  private measurementService: any = null;
  private createdAt = new Map<string, string>();
  private saveTimer: any = null;
  private bound = false;

  subscribe(event: string, cb: (p: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
    return { unsubscribe: () => this.listeners.get(event)?.delete(cb) };
  }

  private emit(event: string, payload?: any) {
    this.listeners.get(event)?.forEach(cb => {
      try {
        cb(payload);
      } catch (e) {
        console.error('[DentalService] listener error', e);
      }
    });
  }

  getState() {
    return { ...this.state };
  }

  setState(patch: Partial<DentalState>, persist = true) {
    this.state = { ...this.state, ...patch };
    if ('theme' in patch) {
      document.documentElement.setAttribute('data-dental-theme', this.state.theme);
    }
    this.emit(this.EVENTS.STATE_CHANGED, this.getState());
    if (persist) {
      this.scheduleSave();
    }
  }

  armPreset(presetId: string | null) {
    this.setState({ armedPresetId: presetId }, false);
  }

  getArmedPreset(): DentalPreset | undefined {
    return this.state.armedPresetId ? getPresetById(this.state.armedPresetId) : undefined;
  }

  init(servicesManager: any) {
    this.servicesManager = servicesManager;
    this.measurementService = servicesManager.services.measurementService;
    document.documentElement.setAttribute('data-dental-theme', this.state.theme);

    if (this.bound || !this.measurementService) {
      return;
    }
    const M = this.measurementService;
    M.subscribe(M.EVENTS.MEASUREMENT_ADDED, ({ measurement }: any) => this.onMeasurementAdded(measurement));
    M.subscribe(M.EVENTS.RAW_MEASUREMENT_ADDED, ({ measurement }: any) => this.onMeasurementAdded(measurement));
    M.subscribe(M.EVENTS.MEASUREMENT_UPDATED, () => this.emit(this.EVENTS.MEASUREMENTS_CHANGED));
    M.subscribe(M.EVENTS.MEASUREMENT_REMOVED, () => this.emit(this.EVENTS.MEASUREMENTS_CHANGED));
    M.subscribe(M.EVENTS.MEASUREMENTS_CLEARED, () => {
      this.sideData.clear();
      this.emit(this.EVENTS.MEASUREMENTS_CHANGED);
    });
    this.bound = true;
  }

  private onMeasurementAdded(measurement: any) {
    if (!measurement?.uid) {
      return;
    }
    const preset = this.getArmedPreset();
    const matches = preset && measurement.toolName === preset.toolName;

    this.createdAt.set(measurement.uid, this.createdAt.get(measurement.uid) || new Date().toISOString());

    if (matches && !this.sideData.has(measurement.uid)) {
      this.sideData.set(measurement.uid, {
        presetId: preset!.id,
        label: preset!.label,
        tooth: this.state.selectedTooth,
        numberingSystem: this.state.numberingSystem,
      });
      try {
        this.measurementService.update(
          measurement.uid,
          { ...measurement, label: preset!.label },
          true
        );
      } catch {
        void 0;
      }
    }
    this.emit(this.EVENTS.MEASUREMENTS_CHANGED);
  }

  private parseValue(measurement: any): { value: number; unit: string; text: string } {
    const dt = measurement.displayText;
    let text = '';
    if (Array.isArray(dt)) {
      text = dt.join(' ');
    } else if (dt && typeof dt === 'object') {
      text = [...(dt.primary || []), ...(dt.secondary || [])].join(' ');
    } else if (typeof dt === 'string') {
      text = dt;
    }
    const m = text.match(NUMERIC_RE);
    const value = m ? parseFloat(m[1]) : 0;
    let unit = m?.[2] || '';
    if (/deg|degrees/i.test(unit)) {
      unit = '°';
    }
    if (!unit) {
      unit = measurement.toolName === 'Angle' ? '°' : 'mm';
    }
    return { value, unit, text: text.trim() };
  }

  getDentalMeasurements(studyUID?: string): DentalMeasurement[] {
    if (!this.measurementService) {
      return [];
    }
    const all = this.measurementService.getMeasurements() || [];
    return all
      .filter((m: any) => m.toolName === 'Length' || m.toolName === 'Angle')
      .map((m: any) => {
        const side = this.sideData.get(m.uid);
        const { value, unit, text } = this.parseValue(m);
        return {
          uid: m.uid,
          label: side?.label || m.label || m.toolName,
          toolName: m.toolName,
          value,
          unit,
          displayText: text,
          tooth: side?.tooth ?? null,
          numberingSystem: side?.numberingSystem ?? this.state.numberingSystem,
          presetId: side?.presetId ?? null,
          studyUID: m.referenceStudyUID || this.state.activeStudyUID || null,
          createdAt: this.createdAt.get(m.uid) || new Date().toISOString(),
        } as DentalMeasurement;
      });
  }

  removeMeasurement(uid: string) {
    try {
      this.measurementService?.remove(uid);
    } catch {
      void 0;
    }
    this.sideData.delete(uid);
    this.emit(this.EVENTS.MEASUREMENTS_CHANGED);
  }

  clearMeasurements() {
    try {
      this.measurementService?.clearMeasurements();
    } catch {
      void 0;
    }
    this.sideData.clear();
    this.emit(this.EVENTS.MEASUREMENTS_CHANGED);
  }

  buildExportPayload(studyUID?: string) {
    const user = userStore.get();
    const items = this.getDentalMeasurements(studyUID);
    return {
      schema: 'dental-measurements/v1',
      exportedAt: new Date().toISOString(),
      studyUID: studyUID || this.state.activeStudyUID,
      practice: user?.practiceName,
      clinician: user?.name,
      count: items.length,
      measurements: items.map(m => ({
        label: m.label,
        value: m.value,
        unit: m.unit,
        tooth: m.tooth,
        numberingSystem: m.numberingSystem,
        presetId: m.presetId,
        tool: m.toolName,
        createdAt: m.createdAt,
      })),
    };
  }

  exportJSON(studyUID?: string) {
    const payload = this.buildExportPayload(studyUID);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dental-measurements-${payload.studyUID || 'study'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return payload;
  }

  async loadFromBackend() {
    try {
      const { state } = await dentalApi.getViewerState();
      if (state) {
        this.setState(
          {
            theme: state.theme ?? this.state.theme,
            numberingSystem: state.numberingSystem ?? this.state.numberingSystem,
            selectedTooth: state.selectedTooth ?? this.state.selectedTooth,
          },
          false
        );
      }
    } catch (e) {
      console.warn('[DentalService] could not load viewer state', e);
    }
  }

  private scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      dentalApi
        .saveViewerState({
          theme: this.state.theme,
          numberingSystem: this.state.numberingSystem,
          selectedTooth: this.state.selectedTooth,
          activeStudyUID: this.state.activeStudyUID,
        })
        .catch(e => console.warn('[DentalService] save viewer state failed', e));
    }, 600);
  }

  async saveMeasurements(studyUID: string) {
    const items = this.getDentalMeasurements(studyUID);
    await dentalApi.replaceMeasurements(studyUID, items);
    return items.length;
  }
}

export const dentalService = new DentalService();
