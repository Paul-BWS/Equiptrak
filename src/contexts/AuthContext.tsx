import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
  tokenExpiry?: number; // Unix timestamp for token expiration
}

interface AuthContextType {
  user: User | null;
  signIn: (userData: User) => Promise<void>;
  signOut: (options?: { silent?: boolean, message?: string }) => Promise<void>;
  isLoading: boolean;
  handleAuthError: (error: any) => void;
  isTokenExpired: () => boolean;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log("AuthProvider - Component initializing");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if the token is expired
  const isTokenExpired = () => {
    if (!user || !user.tokenExpiry) return true;
    
    // Check if current time is past the token expiry time
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return currentTime > user.tokenExpiry;
  };

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
            
            // If token is expired, clear the user data
            if (userData.tokenExpiry && Math.floor(Date.now() / 1000) > userData.tokenExpiry) {
              const currentTime = Math.floor(Date.now() / 1000);
              console.log("Stored token is expired:", {
                currentTime,
                tokenExpiry: userData.tokenExpiry,
                difference: currentTime - userData.tokenExpiry,
                currentDate: new Date().toISOString(),
                expiryDate: new Date(userData.tokenExpiry * 1000).toISOString()
              });
              localStorage.removeItem('equiptrak_user');
              setUser(null);
              // Don't show toast here as it might show during initial page load
            } else {
              if (userData.tokenExpiry) {
                const currentTime = Math.floor(Date.now() / 1000);
                console.log("Token is still valid:", {
                  currentTime,
                  tokenExpiry: userData.tokenExpiry,
                  remainingTime: userData.tokenExpiry - currentTime,
                  remainingHours: (userData.tokenExpiry - currentTime) / 3600,
                  expiryDate: new Date(userData.tokenExpiry * 1000).toISOString()
                });
              }
              setUser(userData);
            }
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

  // Attempt to refresh the user's session
  const refreshSession = async (): Promise<boolean> => {
    try {
      // Try to refresh the token from the server
      // This is a placeholder - implement actual token refresh logic if your API supports it
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user?.token ? `Bearer ${user.token}` : ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the user with the new token
        if (data && data.token) {
          const refreshedUser = {
            ...user!,
            token: data.token,
            tokenExpiry: data.tokenExpiry || (Math.floor(Date.now() / 1000) + 86400) // 24 hours default
          };
          localStorage.setItem('equiptrak_user', JSON.stringify(refreshedUser));
          setUser(refreshedUser);
          toast.success('Session refreshed successfully');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Session refresh error:", error);
      return false;
    }
  };

  // Handler for authentication errors
  const handleAuthError = (error: any) => {
    console.error("Auth error:", error);
    
    // If it's a 401 Unauthorized error, sign out and redirect to login
    if (error.status === 401 || 
        (error.message && (
          error.message.includes('expired') || 
          error.message.includes('invalid token') || 
          error.message.includes('unauthorized')
        ))) {
      console.log("Token expired or invalid, signing out");
      
      signOut({ 
        message: 'Your session has expired. Please log in again.',
        silent: false
      });
    }
  };

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
    
    // Add token expiry if not provided
    if (!userData.tokenExpiry) {
      // Default to 24 hours from now
      userData.tokenExpiry = Math.floor(Date.now() / 1000) + 86400;
    }
    
    console.log("Signing in user:", { email: userData.email, role: userData.role });
    localStorage.setItem('equiptrak_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(`Welcome, ${userData.first_name || userData.email}!`);
  };

  // Sign out function with options
  const signOut = async (options?: { silent?: boolean, message?: string }) => {
    console.log("Signing out user");
    try {
      localStorage.removeItem('equiptrak_user');
      setUser(null);
      
      // Show a toast message if not silent
      if (!options?.silent && options?.message) {
        toast.error(options.message);
      } else if (!options?.silent) {
        toast.success('You have been signed out successfully');
      }
      
      // Navigate to login with a message if provided
      if (options?.message) {
        navigate('/login', { state: { message: options.message } });
      }
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
    handleAuthError,
    isTokenExpired,
    refreshSession
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