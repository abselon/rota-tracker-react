import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { WeeklySchedule, ShiftAssignment } from '../types';
import { getWeekDates, formatDate } from '../utils/dateUtils';

export function useWeeklySchedule() {
  const { state, dispatch } = useAppContext();

  const getScheduleForWeek = useCallback(
    (date: Date) => {
      const weekStart = getWeekDates(date)[0];
      return state.schedules.find(
        (schedule) =>
          formatDate(new Date(schedule.weekStart)) === formatDate(weekStart)
      );
    },
    [state.schedules]
  );

  const createWeeklySchedule = useCallback(
    (date: Date) => {
      const weekDates = getWeekDates(date);
      const weekStart = weekDates[0];
      const weekEnd = weekDates[weekDates.length - 1];

      const newSchedule: WeeklySchedule = {
        id: `schedule-${formatDate(weekStart)}`,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        shifts: {},
      };

      dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
      return newSchedule;
    },
    [dispatch]
  );

  const updateWeeklySchedule = useCallback(
    (schedule: WeeklySchedule) => {
      dispatch({ type: 'UPDATE_SCHEDULE', payload: schedule });
    },
    [dispatch]
  );

  const deleteWeeklySchedule = useCallback(
    (scheduleId: string) => {
      dispatch({ type: 'DELETE_SCHEDULE', payload: scheduleId });
    },
    [dispatch]
  );

  const addShiftToSchedule = useCallback(
    (scheduleId: string, date: Date, assignment: ShiftAssignment) => {
      const schedule = state.schedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const dateString = formatDate(date);
      const updatedSchedule = {
        ...schedule,
        shifts: {
          ...schedule.shifts,
          [dateString]: [...(schedule.shifts[dateString] || []), assignment],
        },
      };

      dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
    },
    [dispatch, state.schedules]
  );

  const removeShiftFromSchedule = useCallback(
    (scheduleId: string, date: Date, assignmentId: string) => {
      const schedule = state.schedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const dateString = formatDate(date);
      const updatedSchedule = {
        ...schedule,
        shifts: {
          ...schedule.shifts,
          [dateString]: schedule.shifts[dateString]?.filter(
            (assignment) => assignment.id !== assignmentId
          ) || [],
        },
      };

      dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
    },
    [dispatch, state.schedules]
  );

  const getShiftsForDate = useCallback(
    (scheduleId: string, date: Date) => {
      const schedule = state.schedules.find((s) => s.id === scheduleId);
      if (!schedule) return [];

      const dateString = formatDate(date);
      return schedule.shifts[dateString] || [];
    },
    [state.schedules]
  );

  const copyScheduleToNextWeek = useCallback(
    (scheduleId: string) => {
      const schedule = state.schedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const nextWeekStart = new Date(schedule.weekStart);
      const nextWeekEnd = new Date(schedule.weekEnd);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

      const newSchedule: WeeklySchedule = {
        id: `schedule-${formatDate(nextWeekStart)}`,
        weekStart: nextWeekStart.toISOString(),
        weekEnd: nextWeekEnd.toISOString(),
        shifts: {},
      };

      // Copy shifts with updated dates
      Object.entries(schedule.shifts).forEach(([dateString, assignments]) => {
        const oldDate = new Date(dateString);
        const newDate = new Date(oldDate);
        newDate.setDate(newDate.getDate() + 7);

        newSchedule.shifts[formatDate(newDate)] = assignments.map((assignment) => ({
          ...assignment,
          id: `${assignment.id}-copy`,
          date: newDate.toISOString(),
        }));
      });

      dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
      return newSchedule;
    },
    [dispatch, state.schedules]
  );

  return {
    schedules: state.schedules,
    getScheduleForWeek,
    createWeeklySchedule,
    updateWeeklySchedule,
    deleteWeeklySchedule,
    addShiftToSchedule,
    removeShiftFromSchedule,
    getShiftsForDate,
    copyScheduleToNextWeek,
  };
} 