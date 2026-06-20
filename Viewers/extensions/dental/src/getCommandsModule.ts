import { dentalService } from './DentalService';
import { getPresetById } from './presets';

export default function getCommandsModule({ commandsManager }: withAppTypes) {
  const actions = {
    activateDentalPreset: ({ presetId }: { presetId: string }) => {
      const preset = getPresetById(presetId);
      if (!preset) {
        return;
      }
      dentalService.armPreset(presetId);
      commandsManager.run('setToolActiveToolbar', {
        toolName: preset.toolName,
        toolGroupIds: ['default', 'mpr', 'SRToolGroup', 'volume3d'],
      });
    },
    exportDentalMeasurements: ({ studyUID }: { studyUID?: string } = {}) =>
      dentalService.exportJSON(studyUID),
    clearDentalMeasurements: () => dentalService.clearMeasurements(),
    toggleDentalTheme: () => {
      const theme = dentalService.getState().theme === 'dental' ? 'default' : 'dental';
      dentalService.setState({ theme });
    },
    setToothNumbering: ({ numberingSystem }: { numberingSystem: 'FDI' | 'Universal' }) =>
      dentalService.setState({ numberingSystem }),
    loadDentalState: () => dentalService.loadFromBackend(),
  };

  return {
    actions,
    definitions: {
      activateDentalPreset: { commandFn: actions.activateDentalPreset },
      exportDentalMeasurements: { commandFn: actions.exportDentalMeasurements },
      clearDentalMeasurements: { commandFn: actions.clearDentalMeasurements },
      toggleDentalTheme: { commandFn: actions.toggleDentalTheme },
      setToothNumbering: { commandFn: actions.setToothNumbering },
      loadDentalState: { commandFn: actions.loadDentalState },
    },
    defaultContext: 'DEFAULT',
  };
}
