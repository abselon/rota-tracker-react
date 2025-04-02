import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'yyyy-MM-dd HH:mm');
};

export const getWeekDates = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const days = [];

  let currentDate = start;
  while (currentDate <= end) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return days;
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

export const parseDateString = (dateString: string): Date => {
  return parseISO(dateString);
};

export const calculateShiftDuration = (startTime: Date, endTime: Date): number => {
  const diffInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  return Math.round(diffInHours * 10) / 10; // Round to 1 decimal place
};

export const isOverlapping = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && start2 < end1;
};

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const formatWeekRange = (startDate: Date, endDate: Date): string => {
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
}; 