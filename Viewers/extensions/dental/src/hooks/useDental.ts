import { useEffect, useState } from 'react';
import { dentalService, DentalMeasurement } from '../DentalService';

export function useDentalState() {
  const [state, setState] = useState(dentalService.getState());
  useEffect(() => {
    const sub = dentalService.subscribe(dentalService.EVENTS.STATE_CHANGED, setState);
    setState(dentalService.getState());
    return () => sub.unsubscribe();
  }, []);
  return state;
}

export function useDentalMeasurements(studyUID?: string): DentalMeasurement[] {
  const [items, setItems] = useState<DentalMeasurement[]>(() =>
    dentalService.getDentalMeasurements(studyUID)
  );
  useEffect(() => {
    const refresh = () => setItems(dentalService.getDentalMeasurements(studyUID));
    const sub = dentalService.subscribe(dentalService.EVENTS.MEASUREMENTS_CHANGED, refresh);
    refresh();
    return () => sub.unsubscribe();
  }, [studyUID]);
  return items;
}
