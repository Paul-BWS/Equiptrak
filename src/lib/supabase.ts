// Mock Supabase client for development
// This file provides a mock implementation of the Supabase client
// that can be used for development without an actual Supabase backend

interface User {
  id: string;
  email: string;
}

interface Session {
  user: User;
}

interface AuthResponse {
  data: {
    session: Session | null;
    user: User | null;
  } | null;
  error: Error | null;
}

// Mock Supabase client
export const supabase = {
  auth: {
    // Get the current session
    getSession: async (): Promise<AuthResponse> => {
      console.log("Mock getSession called");
      return {
        data: null,
        error: null
      };
    },
    
    // Sign out the current user
    signOut: async (): Promise<{ error: Error | null }> => {
      console.log("Mock signOut called");
      return { error: null };
    },
    
    // Refresh the current session
    refreshSession: async (): Promise<AuthResponse> => {
      console.log("Mock refreshSession called");
      return {
        data: null,
        error: null
      };
    }
  }
};

export default supabase; 