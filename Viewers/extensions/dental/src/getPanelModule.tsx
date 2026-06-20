import React from 'react';
import DentalMeasurementsPanel from './components/DentalMeasurementsPanel';

function getPanelModule({ commandsManager, extensionManager, servicesManager }: withAppTypes) {
  return [
    {
      name: 'dentalMeasurements',
      iconName: 'tab-linear',
      iconLabel: 'Dental',
      label: 'Dental Measurements',
      component: (props: any) => (
        <DentalMeasurementsPanel
          {...props}
          commandsManager={commandsManager}
          extensionManager={extensionManager}
          servicesManager={servicesManager}
        />
      ),
    },
  ];
}

export default getPanelModule;
