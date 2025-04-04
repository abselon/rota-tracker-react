export interface DayAvailability {
  isClosed: boolean;
  start: string;
  end: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string | string[];
  phone: string;
  color?: string;
  availability: {
    [key: number]: DayAvailability;
  };
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

export interface Shift {
  id: string;
  name: string;
  startTime: string;  // HH:mm format
  endTime: string;    // HH:mm format
  duration: number;
  requiredEmployees: number;
  color: string;
  isOvernight: boolean;
  roles: ShiftRole[];
  assignedEmployees?: string[];
}

export interface ShiftRole {
  roleId: string;
  count: number;
  duration: number;
}

export interface WeeklySchedule {
  id: string;
  weekStart: string;  // ISO date string
  weekEnd: string;    // ISO date string
  shifts: {
    [date: string]: ShiftAssignment[];
  };
}

export interface BusinessHours {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  isClosed?: boolean;  // For backward compatibility
}

export interface DayHours {
  start: string;
  end: string;
  isClosed: boolean;
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
  shiftBreakdown: Record<string, {
    name: string;
    hours: number;
    completed: number;
    upcoming: number;
  }>;
  lastUpdated: string;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  employeeId: string;
  date: string;  // ISO date string
  startTime: string;  // HH:mm format
  endTime: string;    // HH:mm format
  isOvernight: boolean;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
  roleId: string;  // The role the employee is assigned to for this shift
  notes?: string;
}

export interface Role {
  id: string;
  name: string;
  icon: string;  // Material-UI icon name
  color: string;
  description?: string;
} 