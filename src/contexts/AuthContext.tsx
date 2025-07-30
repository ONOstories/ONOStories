import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, mockUsers } from '../lib/mockData';

// Mock User interface (replacing Supabase User)
interface MockUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: MockUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  isPro: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('onostories_user');
    const savedProfile = localStorage.getItem('onostories_profile');
    
    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser));
      setProfile(JSON.parse(savedProfile));
    }
    
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return { data: null, error: { message: 'User already exists' } };
      }

      // Create new user
      const newUser: MockUser = {
        id: Date.now().toString(),
        email
      };

      const newProfile: UserProfile = {
        id: newUser.id,
        email,
        full_name: fullName,
        subscription_status: 'free',
        subscription_expires_at: null,
        stripe_customer_id: null
      };

      // Save to localStorage
      localStorage.setItem('onostories_user', JSON.stringify(newUser));
      localStorage.setItem('onostories_profile', JSON.stringify(newProfile));

      setUser(newUser);
      setProfile(newProfile);

      return { data: { user: newUser }, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Sign up failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      if (!mockUser) {
        return { data: null, error: { message: 'Invalid email or password' } };
      }

      const user: MockUser = {
        id: mockUser.id,
        email: mockUser.email
      };

      const profile: UserProfile = {
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.full_name,
        subscription_status: mockUser.subscription_status,
        subscription_expires_at: mockUser.subscription_expires_at,
        stripe_customer_id: mockUser.stripe_customer_id
      };

      // Save to localStorage
      localStorage.setItem('onostories_user', JSON.stringify(user));
      localStorage.setItem('onostories_profile', JSON.stringify(profile));

      setUser(user);
      setProfile(profile);

      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Sign in failed' } };
    }
  };

  const signOut = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('onostories_user');
      localStorage.removeItem('onostories_profile');
      
      setUser(null);
      setProfile(null);
      
      return { error: null };
    } catch (error) {
      return { error: { message: 'Sign out failed' } };
    }
  };

  const isPro = profile?.subscription_status === 'pro' && 
    (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isPro
  };

  return (
    <AuthContext.Provider value={value}>
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