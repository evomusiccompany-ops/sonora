import React from 'react';
import { Track } from '../types';
import { 
  Play, 
  Pause, 
  Heart, 
  Download, 
  Check, 
  Music2, 
  TrendingUp, 
  RefreshCw,
  Database,
  Layers
} from 'lucide-react';

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onOpenVideoModal: (track: Track) => void;
  likedTrackIds: Set<string>;
  onToggleLike: (trackId: string) => void;
  downloadedTrackIds: Set<string>;
  onToggleDownload: (track: Track) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  isSupabaseConnected?: boolean;
  emptyMessage?: string;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onOpenVideoModal,
  likedTrackIds,
  onToggleLike,
  downloadedTrackIds,
  onToggleDownload,
  isLoading = false,
  onRefresh,
  isSupabaseConnected = false,
  emptyMessage = 'No se encontraron pistas para este filtro.'
}) => {
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section className="space-y-3" id="track-list-section">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1DB954]" />
            <span>Catálogo de Pistas ({tracks.length})</span>
          </h2>

          {/* Database Connection Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors bg-zinc-900 border-zinc-800 text-zinc-300">
            <Database className={`w-3 h-3 ${isSupabaseConnected ? 'text-[#1DB954]' : 'text-emerald-400'}`} />
            <span>{isSupabaseConnected ? 'Supabase Live' : 'Supabase Client (getTracks)'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors text-xs flex items-center gap-1.5"
              title="Recargar canciones desde Supabase (getTracks())"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#1DB954]' : ''}`} />
              <span className="hidden sm:inline text-[11px] font-semibold">Recargar</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="bg-[#13151f]/80 border border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-800/60 shadow-xl animate-pulse">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 flex-1">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <div className="h-3.5 bg-zinc-800 rounded w-3/4" />
                  <div className="h-2.5 bg-zinc-800/60 rounded w-1/2" />
                </div>
              </div>
              <div className="hidden md:block h-3 bg-zinc-800 rounded w-20" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-zinc-800 rounded-full" />
                <div className="w-6 h-6 bg-zinc-800 rounded-full" />
                <div className="w-8 h-3 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <div className="bg-[#141620] border border-zinc-800 rounded-2xl p-8 text-center space-y-3">
          <Music2 className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">{emptyMessage}</p>
          <p className="text-xs text-zinc-500">
            Las pistas se consultan en tiempo real a través de Supabase <code>getTracks()</code>.
          </p>
        </div>
      ) : (
        <div className="bg-[#13151f]/80 border border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-800/60 shadow-xl">
          {tracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            const isCurrentlyPlaying = isCurrent && isPlaying;
            const isLiked = likedTrackIds.has(track.id);
            const isDownloaded = downloadedTrackIds.has(track.id);

            return (
              <div
                key={track.id}
                className={`px-4 py-3 flex items-center justify-between gap-3 transition-colors group ${
                  isCurrent ? 'bg-[#1DB954]/10' : 'hover:bg-zinc-800/40'
                }`}
              >
                {/* Left: Index / Play button & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => {
                      if (track.mediaType === 'video') {
                        onOpenVideoModal(track);
                      } else {
                        onPlayTrack(track);
                      }
                    }}
                    className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 group/cover cursor-pointer shadow-md"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                      isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover/cover:opacity-100'
                    }`}>
                      {isCurrentlyPlaying ? (
                        <Pause className="w-4 h-4 fill-[#1DB954] text-[#1DB954]" />
                      ) : (
                        <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                      )}
                    </div>
                  </button>

                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span 
                        onClick={() => track.mediaType === 'video' ? onOpenVideoModal(track) : onPlayTrack(track)}
                        className={`text-xs sm:text-sm font-bold truncate cursor-pointer hover:underline ${
                          isCurrent ? 'text-[#1DB954]' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </span>
                      {track.mediaType === 'video' && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-extrabold uppercase">
                          Video
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate mt-0.5">
                      <span className="hover:text-zinc-200">{track.artistName}</span>
                      <span>•</span>
                      <span className="hidden sm:inline text-zinc-500">{track.albumName}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-zinc-500">{track.genre}</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Plays count (desktop) */}
                <div className="hidden md:flex items-center text-xs text-zinc-400 font-mono w-28 text-right justify-end">
                  {track.plays.toLocaleString()} plays
                </div>

                {/* Right: Actions (Download, Like, Duration) */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    onClick={() => onToggleDownload(track)}
                    className={`p-1.5 rounded-full transition-colors ${
                      isDownloaded
                        ? 'text-[#1DB954]'
                        : 'text-zinc-400 hover:text-white opacity-60 group-hover:opacity-100'
                    }`}
                    title={isDownloaded ? 'Guardada offline' : 'Descargar pista'}
                  >
                    {isDownloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onToggleLike(track.id)}
                    className={`p-1.5 rounded-full transition-colors ${
                      isLiked ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Favorito"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1DB954]' : ''}`} />
                  </button>

                  <span className="text-xs font-mono text-zinc-400 w-10 text-right">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
