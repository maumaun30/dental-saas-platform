import { id } from './id';
import getPanelModule from './getPanelModule';
import getToolbarModule from './getToolbarModule';
import getCommandsModule from './getCommandsModule';
import getHangingProtocolModule from './getHangingProtocolModule';
import { dentalService } from './DentalService';
import { mountAuthGate } from './auth/mountAuthGate';
import './components/dental.css';

const dentalExtension = {
  id,

  preRegistration({ servicesManager }: withAppTypes) {
    dentalService.init(servicesManager);
    mountAuthGate(() => dentalService.loadFromBackend());
  },

  getToolbarModule,
  getPanelModule,
  getCommandsModule,
  getHangingProtocolModule,
};

export default dentalExtension;
