import { createContext, useContext, useState, ReactNode } from "react";

type NavigationContextType = {
  canGoBack: boolean;
  setCanGoBack: (canGoBack: boolean) => void;
  currentSection: string;
  setCurrentSection: (section: string) => void;
  customerId: string | null;
  setCustomerId: (id: string | null) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function MobileNavigationProvider({ children }: { children: ReactNode }) {
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [customerId, setCustomerId] = useState<string | null>(null);
  
  return (
    <NavigationContext.Provider value={{
      canGoBack,
      setCanGoBack,
      currentSection,
      setCurrentSection,
      customerId,
      setCustomerId
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useMobileNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useMobileNavigation must be used within a MobileNavigationProvider");
  }
  return context;
} 