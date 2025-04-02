import { Shift, Employee, ShiftAssignment } from '../types';
import { isOverlapping, calculateShiftDuration } from './dateUtils';

export const validateShiftTimes = (startTime: Date, endTime: Date): boolean => {
  return startTime < endTime;
};

export const checkEmployeeAvailability = (
  employee: Employee,
  shiftStart: Date,
  shiftEnd: Date
): boolean => {
  if (!employee.availability) return true;

  const dayOfWeek = shiftStart.getDay();
  const dayAvailability = employee.availability[dayOfWeek];

  if (!dayAvailability || dayAvailability.isClosed) return false;

  const availabilityStart = new Date(shiftStart);
  availabilityStart.setHours(
    parseInt(dayAvailability.startTime?.split(':')[0] ?? '0'),
    parseInt(dayAvailability.startTime?.split(':')[1] ?? '0')
  );

  const availabilityEnd = new Date(shiftEnd);
  availabilityEnd.setHours(
    parseInt(dayAvailability.endTime?.split(':')[0] ?? '23'),
    parseInt(dayAvailability.endTime?.split(':')[1] ?? '59')
  );

  return isOverlapping(shiftStart, shiftEnd, availabilityStart, availabilityEnd);
};

export const checkShiftConflicts = (
  assignments: ShiftAssignment[],
  employeeId: string,
  shiftStart: Date,
  shiftEnd: Date
): boolean => {
  return assignments.some((assignment) => {
    if (assignment.employeeId !== employeeId) return false;
    if (assignment.status === 'cancelled') return false;

    const assignmentStart = new Date(assignment.date);
    assignmentStart.setHours(
      new Date(assignment.shiftId).getHours(),
      new Date(assignment.shiftId).getMinutes()
    );

    const assignmentEnd = new Date(assignmentStart);
    assignmentEnd.setHours(assignmentEnd.getHours() + calculateShiftDuration(assignmentStart, new Date(assignment.shiftId)));

    return isOverlapping(shiftStart, shiftEnd, assignmentStart, assignmentEnd);
  });
};

export const generateShiftColor = (shift: Shift): string => {
  // Generate a consistent color based on shift name
  const hash = shift.name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

export const calculateTotalHours = (assignments: ShiftAssignment[]): number => {
  return assignments.reduce((total, assignment) => {
    if (assignment.status === 'cancelled') return total;
    return total + calculateShiftDuration(
      new Date(assignment.date),
      new Date(assignment.shiftId)
    );
  }, 0);
};

export const getShiftStatus = (assignment: ShiftAssignment): 'scheduled' | 'in-progress' | 'completed' | 'cancelled' => {
  const now = new Date();
  const shiftStart = new Date(assignment.date);
  const shiftEnd = new Date(shiftStart);
  shiftEnd.setHours(shiftEnd.getHours() + calculateShiftDuration(shiftStart, new Date(assignment.shiftId)));

  if (assignment.status === 'cancelled') return 'cancelled';
  if (now < shiftStart) return 'scheduled';
  if (now > shiftEnd) return 'completed';
  return 'in-progress';
}; 