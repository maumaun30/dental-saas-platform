export type DentalPreset = {
  id: string;
  label: string;
  name: string;
  description: string;
  toolName: 'Length' | 'Angle';
  unit: 'mm' | '°';
  icon: string;
};

export const MEASUREMENT_PRESETS: DentalPreset[] = [
  {
    id: 'pa-length',
    label: 'PA length',
    name: 'Periapical length',
    description: 'Distance tool · auto-labeled "PA length"',
    toolName: 'Length',
    unit: 'mm',
    icon: '📏',
  },
  {
    id: 'canal-angle',
    label: 'Canal angle',
    name: 'Canal angle',
    description: 'Angle tool · auto-labeled "Canal angle"',
    toolName: 'Angle',
    unit: '°',
    icon: '📐',
  },
  {
    id: 'crown-width',
    label: 'Crown width',
    name: 'Crown width',
    description: 'Distance tool · mesiodistal crown width',
    toolName: 'Length',
    unit: 'mm',
    icon: '📏',
  },
  {
    id: 'root-length',
    label: 'Root length',
    name: 'Root length',
    description: 'Distance tool · apex-to-CEJ root length',
    toolName: 'Length',
    unit: 'mm',
    icon: '📏',
  },
];

export function getPresetById(id: string): DentalPreset | undefined {
  return MEASUREMENT_PRESETS.find(p => p.id === id);
}
