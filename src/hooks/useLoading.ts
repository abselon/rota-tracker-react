import { useCallback, useState } from 'react';
import { useNotifications } from './useNotifications';

interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  progress: number;
}

export function useLoading() {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingMessage: '',
    progress: 0,
  });
  const { addNotification } = useNotifications();

  const startLoading = useCallback(
    (message = 'Loading...') => {
      setLoadingState({
        isLoading: true,
        loadingMessage: message,
        progress: 0,
      });
    },
    []
  );

  const updateProgress = useCallback((progress: number) => {
    setLoadingState((prev) => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
    }));
  }, []);

  const updateLoadingMessage = useCallback((message: string) => {
    setLoadingState((prev) => ({
      ...prev,
      loadingMessage: message,
    }));
  }, []);

  const stopLoading = useCallback(
    (success = true, message?: string) => {
      setLoadingState({
        isLoading: false,
        loadingMessage: '',
        progress: 0,
      });

      if (message) {
        addNotification(success ? 'success' : 'error', message);
      }
    },
    [addNotification]
  );

  const withLoading = useCallback(
    async <T>(
      operation: () => Promise<T>,
      {
        loadingMessage = 'Loading...',
        successMessage,
        errorMessage = 'An error occurred',
      }: {
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
      } = {}
    ): Promise<T | null> => {
      try {
        startLoading(loadingMessage);
        const result = await operation();
        stopLoading(true, successMessage);
        return result;
      } catch (error) {
        stopLoading(false, errorMessage);
        return null;
      }
    },
    [startLoading, stopLoading]
  );

  const withProgress = useCallback(
    async <T>(
      operation: (updateProgress: (progress: number) => void) => Promise<T>,
      {
        loadingMessage = 'Loading...',
        successMessage,
        errorMessage = 'An error occurred',
      }: {
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
      } = {}
    ): Promise<T | null> => {
      try {
        startLoading(loadingMessage);
        const result = await operation(updateProgress);
        stopLoading(true, successMessage);
        return result;
      } catch (error) {
        stopLoading(false, errorMessage);
        return null;
      }
    },
    [startLoading, stopLoading, updateProgress]
  );

  const withLoadingMessage = useCallback(
    async <T>(
      operation: (updateMessage: (message: string) => void) => Promise<T>,
      {
        initialMessage = 'Loading...',
        successMessage,
        errorMessage = 'An error occurred',
      }: {
        initialMessage?: string;
        successMessage?: string;
        errorMessage?: string;
      } = {}
    ): Promise<T | null> => {
      try {
        startLoading(initialMessage);
        const result = await operation(updateLoadingMessage);
        stopLoading(true, successMessage);
        return result;
      } catch (error) {
        stopLoading(false, errorMessage);
        return null;
      }
    },
    [startLoading, stopLoading, updateLoadingMessage]
  );

  return {
    loadingState,
    startLoading,
    updateProgress,
    updateLoadingMessage,
    stopLoading,
    withLoading,
    withProgress,
    withLoadingMessage,
  };
} 