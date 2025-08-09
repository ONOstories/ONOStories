import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// --- (Interfaces Profile, AuthContextType, AuthProviderProps remain the same) ---
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
// ---

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Default loading to true to prevent premature rendering
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //
    // --- STEP 1: Immediately check for an existing session on initial load ---
    //
    const getInitialSession = async () => {
      // supabase.auth.getSession() is the key. It gets the current session data.
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // A session was found. Now, we MUST validate it against the database.
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        // If no profile exists for this valid session, it's a ghost session. Sign out.
        if (!profileData) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
        } else {
          // The session and profile are valid. Set the state.
          setUser(session.user);
          setProfile(profileData as Profile);
        }
      }
      // Whether a session was found or not, the initial check is complete.
      setLoading(false);
    };

    getInitialSession();

    //
    // --- STEP 2: Listen for subsequent auth state changes (login, logout) ---
    //
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
           const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
           setProfile(profileData as Profile | null);
        } else {
          setProfile(null);
        }
        // When the listener fires, loading is no longer relevant.
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle setting user and profile to null.
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