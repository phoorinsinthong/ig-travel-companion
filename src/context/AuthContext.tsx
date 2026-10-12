import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AppUser {
  id: string; // Supabase auth user id
  email: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  promptpay_number?: string;
  promptpay_qr_url?: string;
}

interface AuthContextType {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  appUser: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Pick<AppUser, 'username' | 'full_name' | 'profile_pic_url' | 'promptpay_number' | 'promptpay_qr_url'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch or create user profile in public.users table
  const syncUserProfile = async (authUser: SupabaseUser): Promise<AppUser | null> => {
    if (!supabase) return null;

    try {
      // Try to fetch existing profile
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (existingUser && !fetchError) {
        return {
          id: existingUser.id,
          email: authUser.email || '',
          username: existingUser.username,
          full_name: existingUser.full_name,
          profile_pic_url: existingUser.profile_pic_url,
          promptpay_number: existingUser.promptpay_number,
          promptpay_qr_url: existingUser.promptpay_qr_url,
        };
      }

      // Create new profile
      const username = authUser.user_metadata?.username ||
        authUser.email?.split('@')[0] ||
        `user_${Date.now()}`;
      const fullName = authUser.user_metadata?.full_name || username;

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          ig_user_id: authUser.id, // Use auth id as ig_user_id
          username,
          full_name: fullName,
          profile_pic_url: authUser.user_metadata?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=833AB4&color=fff&size=150`,
          promptpay_number: '',
          promptpay_qr_url: '',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return null;
      }

      return {
        id: newUser.id,
        email: authUser.email || '',
        username: newUser.username,
        full_name: newUser.full_name,
        profile_pic_url: newUser.profile_pic_url,
        promptpay_number: newUser.promptpay_number,
        promptpay_qr_url: newUser.promptpay_qr_url,
      };
    } catch (err) {
      console.error('syncUserProfile error:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        const profile = await syncUserProfile(session.user);
        setAppUser(profile);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        const profile = await syncUserProfile(session.user);
        setAppUser(profile);
      } else {
        setAppUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string, fullName: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'ระบบยังไม่พร้อม กรุณาตั้งค่า Supabase ก่อน' };

    // Check username uniqueness first
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase().trim())
      .maybeSingle();

    if (existingUsername) {
      return { error: `Username "@${username}" ถูกใช้แล้ว กรุณาเลือก username อื่น` };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase().trim(),
          full_name: fullName || username,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { error: 'Email นี้ถูกลงทะเบียนแล้ว กรุณา Login' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'ระบบยังไม่พร้อม กรุณาตั้งค่า Supabase ก่อน' };

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Email หรือ Password ไม่ถูกต้อง' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'กรุณายืนยัน Email ก่อน Login (เช็ค inbox ของคุณ)' };
      }
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAppUser(null);
    setSession(null);
    setSupabaseUser(null);
  };

  const updateProfile = async (data: Partial<Pick<AppUser, 'username' | 'full_name' | 'profile_pic_url' | 'promptpay_number' | 'promptpay_qr_url'>>) => {
    if (!supabase || !supabaseUser || !appUser) return;

    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', supabaseUser.id);

    if (!error) {
      setAppUser((prev) => prev ? { ...prev, ...data } : prev);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        supabaseUser,
        appUser,
        isLoading,
        isAuthenticated: !!session && !!appUser,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
