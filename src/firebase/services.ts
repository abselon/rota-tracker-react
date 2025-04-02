import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { Employee, Shift, ShiftAssignment, WeeklySchedule } from '../types';

// Employees
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    console.log('Firebase service: Getting employees');
    const employeesCollection = collection(db, 'employees');
    const employeeSnapshot = await getDocs(employeesCollection);
    
    const employees = employeeSnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure availability is properly structured
      const employee = {
        id: doc.id,
        ...data,
        availability: data.availability || {}
      } as Employee;
      return employee;
    });
    
    console.log('Firebase service: Retrieved employees:', employees);
    return employees;
  } catch (error) {
    console.error('Firebase service: Error getting employees:', error);
    throw error;
  }
};

export const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<string> => {
  try {
    console.log('Firebase service: Adding employee:', employee);
    const employeesCollection = collection(db, 'employees');
    
    // Ensure availability is properly structured
    const employeeData = {
      ...employee,
      availability: employee.availability || {},
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(employeesCollection, employeeData);
    console.log('Firebase service: Employee added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Firebase service: Error adding employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id: string, employee: Partial<Employee>): Promise<void> => {
  const employeeRef = doc(db, 'employees', id);
  await updateDoc(employeeRef, {
    ...employee,
    updatedAt: serverTimestamp()
  });
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const employeeRef = doc(db, 'employees', id);
  await deleteDoc(employeeRef);
};

// Shifts
export const getShifts = async (): Promise<Shift[]> => {
  const shiftsCollection = collection(db, 'shifts');
  const shiftSnapshot = await getDocs(shiftsCollection);
  return shiftSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Shift));
};

export const addShift = async (shift: Omit<Shift, 'id'>): Promise<string> => {
  const shiftsCollection = collection(db, 'shifts');
  const docRef = await addDoc(shiftsCollection, {
    ...shift,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateShift = async (id: string, shift: Partial<Shift>): Promise<void> => {
  const shiftRef = doc(db, 'shifts', id);
  await updateDoc(shiftRef, {
    ...shift,
    updatedAt: serverTimestamp()
  });
};

export const deleteShift = async (id: string): Promise<void> => {
  const shiftRef = doc(db, 'shifts', id);
  await deleteDoc(shiftRef);
};

// Shift Assignments
export const getShiftAssignments = async (): Promise<ShiftAssignment[]> => {
  const assignmentsCollection = collection(db, 'assignments');
  const assignmentSnapshot = await getDocs(assignmentsCollection);
  return assignmentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ShiftAssignment));
};

export const getShiftAssignmentsByDate = async (date: string): Promise<ShiftAssignment[]> => {
  const assignmentsCollection = collection(db, 'assignments');
  const q = query(assignmentsCollection, where('date', '==', date));
  const assignmentSnapshot = await getDocs(q);
  return assignmentSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ShiftAssignment));
};

export const addShiftAssignment = async (assignment: Omit<ShiftAssignment, 'id'>): Promise<string> => {
  const assignmentsCollection = collection(db, 'assignments');
  const docRef = await addDoc(assignmentsCollection, {
    ...assignment,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateShiftAssignment = async (id: string, assignment: Partial<ShiftAssignment>): Promise<void> => {
  const assignmentRef = doc(db, 'assignments', id);
  await updateDoc(assignmentRef, {
    ...assignment,
    updatedAt: serverTimestamp()
  });
};

export const deleteShiftAssignment = async (id: string): Promise<void> => {
  const assignmentRef = doc(db, 'assignments', id);
  await deleteDoc(assignmentRef);
};

// Weekly Schedules
export const getWeeklySchedules = async (): Promise<WeeklySchedule[]> => {
  const schedulesCollection = collection(db, 'weeklySchedules');
  const scheduleSnapshot = await getDocs(schedulesCollection);
  return scheduleSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as WeeklySchedule));
};

export const getWeeklyScheduleByDate = async (weekStart: string): Promise<WeeklySchedule | null> => {
  const schedulesCollection = collection(db, 'weeklySchedules');
  const q = query(schedulesCollection, where('weekStart', '==', weekStart));
  const scheduleSnapshot = await getDocs(q);
  
  if (scheduleSnapshot.empty) {
    return null;
  }
  
  const doc = scheduleSnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  } as WeeklySchedule;
};

export const addWeeklySchedule = async (schedule: Omit<WeeklySchedule, 'id'>): Promise<string> => {
  const schedulesCollection = collection(db, 'weeklySchedules');
  const docRef = await addDoc(schedulesCollection, {
    ...schedule,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateWeeklySchedule = async (id: string, schedule: Partial<WeeklySchedule>): Promise<void> => {
  const scheduleRef = doc(db, 'weeklySchedules', id);
  await updateDoc(scheduleRef, {
    ...schedule,
    updatedAt: serverTimestamp()
  });
};

export const deleteWeeklySchedule = async (id: string): Promise<void> => {
  const scheduleRef = doc(db, 'weeklySchedules', id);
  await deleteDoc(scheduleRef);
}; 