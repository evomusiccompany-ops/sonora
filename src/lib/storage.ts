import { supabase, getSupabase } from '../services/supabase';

export interface UploadFileOptions {
  bucket: 'covers' | 'audio';
  file: File;
  pathPrefix?: string;
}

export interface UploadResult {
  publicUrl: string;
  path: string;
  error: Error | null;
}

/**
 * Uploads a file to Supabase Storage bucket ('covers' or 'audio')
 * and returns the generated public URL.
 * 
 * If Supabase is unreachable or unconfigured, falls back to an in-memory
 * Object URL so local testing and offline usage remain completely unbroken.
 */
export async function uploadToStorage({
  bucket,
  file,
  pathPrefix = 'uploads'
}: UploadFileOptions): Promise<UploadResult> {
  const client = getSupabase() || supabase;

  // Clean filename and make unique path
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const filePath = `${pathPrefix}/${timestamp}_${sanitizedFileName}`;

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
