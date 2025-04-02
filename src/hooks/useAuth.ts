import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './useNotifications';
import { useLoading } from './useLoading';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'rota-tracker-auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { user: null, token: null, isAuthenticated: false };
  });

  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { withLoading } = useLoading();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = useCallback(
    async (email: string, password: string) => {
      return withLoading(
        async () => {
          // TODO: Replace with actual API call
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const data = await response.json();
          const { user, token } = data;

          setAuthState({
            user,
            token,
            isAuthenticated: true,
          });

          addNotification('success', 'Successfully logged in');
          navigate('/dashboard');
        },
        {
          loadingMessage: 'Logging in...',
          successMessage: 'Successfully logged in',
          errorMessage: 'Failed to log in',
        }
      );
    },
    [withLoading, addNotification, navigate]
  );

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.removeItem(STORAGE_KEY);
    addNotification('info', 'Successfully logged out');
    navigate('/login');
  }, [addNotification, navigate]);

  const register = useCallback(
    async (userData: {
      email: string;
      password: string;
      name: string;
      role: User['role'];
    }) => {
      return withLoading(
        async () => {
          // TODO: Replace with actual API call
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            throw new Error('Registration failed');
          }

          const data = await response.json();
          const { user, token } = data;

          setAuthState({
            user,
            token,
            isAuthenticated: true,
          });

          addNotification('success', 'Successfully registered');
          navigate('/dashboard');
        },
        {
          loadingMessage: 'Registering...',
          successMessage: 'Successfully registered',
          errorMessage: 'Failed to register',
        }
      );
    },
    [withLoading, addNotification, navigate]
  );

  const updateProfile = useCallback(
    async (profileData: Partial<User>) => {
      return withLoading(
        async () => {
          // TODO: Replace with actual API call
          const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authState.token}`,
            },
            body: JSON.stringify(profileData),
          });

          if (!response.ok) {
            throw new Error('Failed to update profile');
          }

          const updatedUser = await response.json();
          setAuthState((prev) => ({
            ...prev,
            user: updatedUser,
          }));

          addNotification('success', 'Profile updated successfully');
        },
        {
          loadingMessage: 'Updating profile...',
          successMessage: 'Profile updated successfully',
          errorMessage: 'Failed to update profile',
        }
      );
    },
    [withLoading, addNotification, authState.token]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      return withLoading(
        async () => {
          // TODO: Replace with actual API call
          const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authState.token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          });

          if (!response.ok) {
            throw new Error('Failed to change password');
          }

          addNotification('success', 'Password changed successfully');
        },
        {
          loadingMessage: 'Changing password...',
          successMessage: 'Password changed successfully',
          errorMessage: 'Failed to change password',
        }
      );
    },
    [withLoading, addNotification, authState.token]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      return authState.user?.permissions.includes(permission) || false;
    },
    [authState.user]
  );

  const isAdmin = useCallback(() => {
    return authState.user?.role === 'admin';
  }, [authState.user]);

  const isManager = useCallback(() => {
    return authState.user?.role === 'manager' || authState.user?.role === 'admin';
  }, [authState.user]);

  return {
    authState,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    hasPermission,
    isAdmin,
    isManager,
  };
} 