import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { supabase, getSupabase } from '../services/supabase';

export interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  fetchUserProfile: (userId: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. fetchUserProfile(userId): Consulta la tabla 'profiles' con .single()
  // y establece el estado global con full_name, avatar_url, banner_url y role
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    const client = getSupabase() || supabase;
    if (!client || !userId) return null;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Notice querying profiles table:', error.message);
      }

      if (data) {
        const mappedRole: UserRole =
          data.role === 'artist' || data.role === 'creator'
            ? 'creator'
            : (data.role === 'admin' ? 'admin' : 'listener');

        const resolvedName = data.full_name || data.name || 'Usuario';
        const defaultAvatar = mappedRole === 'creator'
          ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

        const userObj: User = {
          id: data.id || userId,
          name: resolvedName,
          stageName: data.stage_name || undefined,
          email: data.email || '',
          role: mappedRole,
          avatar: data.avatar_url || defaultAvatar,
          banner: data.banner_url || undefined,
          bio: data.bio || undefined,
          verified: mappedRole === 'creator',
          followersCount: 0,
          plan: 'free',
          createdAt: data.created_at || new Date().toISOString().split('T')[0]
        };

        setCurrentUser((prev) => ({
          ...userObj,
          email: userObj.email || prev?.email || ''
        }));

        return userObj;
      } else {
        // If row doesn't exist yet in 'profiles', check auth user to create baseline
        const { data: { user: authUser } } = await client.auth.getUser();
        if (authUser && authUser.id === userId) {
          const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario';
          const avatarUrl = authUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

          await client.from('profiles').upsert({
            id: userId,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date()
          });

          const initialUser: User = {
            id: userId,
            name: fullName,
            email: authUser.email || '',
            avatar: avatarUrl,
            role: 'listener',
            followersCount: 0,
            plan: 'free',
            createdAt: new Date().toISOString().split('T')[0]
          };
          setCurrentUser(initialUser);
          return initialUser;
        }
      }
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
    }

    return null;
  }, []);

  // Al detectar un usuario autenticado (onAuthStateChange o getUser)
  useEffect(() => {
    const client = getSupabase() || supabase;
    if (!client) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Verificar usuario autenticado mediante getUser()
    const initAuthUser = async () => {
      try {
        const { data: { user: authUser } } = await client.auth.getUser();
        if (authUser && isMounted) {
          await fetchUserProfile(authUser.id);
        }
      } catch (err) {
        console.warn('Auth getUser initialization check:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuthUser();

    // Escuchar cambios de estado en la autenticación
    const { data: authSubscription } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    });

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signOut = async () => {
    const client = getSupabase() || supabase;
    try {
      if (client) {
        await client.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out notice:', err);
    } finally {
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        currentUser,
        setCurrentUser,
        fetchUserProfile,
        signOut,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
