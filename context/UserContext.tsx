'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { UserContextType } from '@/types/user';

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshUser: async () => {},
});

// Provider component that wraps the app and makes user object available
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Function to refresh user data
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      setUser(user);
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Unexpected error during user refresh:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of user data
  useEffect(() => {
    const supabase = createClient();
    
    // Get initial user
    refreshUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setIsLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // The value that will be available to consumers of this context
  const value = {
    user,
    isLoading,
    isAuthenticated,
    refreshUser,
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
