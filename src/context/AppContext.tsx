import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Employee, Shift, ShiftAssignment, WeeklySchedule, BusinessHours } from '../types';
import * as firebaseServices from '../firebase/services';

interface AppState {
  employees: Employee[];
  shifts: Shift[];
  assignments: ShiftAssignment[];
  schedules: WeeklySchedule[];
  businessHours: BusinessHours[];
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
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
  isLoading: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
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
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (id: string, shift: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  addAssignment: (assignment: Omit<ShiftAssignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<ShiftAssignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  addSchedule: (schedule: Omit<WeeklySchedule, 'id'>) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<WeeklySchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from Firebase on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load all data in parallel
        const [employees, shifts, assignments, schedules, businessHours] = await Promise.all([
          firebaseServices.getEmployees(),
          firebaseServices.getShifts(),
          firebaseServices.getShiftAssignments(),
          firebaseServices.getWeeklySchedules(),
          Promise.resolve([]) // Business hours not implemented in Firebase yet
        ]);
        
        dispatch({ type: 'SET_EMPLOYEES', payload: employees });
        dispatch({ type: 'SET_SHIFTS', payload: shifts });
        dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments });
        dispatch({ type: 'SET_SCHEDULES', payload: schedules });
        dispatch({ type: 'SET_BUSINESS_HOURS', payload: businessHours });
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error loading data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data from the database' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadData();
  }, []);

  // Firebase service wrappers
  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      console.log('Adding employee:', employee);
      const id = await firebaseServices.addEmployee(employee);
      const newEmployee = { ...employee, id } as Employee;
      console.log('Employee added with ID:', id);
      dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
    } catch (error) {
      console.error('Error adding employee:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add employee: ' + (error instanceof Error ? error.message : String(error)) });
    }
  };

  const updateEmployee = async (id: string, employee: Partial<Employee>) => {
    try {
      await firebaseServices.updateEmployee(id, employee);
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: { ...employee, id } as Employee });
    } catch (error) {
      console.error('Error updating employee:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update employee' });
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await firebaseServices.deleteEmployee(id);
      dispatch({ type: 'DELETE_EMPLOYEE', payload: id });
    } catch (error) {
      console.error('Error deleting employee:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete employee' });
    }
  };

  const addShift = async (shift: Omit<Shift, 'id'>) => {
    try {
      const id = await firebaseServices.addShift(shift);
      dispatch({ type: 'ADD_SHIFT', payload: { ...shift, id } as Shift });
    } catch (error) {
      console.error('Error adding shift:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add shift' });
    }
  };

  const updateShift = async (id: string, shift: Partial<Shift>) => {
    try {
      await firebaseServices.updateShift(id, shift);
      dispatch({ type: 'UPDATE_SHIFT', payload: { ...shift, id } as Shift });
    } catch (error) {
      console.error('Error updating shift:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update shift' });
    }
  };

  const deleteShift = async (id: string) => {
    try {
      await firebaseServices.deleteShift(id);
      dispatch({ type: 'DELETE_SHIFT', payload: id });
    } catch (error) {
      console.error('Error deleting shift:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete shift' });
    }
  };

  const addAssignment = async (assignment: Omit<ShiftAssignment, 'id'>) => {
    try {
      const id = await firebaseServices.addShiftAssignment(assignment);
      dispatch({ type: 'ADD_ASSIGNMENT', payload: { ...assignment, id } as ShiftAssignment });
    } catch (error) {
      console.error('Error adding assignment:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add assignment' });
    }
  };

  const updateAssignment = async (id: string, assignment: Partial<ShiftAssignment>) => {
    try {
      await firebaseServices.updateShiftAssignment(id, assignment);
      dispatch({ type: 'UPDATE_ASSIGNMENT', payload: { ...assignment, id } as ShiftAssignment });
    } catch (error) {
      console.error('Error updating assignment:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update assignment' });
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      await firebaseServices.deleteShiftAssignment(id);
      dispatch({ type: 'DELETE_ASSIGNMENT', payload: id });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete assignment' });
    }
  };

  const addSchedule = async (schedule: Omit<WeeklySchedule, 'id'>) => {
    try {
      const id = await firebaseServices.addWeeklySchedule(schedule);
      dispatch({ type: 'ADD_SCHEDULE', payload: { ...schedule, id } as WeeklySchedule });
    } catch (error) {
      console.error('Error adding schedule:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add schedule' });
    }
  };

  const updateSchedule = async (id: string, schedule: Partial<WeeklySchedule>) => {
    try {
      await firebaseServices.updateWeeklySchedule(id, schedule);
      dispatch({ type: 'UPDATE_SCHEDULE', payload: { ...schedule, id } as WeeklySchedule });
    } catch (error) {
      console.error('Error updating schedule:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update schedule' });
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await firebaseServices.deleteWeeklySchedule(id);
      dispatch({ type: 'DELETE_SCHEDULE', payload: id });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete schedule' });
    }
  };

  return (
    <AppContext.Provider 
      value={{ 
        state, 
        dispatch,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addShift,
        updateShift,
        deleteShift,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addSchedule,
        updateSchedule,
        deleteSchedule
      }}
    >
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