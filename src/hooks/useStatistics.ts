import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Employee, ShiftAssignment, DayAvailability, BusinessHours, DayHours } from '../types';

interface EmployeeStats {
  totalShifts: number;
  completedShifts: number;
  cancelledShifts: number;
  totalHours: number;
  availabilityPercentage: number;
}

interface ShiftStats {
  totalAssignments: number;
  completedAssignments: number;
  cancelledAssignments: number;
  averageDuration: number;
  fillRate: number;
}

interface WeeklyStats {
  totalAssignments: number;
  totalHours: number;
  coveragePercentage: number;
}

export function useStatistics() {
  const { state } = useAppContext();
  const { employees, shifts, assignments, businessHours } = state;

  const getEmployeeStats = useCallback((employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return null;

    const employeeAssignments = assignments.filter(a => a.employeeId === employeeId);
    const totalShifts = employeeAssignments.length;
    
    // Calculate availability percentage
    let availabilityPercentage = 0;
    if (employee.availability) {
      const availableDays = Object.values(employee.availability as Record<string, DayAvailability>).filter(
        (day: DayAvailability) => !day.isClosed
      ).length;
      availabilityPercentage = (availableDays / 7) * 100;
    }

    return {
      totalShifts,
      availabilityPercentage,
    };
  }, [employees, assignments]);

  const getShiftStats = useCallback((shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return null;

    const shiftAssignments = assignments.filter(a => a.shiftId === shiftId);
    const totalAssignments = shiftAssignments.length;
    const uniqueEmployees = new Set(shiftAssignments.map(a => a.employeeId)).size;

    return {
      totalAssignments,
      uniqueEmployees,
      fillRate: (totalAssignments / shift.requiredEmployees) * 100,
    };
  }, [shifts, assignments]);

  const getOverallStats = useCallback(() => {
    const totalEmployees = employees.length;
    const totalShifts = shifts.length;
    const totalAssignments = assignments.length;
    
    // Calculate average shifts per employee
    const employeeShiftCounts = employees.map(e => 
      assignments.filter(a => a.employeeId === e.id).length
    );
    const avgShiftsPerEmployee = employeeShiftCounts.length > 0 
      ? employeeShiftCounts.reduce((sum, count) => sum + count, 0) / employeeShiftCounts.length 
      : 0;

    return {
      totalEmployees,
      totalShifts,
      totalAssignments,
      avgShiftsPerEmployee,
    };
  }, [employees, shifts, assignments]);

  const getEmployeeStatsDetailed = useCallback(
    (employeeId: string, startDate: Date, endDate: Date): EmployeeStats => {
      const employeeAssignments = assignments.filter(
        (assignment) =>
          assignment.employeeId === employeeId &&
          new Date(assignment.date) >= startDate &&
          new Date(assignment.date) <= endDate
      );

      const totalShifts = employeeAssignments.length;
      const completedShifts = employeeAssignments.filter(
        (assignment) => assignment.status === 'confirmed'
      ).length;
      const cancelledShifts = employeeAssignments.filter(
        (assignment) => assignment.status === 'cancelled'
      ).length;

      // Calculate total hours
      let totalHours = 0;
      employeeAssignments.forEach((assignment) => {
        const shift = shifts.find((s) => s.id === assignment.shiftId);
        if (shift) {
          totalHours += shift.duration;
        }
      });

      // Calculate availability percentage
      const employee = employees.find((emp) => emp.id === employeeId);
      let availabilityPercentage = 100;
      if (employee?.availability) {
        const availableDays = Object.values(employee.availability as Record<string, DayAvailability>).filter(
          (day: DayAvailability) => !day.isClosed
        ).length;
        availabilityPercentage = (availableDays / 7) * 100;
      }

      return {
        totalShifts,
        completedShifts,
        cancelledShifts,
        totalHours,
        availabilityPercentage,
      };
    },
    [employees, assignments, shifts]
  );

  const getShiftStatsDetailed = useCallback(
    (shiftId: string, startDate: Date, endDate: Date): ShiftStats => {
      const shiftAssignments = assignments.filter(
        (assignment) =>
          assignment.shiftId === shiftId &&
          new Date(assignment.date) >= startDate &&
          new Date(assignment.date) <= endDate
      );

      const totalAssignments = shiftAssignments.length;
      const completedAssignments = shiftAssignments.filter(
        (assignment) => assignment.status === 'confirmed'
      ).length;
      const cancelledAssignments = shiftAssignments.filter(
        (assignment) => assignment.status === 'cancelled'
      ).length;

      const shift = shifts.find((s) => s.id === shiftId);
      const averageDuration = shift ? shift.duration : 0;
      const fillRate = shift ? (totalAssignments / shift.requiredEmployees) * 100 : 0;

      return {
        totalAssignments,
        completedAssignments,
        cancelledAssignments,
        averageDuration,
        fillRate,
      };
    },
    [shifts, assignments]
  );

  const getWeeklyStats = useCallback(
    (weekStart: Date): WeeklyStats => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekAssignments = assignments.filter(
        (assignment) =>
          new Date(assignment.date) >= weekStart &&
          new Date(assignment.date) <= weekEnd
      );

      const totalAssignments = weekAssignments.length;
      let totalHours = 0;

      weekAssignments.forEach((assignment) => {
        const shift = shifts.find((s) => s.id === assignment.shiftId);
        if (shift) {
          totalHours += shift.duration;
        }
      });

      // Calculate coverage percentage
      let totalPossibleHours = 0;
      
      // Process each day's business hours
      businessHours.forEach(hours => {
        if (hours.isOpen && hours.openTime && hours.closeTime) {
          const [startHour] = hours.openTime.split(':').map(Number);
          const [endHour] = hours.closeTime.split(':').map(Number);
          totalPossibleHours += (endHour - startHour);
        }
      });

      const coveragePercentage = totalPossibleHours > 0 
        ? (totalHours / (totalPossibleHours * 7)) * 100 
        : 0;

      return {
        totalAssignments,
        totalHours,
        coveragePercentage,
      };
    },
    [assignments, shifts, businessHours]
  );

  return {
    getEmployeeStats,
    getShiftStats,
    getOverallStats,
    getEmployeeStatsDetailed,
    getShiftStatsDetailed,
    getWeeklyStats,
  };
} 