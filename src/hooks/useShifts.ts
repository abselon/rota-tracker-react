import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Shift, ShiftAssignment } from '../types';
import { checkShiftConflicts, validateShiftTimes } from '../utils/shiftUtils';

export function useShifts() {
  const { state, dispatch } = useAppContext();

  const addShift = useCallback((shift: Shift) => {
    dispatch({ type: 'ADD_SHIFT', payload: shift });
  }, [dispatch]);

  const updateShift = useCallback((shift: Shift) => {
    dispatch({ type: 'UPDATE_SHIFT', payload: shift });
  }, [dispatch]);

  const deleteShift = useCallback((shiftId: string) => {
    dispatch({ type: 'DELETE_SHIFT', payload: shiftId });
  }, [dispatch]);

  const getShiftById = useCallback(
    (shiftId: string) => {
      return state.shifts.find((shift) => shift.id === shiftId);
    },
    [state.shifts]
  );

  const getShiftsForDate = useCallback(
    (date: Date) => {
      const dateString = date.toISOString().split('T')[0];
      return state.assignments.filter((assignment) => {
        const assignmentDate = new Date(assignment.date).toISOString().split('T')[0];
        return assignmentDate === dateString;
      });
    },
    [state.assignments]
  );

  const assignShift = useCallback((assignment: ShiftAssignment) => {
    // Get the shift details
    const shift = state.shifts.find(s => s.id === assignment.shiftId);
    if (!shift) {
      return false;
    }

    // Convert string times to Date objects for validation
    const startTime = new Date();
    const [startHours, startMinutes] = shift.startTime.split(':').map(Number);
    startTime.setHours(startHours, startMinutes);

    const endTime = new Date();
    const [endHours, endMinutes] = shift.endTime.split(':').map(Number);
    endTime.setHours(endHours, endMinutes);

    // Validate shift times
    if (!validateShiftTimes(startTime, endTime)) {
      return false;
    }

    // Check for conflicts
    if (checkShiftConflicts(state.assignments, assignment.employeeId, startTime, endTime, state.shifts)) {
      return false;
    }

    dispatch({ type: 'ADD_ASSIGNMENT', payload: assignment });
    return true;
  }, [dispatch, state.shifts, state.assignments]);

  const updateAssignment = useCallback(
    (assignment: ShiftAssignment) => {
      dispatch({ type: 'UPDATE_ASSIGNMENT', payload: assignment });
    },
    [dispatch]
  );

  const removeAssignment = useCallback((assignmentId: string) => {
    dispatch({ type: 'DELETE_ASSIGNMENT', payload: assignmentId });
  }, [dispatch]);

  const getEmployeeShifts = useCallback(
    (employeeId: string, startDate: Date, endDate: Date) => {
      return state.assignments.filter((assignment) => {
        if (assignment.employeeId !== employeeId) return false;
        const assignmentDate = new Date(assignment.date);
        return assignmentDate >= startDate && assignmentDate <= endDate;
      });
    },
    [state.assignments]
  );

  return {
    shifts: state.shifts,
    assignments: state.assignments,
    addShift,
    updateShift,
    deleteShift,
    getShiftById,
    getShiftsForDate,
    assignShift,
    updateAssignment,
    removeAssignment,
    getEmployeeShifts,
  };
} 