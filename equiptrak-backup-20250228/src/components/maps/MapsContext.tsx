import { createContext, useContext, useState, ReactNode } from 'react';

type Coordinates = {
  lat: number;
  lng: number;
};

type MapsContextType = {
  coordinates: Coordinates | null;
  setCoordinates: (coords: Coordinates | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
};

const MapsContext = createContext<MapsContextType | undefined>(undefined);

export function MapsProvider({ children }: { children: ReactNode }) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = {
    coordinates,
    setCoordinates,
    isLoading,
    setIsLoading,
    error,
    setError
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
    throw new Error('useMaps must be used within a MapsProvider');
  }
  return context;
} 