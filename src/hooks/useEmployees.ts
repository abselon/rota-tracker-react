import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Employee } from '../types';
import { checkEmployeeAvailability } from '../utils/shiftUtils';

export function useEmployees() {
  const { state, dispatch } = useAppContext();

  const addEmployee = useCallback(
    (employee: Employee) => {
      dispatch({ type: 'ADD_EMPLOYEE', payload: employee });
    },
    [dispatch]
  );

  const updateEmployee = useCallback(
    (employee: Employee) => {
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: employee });
    },
    [dispatch]
  );

  const deleteEmployee = useCallback(
    (employeeId: string) => {
      dispatch({ type: 'DELETE_EMPLOYEE', payload: employeeId });
    },
    [dispatch]
  );

  const getEmployeeById = useCallback(
    (employeeId: string) => {
      return state.employees.find((employee) => employee.id === employeeId);
    },
    [state.employees]
  );

  const getAvailableEmployees = useCallback(
    (startTime: Date, endTime: Date) => {
      return state.employees.filter((employee) =>
        checkEmployeeAvailability(employee, startTime, endTime)
      );
    },
    [state.employees]
  );

  const updateEmployeeAvailability = useCallback(
    (employeeId: string, availability: Employee['availability']) => {
      const employee = getEmployeeById(employeeId);
      if (!employee) return;

      const updatedEmployee = {
        ...employee,
        availability,
      };

      dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
    },
    [dispatch, getEmployeeById]
  );

  const getEmployeesByRole = useCallback(
    (role: string) => {
      return state.employees.filter((employee) => employee.role === role);
    },
    [state.employees]
  );

  const searchEmployees = useCallback(
    (query: string) => {
      const lowercaseQuery = query.toLowerCase();
      return state.employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(lowercaseQuery) ||
          employee.email.toLowerCase().includes(lowercaseQuery) ||
          employee.role.toLowerCase().includes(lowercaseQuery)
      );
    },
    [state.employees]
  );

  return {
    employees: state.employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getAvailableEmployees,
    updateEmployeeAvailability,
    getEmployeesByRole,
    searchEmployees,
  };
} 