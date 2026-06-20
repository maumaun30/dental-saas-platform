import { ToolbarService } from '@ohif/core';
import { id } from './id';
import {
  ohif,
  extensionDependencies as basicDependencies,
  toolbarSections as basicToolbarSections,
  toolbarButtons as basicToolbarButtons,
  basicLayout,
  basicRoute,
  modeInstance as basicModeInstance,
  mode as basicMode,
} from '@ohif/mode-basic';

const { TOOLBAR_SECTIONS } = ToolbarService;

const dentalButtons = [
  { id: 'dentalMeasurements', uiType: 'dental.measurements', props: {} },
  { id: 'dentalToothSelector', uiType: 'dental.toothSelector', props: {} },
  { id: 'dentalThemeToggle', uiType: 'dental.themeToggle', props: {} },
  { id: 'dentalLogout', uiType: 'dental.logout', props: {} },
];

const toolbarButtons = [...basicToolbarButtons, ...dentalButtons];

const toolbarSections = {
  ...basicToolbarSections,
  [TOOLBAR_SECTIONS.primary]: [
    'dentalMeasurements',
    'MeasurementTools',
    'Zoom',
    'Pan',
    'WindowLevel',
    'Layout',
    'MoreTools',
    'dentalToothSelector',
    'dentalThemeToggle',
    'dentalLogout',
  ],
};

export const extensionDependencies = {
  ...basicDependencies,
  '@ohif/extension-dental': '3.12.4',
};

const dentalPanel = '@ohif/extension-dental.panelModule.dentalMeasurements';

const dentalLayout = {
  ...basicLayout,
  props: {
    ...basicLayout.props,
    leftPanels: [ohif.thumbnailList],
    rightPanels: [dentalPanel],
    rightPanelClosed: false,
  },
};

const dentalRoute = {
  ...basicRoute,
  path: 'dental',
  layoutInstance: dentalLayout,
};

function onModeEnter(this: any, args: any) {
  basicModeInstance.onModeEnter.call(this, args);
  args.commandsManager.run('loadDentalState');
}

const modeInstance = {
  ...basicModeInstance,
  id,
  routeName: 'dental',
  displayName: 'Dental Mode',
  hide: false,
  routes: [dentalRoute],
  extensions: extensionDependencies,
  hangingProtocol: 'dental2x2',
  toolbarButtons,
  toolbarSections,
  onModeEnter,
};

const mode = {
  ...basicMode,
  id,
  modeInstance,
  extensionDependencies,
};

export default mode;
