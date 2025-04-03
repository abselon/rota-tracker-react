export interface DayAvailability {
  isClosed: boolean;
  startTime: string;
  endTime: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  color?: string;
  availability: {
    [key: number]: DayAvailability;
  };
  shifts?: ShiftAssignment[];
}

export interface Shift {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  requiredEmployees: number;
  color?: string;
  assignedEmployees?: string[];
}

export interface WeeklySchedule {
  id: string;
  weekStart: Date;
  weekEnd: Date;
  shifts: {
    [date: string]: ShiftAssignment[];
  };
}

export interface BusinessHours {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  employeeId: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled';
  notes?: string;
} 