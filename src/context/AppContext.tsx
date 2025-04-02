import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Employee, Shift, ShiftAssignment, WeeklySchedule, BusinessHours } from '../types';

interface AppState {
  employees: Employee[];
  shifts: Shift[];
  assignments: ShiftAssignment[];
  schedules: WeeklySchedule[];
  businessHours: BusinessHours[];
}

type AppAction =
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'SET_SHIFTS'; payload: Shift[] }
  | { type: 'ADD_SHIFT'; payload: Shift }
  | { type: 'UPDATE_SHIFT'; payload: Shift }
  | { type: 'DELETE_SHIFT'; payload: string }
  | { type: 'SET_ASSIGNMENTS'; payload: ShiftAssignment[] }
  | { type: 'ADD_ASSIGNMENT'; payload: ShiftAssignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: ShiftAssignment }
  | { type: 'DELETE_ASSIGNMENT'; payload: string }
  | { type: 'SET_SCHEDULES'; payload: WeeklySchedule[] }
  | { type: 'ADD_SCHEDULE'; payload: WeeklySchedule }
  | { type: 'UPDATE_SCHEDULE'; payload: WeeklySchedule }
  | { type: 'DELETE_SCHEDULE'; payload: string }
  | { type: 'SET_BUSINESS_HOURS'; payload: BusinessHours[] }
  | { type: 'UPDATE_BUSINESS_HOURS'; payload: BusinessHours };

const initialState: AppState = {
  employees: [],
  shifts: [],
  assignments: [],
  schedules: [],
  businessHours: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map((emp) =>
          emp.id === action.payload.id ? action.payload : emp
        ),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter((emp) => emp.id !== action.payload),
      };
    case 'SET_SHIFTS':
      return { ...state, shifts: action.payload };
    case 'ADD_SHIFT':
      return { ...state, shifts: [...state.shifts, action.payload] };
    case 'UPDATE_SHIFT':
      return {
        ...state,
        shifts: state.shifts.map((shift) =>
          shift.id === action.payload.id ? action.payload : shift
        ),
      };
    case 'DELETE_SHIFT':
      return {
        ...state,
        shifts: state.shifts.filter((shift) => shift.id !== action.payload),
      };
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };
    case 'ADD_ASSIGNMENT':
      return { ...state, assignments: [...state.assignments, action.payload] };
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map((assignment) =>
          assignment.id === action.payload.id ? action.payload : assignment
        ),
      };
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter(
          (assignment) => assignment.id !== action.payload
        ),
      };
    case 'SET_SCHEDULES':
      return { ...state, schedules: action.payload };
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.map((schedule) =>
          schedule.id === action.payload.id ? action.payload : schedule
        ),
      };
    case 'DELETE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.filter(
          (schedule) => schedule.id !== action.payload
        ),
      };
    case 'SET_BUSINESS_HOURS':
      return { ...state, businessHours: action.payload };
    case 'UPDATE_BUSINESS_HOURS':
      return {
        ...state,
        businessHours: state.businessHours.map((hours) =>
          hours.id === action.payload.id ? action.payload : hours
        ),
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 