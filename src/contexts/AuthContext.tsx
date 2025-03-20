import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define user types
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  company_id?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log("AuthProvider - Component initializing");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    console.log("AuthProvider - useEffect hook running");
    const initializeAuth = async () => {
      console.log("AuthProvider - initializeAuth started");
      try {
        const storedUser = localStorage.getItem('equiptrak_user');
        console.log("AuthProvider - storedUser from localStorage:", storedUser ? "Found" : "Not found");
        
        if (storedUser) {
          console.log("Found user in localStorage");
          const userData = JSON.parse(storedUser);
          
          // Validate stored data has required fields
          if (!userData.id || !userData.email || !userData.token) {
            console.log("Invalid stored user data, signing out");
            localStorage.removeItem('equiptrak_user');
            setUser(null);
          } else {
            console.log("Setting user from stored data:", { email: userData.email, role: userData.role });
            setUser(userData);
          }
        } else {
          console.log("No stored user data found");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear potentially corrupted data
        localStorage.removeItem('equiptrak_user');
        setUser(null);
      } finally {
        console.log("AuthProvider - Setting isLoading to false");
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in function
  const signIn = async (userData: User) => {
    if (!userData.token) {
      console.error("No token provided in user data");
      throw new Error('Token is required for sign in');
    }
    
    if (!userData.id || !userData.email) {
      console.error("Missing required user data fields");
      throw new Error('Invalid user data');
    }
    
    console.log("Signing in user:", { email: userData.email, role: userData.role });
    localStorage.setItem('equiptrak_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Sign out function
  const signOut = async () => {
    console.log("Signing out user");
    try {
      localStorage.removeItem('equiptrak_user');
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const value = {
    user,
    signIn,
    signOut,
    isLoading,
  };

  console.log("AuthProvider - Rendering with isLoading:", isLoading, "user:", user ? "exists" : "null");

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log("useAuth hook called, isLoading:", context.isLoading, "user:", context.user ? "exists" : "null");
  return context;
};