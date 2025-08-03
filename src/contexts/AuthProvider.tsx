import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  role: 'normaluser' | 'prouser';
  subscription_status: 'active' | 'inactive';
  plan_expires_at: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user;

        if (currentUser) {
          // A session exists. Now, we MUST verify the user's profile also exists.
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          // THIS IS THE DEFINITIVE GHOST SESSION FIX:
          // If we get an error trying to fetch the profile, it means the user
          // was deleted from the database. We must sign them out.
          if (error && !profileData) {
            console.error("Ghost session detected. User profile not found. Forcing sign out.");
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
          } else {
            // The session and profile are valid.
            setUser(currentUser);
            setProfile(profileData as Profile | null);
          }
        } else {
          // No session exists.
          setUser(null);
          setProfile(null);
        }
        
        // All paths now lead to a stable state. It's safe to stop loading.
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    console.log("Logging out user...");
    await supabase.auth.signOut();
    // The onAuthStateChange listener will automatically update the state.
  };

  const value = { user, profile, loading, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
