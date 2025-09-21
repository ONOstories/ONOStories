// src/contexts/AuthProvider.tsx
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: 'normaluser' | 'prouser';
  subscription_status: 'active' | 'inactive';
  plan_expires_at: string | null;
    // Add these:
  stories_generated?: number;
  stories_downloaded?: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/edge/auth-me', { credentials: 'include' });
        const data = await res.json();
        if (!active) return;
        setUser(data.user ?? null);
        setProfile(data.profile ?? null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const logout = async () => {
    await fetch('/edge/auth-logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
