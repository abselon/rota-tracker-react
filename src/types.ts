export interface ShiftRole {
  roleId: string;
  count: number;
  duration: number;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;  // Store as HH:mm format
  endTime: string;    // Store as HH:mm format
  duration: number;
  requiredEmployees: number;
  color: string;
  isOvernight: boolean;
  roles: ShiftRole[];  // Array of roles with their counts and durations
}

export interface Employee {
  id: string;
  name: string;
  role: string | string[];  // Changed to support both single role and multiple roles
  email: string;
  phone: string;
  availability: Record<string, AvailabilityDay>;
  preferences: {
    preferredShifts: string[];
    preferredDays: string[];
    maxHoursPerWeek: number;
    minHoursPerWeek: number;
  };
  skills: string[];
  notes: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityDay {
  start: string;
  end: string;
  isClosed: boolean;
}

export interface ShiftAssignment {
  id: string;
  date: string; // Assuming date is stored as a string
  employeeId: string;
  shiftId: string;
  status: string;
  color?: string; // Add this line to include color
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

export interface EmployeeInsights {
  employeeId: string;
  totalHours: {
    weekly: number;
    monthly: number;
    custom: number;
  };
  completedHours: {
    weekly: number;
    monthly: number;
    custom: number;
  };
  futureHours: {
    weekly: number;
    monthly: number;
    custom: number;
  };
  shiftBreakdown: {
    [shiftId: string]: {
      name: string;
      hours: number;
      completed: number;
      upcoming: number;
    };
  };
  lastUpdated: string;
}

export interface Role {
  id: string;
  name: string;
  icon: string;  // Material-UI icon name
  color: string;
  description?: string;
} 