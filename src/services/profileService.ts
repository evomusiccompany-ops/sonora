import { supabase, getSupabase } from '../services/supabase';

export interface ProfileData {
  id: string;
  full_name?: string;
  avatar_url?: string | null;
  banner_url?: string | null;
  stage_name?: string;
  bio?: string;
  role?: string;
  email?: string;
  updated_at?: Date | string;
}

/**
 * Save or update a profile record safely avoiding RLS upsert policy violations:
 * 1. Executes a .select() checking if the row already exists for user.id
 * 2. If it exists, executes .update(...) filtering by .eq('id', user.id), always including id: user.id
 * 3. If it does not exist, executes .insert(...) with explicit id: user.id
 */
export async function saveOrUpdateProfile(profile: ProfileData): Promise<{ data: any; error: any }> {
  const client = getSupabase() || supabase;
  if (!client) {
    return { data: null, error: new Error('Supabase client not initialized') };
  }

  const userId = profile.id;
  if (!userId) {
    return { data: null, error: new Error('Missing profile user id') };
  }

  try {
    // 1. Select existing row
    const { data: existing, error: selectError } = await client
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (selectError) {
      console.warn('Notice selecting profile:', selectError.message);
    }

    const payload: Record<string, any> = {
      id: userId, // 4. Asegúrate de pasar siempre id: user.id dentro del objeto a actualizar
      ...profile,
      updated_at: new Date()
    };

    // 2. If row exists, execute only .update() filtered by .eq('id', user.id)
    if (existing?.id) {
      const { data, error } = await client
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      if (error) {
        console.error('Error updating profiles row:', error.message);
        return { data: null, error };
      }
      return { data, error: null };
    } else {
      // 3. If it does not exist, execute .insert() explicitly assigning id: user.id
      const { data, error } = await client
        .from('profiles')
        .insert({
          id: userId,
          ...payload
        });

      if (error) {
        console.error('Error inserting profiles row:', error.message);
        return { data: null, error };
      }
      return { data, error: null };
    }
  } catch (err: any) {
    console.error('Unexpected error in saveOrUpdateProfile:', err);
    return { data: null, error: err };
  }
}
