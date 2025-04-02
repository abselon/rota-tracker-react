import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Employee, Shift, ShiftAssignment } from '../types';
import { checkShiftConflicts, checkEmployeeAvailability } from '../utils/shiftUtils';

interface ValidationError {
  field: string;
  message: string;
}

export function useValidation() {
  const { state } = useAppContext();

  const validateShift = useCallback((shift: Shift): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!shift.name) {
      errors.push({ field: 'name', message: 'Shift name is required' });
    }

    if (!shift.startTime) {
      errors.push({ field: 'startTime', message: 'Start time is required' });
    }

    if (!shift.endTime) {
      errors.push({ field: 'endTime', message: 'End time is required' });
    }

    if (shift.duration <= 0) {
      errors.push({ field: 'duration', message: 'Duration must be greater than 0' });
    }

    if (shift.requiredEmployees <= 0) {
      errors.push({ field: 'requiredEmployees', message: 'Required employees must be greater than 0' });
    }

    return errors;
  }, []);

  const validateEmployee = useCallback((employee: Employee): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!employee.name) {
      errors.push({ field: 'name', message: 'Employee name is required' });
    }

    if (!employee.email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(employee.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (!employee.phone) {
      errors.push({ field: 'phone', message: 'Phone number is required' });
    }

    if (!employee.role) {
      errors.push({ field: 'role', message: 'Role is required' });
    }

    return errors;
  }, []);

  const validateAssignment = useCallback((assignment: ShiftAssignment): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!assignment.employeeId) {
      errors.push({ field: 'employeeId', message: 'Employee is required' });
    }

    if (!assignment.shiftId) {
      errors.push({ field: 'shiftId', message: 'Shift is required' });
    }

    if (!assignment.date) {
      errors.push({ field: 'date', message: 'Date is required' });
    }

    // Check for conflicts
    const shift = state.shifts.find(s => s.id === assignment.shiftId);
    if (shift) {
      // Convert string times to Date objects for validation
      const startTime = new Date();
      const [startHours, startMinutes] = shift.startTime.split(':').map(Number);
      startTime.setHours(startHours, startMinutes);

      const endTime = new Date();
      const [endHours, endMinutes] = shift.endTime.split(':').map(Number);
      endTime.setHours(endHours, endMinutes);

      if (checkShiftConflicts(
        state.assignments,
        assignment.employeeId,
        startTime,
        endTime,
        state.shifts
      )) {
        errors.push({ field: 'conflict', message: 'Employee has a conflicting shift' });
      }

      // Check employee availability
      const employee = state.employees.find(e => e.id === assignment.employeeId);
      if (employee && !checkEmployeeAvailability(
        employee,
        startTime,
        endTime
      )) {
        errors.push({ field: 'availability', message: 'Employee is not available during this time' });
      }
    }

    return errors;
  }, [state.shifts, state.assignments, state.employees]);

  const validateBusinessHours = useCallback(
    (hours: { openTime: string; closeTime: string; isClosed: boolean }) => {
      const errors: ValidationError[] = [];

      if (!hours.isClosed) {
        if (!hours.openTime) {
          errors.push({
            field: 'openTime',
            message: 'Open time is required when business is open',
          });
        }

        if (!hours.closeTime) {
          errors.push({
            field: 'closeTime',
            message: 'Close time is required when business is open',
          });
        }

        if (hours.openTime && hours.closeTime) {
          const [openHour, openMinute] = hours.openTime.split(':').map(Number);
          const [closeHour, closeMinute] = hours.closeTime.split(':').map(Number);

          if (openHour > closeHour || (openHour === closeHour && openMinute >= closeMinute)) {
            errors.push({
              field: 'closeTime',
              message: 'Close time must be after open time',
            });
          }
        }
      }

      return errors;
    },
    []
  );

  return {
    validateShift,
    validateEmployee,
    validateAssignment,
    validateBusinessHours,
  };
} 