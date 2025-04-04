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
  color?: string;
  availability: Record<string, DayAvailability>;
  shifts?: ShiftAssignment[];
  preferences?: {
    preferredShifts: string[];
    preferredDays: string[];
    maxHoursPerWeek: number;
    minHoursPerWeek: number;
  };
  skills?: string[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DayAvailability {
  isClosed: boolean;
  start: string;
  end: string;
}

export interface ShiftAssignment {
  id: string;
  date: string; // ISO date string
  employeeId: string;
  shiftId: string;
  startTime: string;  // HH:mm format
  endTime: string;    // HH:mm format
  isOvernight: boolean;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
  roleId: string;  // The role the employee is assigned to for this shift
  notes?: string;
}

export interface WeeklySchedule {
  id: string;
  weekStart: string; // ISO date string
  weekEnd: string; // ISO date string
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