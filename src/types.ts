export interface Shift {
  id: string;
  name: string;
  startTime: string;  // Store as HH:mm format
  endTime: string;    // Store as HH:mm format
  duration: number;
  requiredEmployees: number;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  availability: Record<string, AvailabilityDay>;
  color: string;
}

export interface AvailabilityDay {
  isClosed: boolean;
  startTime?: string;
  endTime?: string;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  date: string; // ISO date string
  status: 'pending' | 'completed' | 'cancelled';
}

export interface WeeklySchedule {
  id: string;
  weekStart: string; // ISO date string
  shifts: Record<string, ShiftAssignment[]>;
}

export interface BusinessHours {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime?: string; // HH:mm format
  closeTime?: string; // HH:mm format
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string; // HH:mm format
  closeTime?: string; // HH:mm format
} 