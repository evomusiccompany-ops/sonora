import { supabase, getSupabase } from '../services/supabase';

export interface UploadFileOptions {
  bucket: 'covers' | 'audio' | 'avatars';
  file: File;
  customPath?: string;
  pathPrefix?: string;
}

export interface UploadResult {
  publicUrl: string;
  path: string;
  error: Error | null;
}

/**
 * Uploads a file to Supabase Storage bucket ('covers', 'audio', or 'avatars')
 * and returns the generated public URL.
 * 
 * If Supabase is unreachable or unconfigured, falls back to an in-memory
 * Object URL so local testing and offline usage remain completely unbroken.
 */
export async function uploadToStorage({
  bucket,
  file,
  customPath,
  pathPrefix = 'uploads'
}: UploadFileOptions): Promise<UploadResult> {
  const client = getSupabase() || supabase;

  // Clean filename and make unique path if customPath is not specified
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const filePath = customPath || `${pathPrefix}/${timestamp}_${sanitizedFileName}`;

  if (!client) {
    console.warn(`Supabase client is not available. Using local Blob URL for ${file.name}.`);
    const fallbackUrl = URL.createObjectURL(file);
    return {
      publicUrl: fallbackUrl,
      path: filePath,
      error: null
    };
  }

  try {
    // 1. Upload to Supabase Storage bucket
    const { data, error: uploadError } = await client.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || undefined
      });

    if (uploadError) {
      console.warn(`Supabase storage upload error on bucket '${bucket}':`, uploadError.message);
      // Fallback gracefully to object URL so the user's action doesn't get hard-blocked
      const fallbackUrl = URL.createObjectURL(file);
      return {
        publicUrl: fallbackUrl,
        path: filePath,
        error: new Error(uploadError.message)
      };
    }

    // 2. Get Public URL
    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(data?.path || filePath);

    return {
      publicUrl: publicUrlData.publicUrl,
      path: data?.path || filePath,
      error: null
    };
  } catch (err: any) {
    console.error(`Unexpected error uploading to bucket '${bucket}':`, err);
    const fallbackUrl = URL.createObjectURL(file);
    return {
      publicUrl: fallbackUrl,
      path: filePath,
      error: err instanceof Error ? err : new Error(String(err))
    };
  }
}

/**
 * Uploads an audio track file (.mp3, .wav) to the 'audio' bucket
 */
export async function uploadAudioFile(file: File, artistId: string = 'artist'): Promise<UploadResult> {
  return uploadToStorage({
    bucket: 'audio',
    file,
    pathPrefix: `tracks/${artistId}`
  });
}

/**
 * Uploads a cover artwork file (.jpg, .png, .webp) to the 'covers' bucket
 */
export async function uploadCoverImage(file: File, artistId: string = 'artist'): Promise<UploadResult> {
  return uploadToStorage({
    bucket: 'covers',
    file,
    pathPrefix: `artwork/${artistId}`
  });
}

/**
 * Uploads a user avatar image to the 'avatars' bucket
 * Path: ${userId}/avatar_${Date.now()}.${ext}
 */
export async function uploadUserAvatar(file: File, userId: string): Promise<UploadResult> {
  const extension = file.name.split('.').pop() || 'png';
  const customPath = `${userId}/avatar_${Date.now()}.${extension}`;
  return uploadToStorage({
    bucket: 'avatars',
    file,
    customPath
  });
}

/**
 * Uploads a user profile banner image to the 'avatars' bucket
 * Path: ${userId}/banner_${Date.now()}.${ext}
 */
export async function uploadUserBanner(file: File, userId: string): Promise<UploadResult> {
  const extension = file.name.split('.').pop() || 'png';
  const customPath = `${userId}/banner_${Date.now()}.${extension}`;
  return uploadToStorage({
    bucket: 'avatars',
    file,
    customPath
  });
}

/**
 * Updates avatar_url or banner_url in the Supabase 'profiles' table using upsert
 */
export async function updateUserProfileUrls(
  userId: string, 
  updates: { avatar_url?: string; banner_url?: string; full_name?: string; name?: string; bio?: string; stage_name?: string }
): Promise<{ success: boolean; error: any }> {
  const client = getSupabase() || supabase;
  if (!client) {
    return { success: true, error: null };
  }

  try {
    const upsertPayload: Record<string, any> = {
      id: userId,
      updated_at: new Date(),
      ...updates
    };

    if (updates.name && !updates.full_name) {
      upsertPayload.full_name = updates.name;
    }

    // Upsert into 'profiles' table
    const { error: profileError } = await client
      .from('profiles')
      .upsert(upsertPayload);

    if (!profileError) {
      return { success: true, error: null };
    }

    console.warn("Notice updating 'profiles' table, attempting fallback to 'users':", profileError.message);

    // Fallback to 'users' table
    const { error: usersError } = await client
      .from('users')
      .upsert(upsertPayload);

    if (usersError) {
      console.error("Error updating user profile in both tables:", usersError);
      return { success: false, error: usersError };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error updating profile:", err);
    return { success: false, error: err };
  }
}
