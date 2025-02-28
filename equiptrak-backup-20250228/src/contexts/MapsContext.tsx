import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLoadScript, Libraries } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";

interface MapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
  isInitialized: boolean;
  initError: string | null;
}

const MapsContext = createContext<MapsContextType | undefined>(undefined);

// Define libraries array outside component
const libraries: Libraries = ["places", "geocoding"];

// Use the API key from the environment
const MAPS_API_KEY = 'AIzaSyD60aJEPIY4wu6bj0cP-ATuDVJonjHNz3E';

export function MapsProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: MAPS_API_KEY,
    libraries,
    version: "weekly",
    language: "en",
    region: "GB"
  });

  // Set initialized when the script is loaded
  useEffect(() => {
    if (isLoaded && !loadError) {
      setIsInitialized(true);
      setInitError(null);
    } else if (loadError) {
      setInitError(loadError.message);
      setIsInitialized(false);
    }
  }, [isLoaded, loadError]);

  // Log state changes and errors
  useEffect(() => {
    console.log("Maps Provider State:", {
      hasApiKey: !!MAPS_API_KEY,
      apiKeyLength: MAPS_API_KEY?.length,
      isInitialized,
      isLoaded,
      hasError: !!loadError || !!initError,
      loadErrorDetails: loadError?.message,
      initErrorDetails: initError
    });
  }, [isInitialized, isLoaded, loadError, initError]);

  const value = {
    isLoaded: isLoaded && isInitialized && !initError,
    loadError: loadError || (initError ? new Error(initError) : undefined),
    isInitialized,
    initError
  };

  return (
    <MapsContext.Provider value={value}>
      {children}
    </MapsContext.Provider>
  );
}

export function useMaps() {
  const context = useContext(MapsContext);
  if (context === undefined) {
    throw new Error("useMaps must be used within a MapsProvider");
  }
  return context;
} 