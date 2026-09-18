import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Track } from '../types';
import { INITIAL_TRACKS } from './mockData';

const rawSupabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://vfkuyilizcbxpbgeibwa.supabase.co'
).trim();

const rawSupabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_1u6PNilTXJPSDOLNTUAAxA_2NVpl7dw'
).trim();

/**
 * Validates that the provided string is a genuine HTTP or HTTPS URL
 * to avoid Supabase throwing 'Invalid supabaseUrl' errors when not configured.
 */
function isValidHttpUrl(urlString: string): boolean {
  if (!urlString) return false;
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(urlString);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !urlString.includes('placeholder');
  } catch {
    return false;
  }
}

function isValidAnonKey(key: string): boolean {
  if (!key) return false;
  return key.length > 10 && !key.includes('placeholder') && !key.includes('MY_KEY');
}

export const isSupabaseConfigured = isValidHttpUrl(rawSupabaseUrl) && isValidAnonKey(rawSupabaseAnonKey);

let clientInstance: SupabaseClient | null = null;

/**
 * Returns the Supabase client instance safely.
 * Uses @supabase/ssr createBrowserClient when available, with fallback to createClient.
 * If credentials are missing or invalid, returns null gracefully without crashing the app.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  if (!clientInstance) {
    try {
      clientInstance = createBrowserClient(rawSupabaseUrl, rawSupabaseAnonKey);
    } catch {
      try {
        clientInstance = createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
      } catch (err) {
        console.warn('Could not initialize Supabase client:', err);
        clientInstance = null;
      }
    }
  }

  return clientInstance;
}

export const supabase: SupabaseClient | null = getSupabase();

/**
 * Fetches tracks from Supabase `tracks` table.
 * If Supabase is not configured or table is empty/unreachable,
 * seamlessly falls back to INITIAL_TRACKS so the audio experience remains unbroken.
 */
export async function getTracks(): Promise<Track[]> {
  const client = getSupabase();

  if (!client) {
    return INITIAL_TRACKS;
  }

  try {
    const { data, error } = await client
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase query notice on tracks:', error.message);
      return INITIAL_TRACKS;
    }

    if (!data || data.length === 0) {
      return INITIAL_TRACKS;
    }

    return data.map((item: Record<string, any>): Track => ({
      id: String(item.id || `track-${Math.random()}`),
      title: item.title || 'Sin título',
      artistId: item.artist_id || item.artistId || 'creator-neo-01',
      artistName: item.artist_name || item.artistName || 'NeoNova',
      artistAvatar: item.artist_avatar || item.artistAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      albumName: item.album_name || item.albumName || item.title,
      releaseType: item.release_type || item.releaseType || 'single',
      coverUrl: item.cover_url || item.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      mediaUrl: item.media_url || item.mediaUrl || 'virtual://synth-midnight',
      mediaType: item.media_type || item.mediaType || 'audio',
      videoOrientation: item.video_orientation || item.videoOrientation,
      duration: Number(item.duration_seconds || item.duration || 180),
      genre: item.genre || 'Urban / Reggaeton',
      releaseDate: item.release_date || item.releaseDate || new Date().toISOString().split('T')[0],
      plays: Number(item.plays_count || item.plays || 0),
      likes: Number(item.likes_count || item.likes || 0),
      lyrics: Array.isArray(item.lyrics) ? item.lyrics : undefined,
      monetizationEnabled: item.monetization_enabled !== undefined 
        ? Boolean(item.monetization_enabled) 
        : (item.monetizationEnabled ?? true),
      adFrequencyPlays: Number(item.ad_frequency_plays || item.adFrequencyPlays || 3),
      isDownloaded: Boolean(item.is_downloaded || item.isDownloaded),
      bpm: item.bpm ? Number(item.bpm) : undefined,
    }));
  } catch (err) {
    console.error('Unexpected error in getTracks():', err);
    return INITIAL_TRACKS;
  }
}

/**
 * Creates or uploads a new track to Supabase.
 */
export async function createTrack(track: Track): Promise<boolean> {
  const client = getSupabase();
  if (!client) {
    return false;
  }

  try {
    const { error } = await client.from('tracks').insert([
      {
        id: track.id,
        title: track.title,
        artist_id: track.artistId,
        artist_name: track.artistName,
        artist_avatar: track.artistAvatar,
        album_name: track.albumName,
        release_type: track.releaseType,
        cover_url: track.coverUrl,
        media_url: track.mediaUrl,
        media_type: track.mediaType,
        video_orientation: track.videoOrientation,
        duration_seconds: track.duration,
        genre: track.genre,
        release_date: track.releaseDate,
        plays_count: track.plays,
        likes_count: track.likes,
        monetization_enabled: track.monetizationEnabled,
        ad_frequency_plays: track.adFrequencyPlays,
        bpm: track.bpm,
        lyrics: track.lyrics,
      },
    ]);

    if (error) {
      console.warn('Error inserting track in Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error inserting track in Supabase:', err);
    return false;
  }
}
