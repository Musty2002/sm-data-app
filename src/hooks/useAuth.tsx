import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Wallet } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  wallet: Wallet | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, retryCount = 0): Promise<void> => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setProfile(data as Profile);
    } else if (retryCount < 3) {
      // Retry after a short delay - the database trigger might not have completed yet
      await new Promise(resolve => setTimeout(resolve, 500));
      return fetchProfile(userId, retryCount + 1);
    }
  };

  const fetchWallet = async (userId: string, retryCount = 0): Promise<void> => {
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setWallet(data as Wallet);
    } else if (retryCount < 3) {
      // Retry after a short delay - the database trigger might not have completed yet
      await new Promise(resolve => setTimeout(resolve, 500));
      return fetchWallet(userId, retryCount + 1);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchWallet(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setWallet(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchWallet(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
          referral_code: referralCode || null,
        }
      }
    });
    
    // If signup successful, automatically create virtual account with PaymentPoint
    if (!error && data.user && data.session) {
      try {
        console.log('Creating virtual account for new user...');
        const { data: vaData, error: vaError } = await supabase.functions.invoke('create-virtual-account', {
          body: {
            userId: data.user.id,
            email: email,
            name: fullName,
            phoneNumber: phone,
          }
        });
        
        if (vaError) {
          console.error('Error creating virtual account:', vaError);
        } else {
          console.log('Virtual account created:', vaData);
          // Refresh profile to get the new account number
          setTimeout(() => fetchProfile(data.user!.id), 1000);
        }
      } catch (vaErr) {
        console.error('Failed to create virtual account:', vaErr);
      }
    }
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setWallet(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshWallet = async () => {
    if (user) {
      await fetchWallet(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      wallet,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      refreshWallet,
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