import ToothSelector from './components/ToothSelector';
import ThemeToggle from './components/ThemeToggle';
import MeasurementsButton from './components/MeasurementsButton';
import LogoutButton from './components/LogoutButton';
import './components/dental.css';

export default function getToolbarModule() {
  return [
    { name: 'dental.toothSelector', defaultComponent: ToothSelector },
    { name: 'dental.themeToggle', defaultComponent: ThemeToggle },
    { name: 'dental.measurements', defaultComponent: MeasurementsButton },
    { name: 'dental.logout', defaultComponent: LogoutButton },
  ];
}
