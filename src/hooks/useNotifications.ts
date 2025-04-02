import { useCallback, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShiftAssignment } from '../types';
import { formatDateTime } from '../utils/dateUtils';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { state } = useAppContext();

  const addNotification = useCallback(
    (type: Notification['type'], message: string) => {
      const newNotification: Notification = {
        id: `notification-${Date.now()}`,
        type,
        message,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  const checkShiftConflicts = useCallback(
    (assignment: ShiftAssignment) => {
      const conflictingShifts = state.assignments.filter((existing) => {
        if (existing.employeeId !== assignment.employeeId) return false;
        if (existing.id === assignment.id) return false;

        const existingDate = new Date(existing.date);
        const newDate = new Date(assignment.date);

        return (
          existingDate.getTime() === newDate.getTime() &&
          existing.shiftId === assignment.shiftId
        );
      });

      if (conflictingShifts.length > 0) {
        addNotification(
          'warning',
          `Shift conflict detected for ${formatDateTime(new Date(assignment.date))}`
        );
        return true;
      }

      return false;
    },
    [state.assignments, addNotification]
  );

  const checkEmployeeAvailability = useCallback(
    (employeeId: string, date: Date) => {
      const employee = state.employees.find((emp) => emp.id === employeeId);
      if (!employee || !employee.availability) return true;

      const dayOfWeek = date.getDay();
      const availability = employee.availability[dayOfWeek];

      if (!availability || availability.isClosed) {
        addNotification(
          'warning',
          `Employee is not available on ${date.toLocaleDateString()}`
        );
        return false;
      }

      return true;
    },
    [state.employees, addNotification]
  );

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
    checkShiftConflicts,
    checkEmployeeAvailability,
  };
} 