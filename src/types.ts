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