import { useEffect, useState } from 'react';

// Custom hook to manage loading state with timeout
export const useLoadingWithTimeout = (initialLoading = true, timeoutMs = 10000) => {
  const [loading, setLoading] = useState(initialLoading);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (loading && !hasLoaded) {
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoading(false);
        setHasLoaded(true);
      }, timeoutMs);

      return () => clearTimeout(timeout);
    }
  }, [loading, hasLoaded, timeoutMs]);

  const startLoading = () => {
    setLoading(true);
  };

  const stopLoading = () => {
    setLoading(false);
    setHasLoaded(true);
  };

  const resetLoading = () => {
    setLoading(true);
    setHasLoaded(false);
  };

  return {
    loading,
    hasLoaded,
    startLoading,
    stopLoading,
    resetLoading,
    shouldShowSpinner: loading && !hasLoaded
  };
};

// Simple loading manager for page components
export const createLoadingManager = () => {
  let hasLoaded = false;
  
  return {
    shouldShowLoading: (loading, dataLength) => {
      // Only show loading spinner on first load when no data
      if (hasLoaded) return false;
      return loading && dataLength === 0;
    },
    markAsLoaded: () => {
      hasLoaded = true;
    }
  };
}; 