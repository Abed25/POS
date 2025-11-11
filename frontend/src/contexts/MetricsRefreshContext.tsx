import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

// --- 1. Define the Context Interface ---
// This interface strictly defines the shape of the object that the context provides.
interface RefreshContextType {
  /** An integer counter that increments every time a refresh is requested. */
  metricsRefresh: number;
  /** A function that components call to trigger the refresh process in the Dashboard. */
  triggerRefresh: () => void;
}

// --- 2. Create the Context ---
// The default value is set to 'undefined' because the hook enforces that it must be used within the Provider.
const MetricsRefreshContext = createContext<RefreshContextType | undefined>(
  undefined
);

// --- 3. Custom Hook to Consume the Context ---
/**
 * Custom hook to easily access the metrics refresh state and trigger function.
 * Must be used within the MetricsRefreshProvider.
 */
export const useMetricsRefresh = (): RefreshContextType => {
  const context = useContext(MetricsRefreshContext);
  if (!context) {
    throw new Error(
      "useMetricsRefresh must be used within a MetricsRefreshProvider"
    );
  }
  return context;
};

// --- 4. Context Provider Component ---
/**
 * Provider component that manages the metrics refresh state and exposes the trigger function.
 * Wrap your root component or the dashboard section with this provider.
 */
export const MetricsRefreshProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State to hold the integer counter. Its change triggers the Dashboard's useEffect.
  const [metricsRefresh, setMetricsRefresh] = useState(0);

  // Memoized function to safely increment the counter.
  // useCallback prevents unnecessary re-creations of this function.
  const triggerRefresh = useCallback(() => {
    setMetricsRefresh((prev) => prev + 1);
    // console.log(`[Metrics Context] Refresh triggered. New counter value: ${metricsRefresh + 1}`);
  }, []);

  const contextValue: RefreshContextType = {
    metricsRefresh,
    triggerRefresh,
  };

  return (
    <MetricsRefreshContext.Provider value={contextValue}>
      {children}
    </MetricsRefreshContext.Provider>
  );
};
