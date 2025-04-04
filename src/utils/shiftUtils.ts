import { Shift, Employee, ShiftAssignment, ShiftRole } from '../types';
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
    parseInt(dayAvailability.start?.split(':')[0] ?? '0'),
    parseInt(dayAvailability.start?.split(':')[1] ?? '0')
  );

  const availabilityEnd = new Date(shiftEnd);
  availabilityEnd.setHours(
    parseInt(dayAvailability.end?.split(':')[0] ?? '23'),
    parseInt(dayAvailability.end?.split(':')[1] ?? '59')
  );

  return isOverlapping(shiftStart, shiftEnd, availabilityStart, availabilityEnd);
};

export const checkShiftConflicts = (
  assignments: ShiftAssignment[],
  employeeId: string,
  shiftStart: Date,
  shiftEnd: Date,
  shifts: Shift[]
): boolean => {
  return assignments.some((assignment) => {
    if (assignment.employeeId !== employeeId) return false;
    if (assignment.status === 'cancelled') return false;

    // Only check for conflicts on the same day
    const assignmentDate = new Date(assignment.date);
    const newDate = new Date(shiftStart);
    if (assignmentDate.toDateString() !== newDate.toDateString()) return false;

    // Get the shift details for the existing assignment
    const existingShift = shifts.find(s => s.id === assignment.shiftId);
    if (!existingShift) return false;

    // Create Date objects for the existing shift's start and end times
    const assignmentStart = new Date(assignment.date);
    const [startHours, startMinutes] = existingShift.startTime.split(':').map(Number);
    assignmentStart.setHours(startHours, startMinutes);

    const assignmentEnd = new Date(assignment.date);
    const [endHours, endMinutes] = existingShift.endTime.split(':').map(Number);
    assignmentEnd.setHours(endHours, endMinutes);

    // Check if the shifts overlap in time
    return isOverlapping(shiftStart, shiftEnd, assignmentStart, assignmentEnd);
  });
};

export const generateShiftColor = (shift: Shift): string => {
  // Generate a consistent color based on shift name
  const hash = shift.name.split('').reduce((acc: number, char: string) => {
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

export const hasRequiredRole = (employee: Employee, shift: Shift): boolean => {
  // If shift has no roles defined, allow assignment
  if (!shift.roles || shift.roles.length === 0) return true;

  // Check if employee has any of the required roles
  return shift.roles.some((shiftRole: ShiftRole) => {
    const employeeRoles = Array.isArray(employee.role) ? employee.role : [employee.role];
    return employeeRoles.includes(shiftRole.roleId);
  });
}; 