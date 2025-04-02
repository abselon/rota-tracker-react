import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { BusinessHours } from '../types';

export function useBusinessHours() {
  const { state, dispatch } = useAppContext();

  const getBusinessHoursForDay = useCallback(
    (dayOfWeek: number) => {
      return state.businessHours.find((hours) => hours.dayOfWeek === dayOfWeek);
    },
    [state.businessHours]
  );

  const updateBusinessHours = useCallback(
    (hours: BusinessHours) => {
      dispatch({ type: 'UPDATE_BUSINESS_HOURS', payload: hours });
    },
    [dispatch]
  );

  const setBusinessHours = useCallback(
    (hours: BusinessHours[]) => {
      dispatch({ type: 'SET_BUSINESS_HOURS', payload: hours });
    },
    [dispatch]
  );

  const isBusinessOpen = useCallback(
    (date: Date) => {
      const dayOfWeek = date.getDay();
      const hours = getBusinessHoursForDay(dayOfWeek);
      if (!hours || hours.isOpen === false) return false;

      const currentTime = date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

      return currentTime >= (hours.openTime ?? '00:00') && 
             currentTime <= (hours.closeTime ?? '23:59');
    },
    [getBusinessHoursForDay]
  );

  const getNextOpenTime = useCallback(
    (date: Date) => {
      let currentDate = new Date(date);
      let attempts = 0;
      const maxAttempts = 7; // Prevent infinite loop

      while (attempts < maxAttempts) {
        const dayOfWeek = currentDate.getDay();
        const hours = getBusinessHoursForDay(dayOfWeek);

        if (hours && hours.isOpen !== false && hours.openTime) {
          const [openHour, openMinute] = hours.openTime.split(':').map(Number);
          const openTime = new Date(currentDate);
          openTime.setHours(openHour, openMinute, 0, 0);

          if (currentDate < openTime) {
            return openTime;
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
        attempts++;
      }

      return null;
    },
    [getBusinessHoursForDay]
  );

  return {
    businessHours: state.businessHours,
    getBusinessHoursForDay,
    updateBusinessHours,
    setBusinessHours,
    isBusinessOpen,
    getNextOpenTime,
  };
} 