import { useCallback, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Employee, Shift, ShiftAssignment, WeeklySchedule, BusinessHours } from '../types';

const STORAGE_KEYS = {
  EMPLOYEES: 'rota-tracker-employees',
  SHIFTS: 'rota-tracker-shifts',
  ASSIGNMENTS: 'rota-tracker-assignments',
  SCHEDULES: 'rota-tracker-schedules',
  BUSINESS_HOURS: 'rota-tracker-business-hours',
};

export function useDataPersistence() {
  const { state, dispatch } = useAppContext();

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(state.employees));
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(state.shifts));
      localStorage.setItem(
        STORAGE_KEYS.ASSIGNMENTS,
        JSON.stringify(state.assignments)
      );
      localStorage.setItem(
        STORAGE_KEYS.SCHEDULES,
        JSON.stringify(state.schedules)
      );
      localStorage.setItem(
        STORAGE_KEYS.BUSINESS_HOURS,
        JSON.stringify(state.businessHours)
      );
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [state]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const employees = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]'
      ) as Employee[];
      const shifts = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SHIFTS) || '[]'
      ) as Shift[];
      const assignments = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || '[]'
      ) as ShiftAssignment[];
      const schedules = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SCHEDULES) || '[]'
      ) as WeeklySchedule[];
      const businessHours = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.BUSINESS_HOURS) || '[]'
      ) as BusinessHours[];

      dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      dispatch({ type: 'SET_SHIFTS', payload: shifts });
      dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments });
      dispatch({ type: 'SET_SCHEDULES', payload: schedules });
      dispatch({ type: 'SET_BUSINESS_HOURS', payload: businessHours });
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, [dispatch]);

  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
      localStorage.removeItem(STORAGE_KEYS.SHIFTS);
      localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
      localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
      localStorage.removeItem(STORAGE_KEYS.BUSINESS_HOURS);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);

  const exportData = useCallback(() => {
    try {
      const data = {
        employees: state.employees,
        shifts: state.shifts,
        assignments: state.assignments,
        schedules: state.schedules,
        businessHours: state.businessHours,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rota-tracker-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }, [state]);

  const importData = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          dispatch({ type: 'SET_EMPLOYEES', payload: data.employees });
          dispatch({ type: 'SET_SHIFTS', payload: data.shifts });
          dispatch({ type: 'SET_ASSIGNMENTS', payload: data.assignments });
          dispatch({ type: 'SET_SCHEDULES', payload: data.schedules });
          dispatch({ type: 'SET_BUSINESS_HOURS', payload: data.businessHours });
        } catch (error) {
          console.error('Error importing data:', error);
        }
      };
      reader.readAsText(file);
    },
    [dispatch]
  );

  // Auto-save to localStorage when state changes
  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  // Load data from localStorage on initial mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  return {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    exportData,
    importData,
  };
} 