import { useCallback, useState } from 'react';
import { useNotifications } from './useNotifications';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });
  const { addNotification } = useNotifications();

  const handleError = useCallback(
    (error: Error, errorInfo?: React.ErrorInfo) => {
      console.error('Error caught by error handler:', error, errorInfo);
      setErrorState({
        hasError: true,
        error,
        errorInfo: errorInfo || null,
      });

      // Add notification for user feedback
      addNotification('error', error.message || 'An unexpected error occurred');
    },
    [addNotification]
  );

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }, []);

  const handleAsyncError = useCallback(
    async <T>(
      promise: Promise<T>,
      errorMessage = 'An error occurred while processing your request'
    ): Promise<T | null> => {
      try {
        return await promise;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(errorMessage);
        handleError(errorObj);
        return null;
      }
    },
    [handleError]
  );

  const withErrorHandling = useCallback(
    <T extends (...args: any[]) => any>(
      fn: T,
      errorMessage?: string
    ): ((...args: Parameters<T>) => ReturnType<T> | null) => {
      return (...args: Parameters<T>) => {
        try {
          return fn(...args);
        } catch (error) {
          const errorObj =
            error instanceof Error ? error : new Error(errorMessage || 'An error occurred');
          handleError(errorObj);
          return null;
        }
      };
    },
    [handleError]
  );

  const handleValidationError = useCallback(
    (errors: { field: string; message: string }[]) => {
      errors.forEach((error) => {
        addNotification('error', `${error.field}: ${error.message}`);
      });
    },
    [addNotification]
  );

  const handleApiError = useCallback(
    (error: any) => {
      let message = 'An error occurred while communicating with the server';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        message = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        message = 'No response received from server';
      } else if (error.message) {
        // Something happened in setting up the request that triggered an Error
        message = error.message;
      }

      handleError(new Error(message));
    },
    [handleError]
  );

  return {
    errorState,
    handleError,
    clearError,
    handleAsyncError,
    withErrorHandling,
    handleValidationError,
    handleApiError,
  };
} 