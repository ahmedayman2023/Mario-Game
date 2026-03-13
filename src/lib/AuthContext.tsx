import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: { type: string } | null;
  navigateToLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState<{ type: string } | null>(null);

  useEffect(() => {
    // Simulate auth check
    const timer = setTimeout(() => {
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
      // For demo purposes, we'll stay "unauthenticated" but without error
      // setAuthError({ type: 'auth_required' }); 
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const navigateToLogin = () => {
    console.log('Navigating to login...');
    // In a real app, this might use window.location or a router navigate
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoadingAuth, 
      isLoadingPublicSettings, 
      authError, 
      navigateToLogin,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
