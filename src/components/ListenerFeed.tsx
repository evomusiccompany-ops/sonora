import React, { useState } from 'react';
import { Track } from '../types';
import { TrackList } from './TrackList';
import { 
  Play, 
  Pause, 
  Heart, 
  Video, 
  Film, 
  Search, 
  Music2, 
  Radio, 
  Sparkles, 
  Download, 
  Check, 
  Mic2,
  TrendingUp,
  Clock
} from 'lucide-react';

interface ListenerFeedProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onOpenVideoModal: (track: Track) => void;
  likedTrackIds: Set<string>;
  onToggleLike: (trackId: string) => void;
  downloadedTrackIds: Set<string>;
  onToggleDownload: (track: Track) => void;
  isOfflineMode: boolean;
  onOpenUploadModal: () => void;
  isLoadingTracks?: boolean;
  onRefreshTracks?: () => void;
  isSupabaseConnected?: boolean;
}

export const ListenerFeed: React.FC<ListenerFeedProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onOpenVideoModal,
  likedTrackIds,
  onToggleLike,
  downloadedTrackIds,
  onToggleDownload,
  isOfflineMode,
  onOpenUploadModal,
  isLoadingTracks = false,
  onRefreshTracks,
  isSupabaseConnected = false
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'audio' | 'video' | 'podcast' | 'downloaded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tracks
  const filteredTracks = tracks.filter((t) => {
    // If offline mode is enabled, only show downloaded tracks
    if (isOfflineMode && !downloadedTrackIds.has(t.id)) {
      return false;
    }

    if (selectedFilter === 'audio' && t.mediaType !== 'audio') return false;
    if (selectedFilter === 'video' && t.mediaType !== 'video') return false;
    if (selectedFilter === 'podcast' && t.releaseType !== 'podcast') return false;
    if (selectedFilter === 'downloaded' && !downloadedTrackIds.has(t.id)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.artistName.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q) ||
        t.albumName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const featuredTrack = tracks[0];

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 pb-28" id="listener-feed-container">
      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar canciones, artistas, videoclips o géneros..."
            className="w-full bg-[#151722] border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954] transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === 'all'
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            Todo
          </button>
          <button
            onClick={() => setSelectedFilter('audio')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedFilter === 'audio'
                ? 'bg-[#1DB954] text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Music2 className="w-3 h-3" />
            <span>Música</span>
          </button>
          <button
            onClick={() => setSelectedFilter('video')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedFilter === 'video'
                ? 'bg-[#1DB954] text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Film className="w-3 h-3" />
            <span>Videos & Shorts</span>
          </button>
          <button
            onClick={() => setSelectedFilter('podcast')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedFilter === 'podcast'
                ? 'bg-[#1DB954] text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Mic2 className="w-3 h-3" />
            <span>Podcasts</span>
          </button>
          <button
            onClick={() => setSelectedFilter('downloaded')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedFilter === 'downloaded'
                ? 'bg-amber-400 text-black font-bold'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Download className="w-3 h-3" />
            <span>Descargas ({downloadedTrackIds.size})</span>
          </button>
        </div>
      </div>

      {/* Offline notice if active */}
      {isOfflineMode && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <span>Modo Offline activado: mostrando únicamente las canciones guardadas localmente en caché.</span>
          </div>
          <span className="font-mono text-[11px] font-bold">{filteredTracks.length} disponibles</span>
        </div>
      )}

      {/* Featured Hero Banner (if no search and 'all' or 'audio' filter) */}
      {!searchQuery && selectedFilter === 'all' && !isOfflineMode && featuredTrack && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-[#12141d] border border-emerald-500/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-3 z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 text-[#1DB954] text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Lanzamiento Destacado
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {featuredTrack.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 flex items-center gap-2">
              <span className="font-semibold text-white">{featuredTrack.artistName}</span>
              <span>•</span>
              <span>{featuredTrack.albumName}</span>
              <span>•</span>
              <span className="text-[#1DB954] font-medium">{featuredTrack.genre}</span>
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onPlayTrack(featuredTrack)}
                className="px-6 py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#1DB954]/25 transition-transform hover:scale-105 active:scale-95"
              >
                {currentTrack?.id === featuredTrack.id && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-black" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>Reproducir Ahora</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onToggleLike(featuredTrack.id)}
                className="p-3 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 hover:text-white transition-colors"
                title="Guardar en favoritos"
              >
                <Heart className={`w-4 h-4 ${likedTrackIds.has(featuredTrack.id) ? 'fill-[#1DB954] text-[#1DB954]' : ''}`} />
              </button>
            </div>
          </div>

          <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60 shrink-0 group">
            <img
              src={featuredTrack.coverUrl}
              alt={featuredTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
          </div>
        </div>
      )}

      {/* Video & Shorts Carousel Section */}
      {(selectedFilter === 'all' || selectedFilter === 'video') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-[#1DB954]" />
              <span>Videoclips & Clips Cortos</span>
            </h2>
            <span className="text-xs text-zinc-400">Audio visual interactivo</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {tracks
              .filter((t) => t.mediaType === 'video')
              .map((videoTrack) => {
                const isVertical = videoTrack.videoOrientation === 'vertical';
                return (
                  <div
                    key={videoTrack.id}
                    onClick={() => onOpenVideoModal(videoTrack)}
                    className="group relative bg-[#151722] border border-zinc-800/80 rounded-xl overflow-hidden hover:border-[#1DB954]/50 transition-all cursor-pointer shadow-lg flex flex-col"
                  >
                    <div className={`relative w-full overflow-hidden bg-zinc-900 ${isVertical ? 'aspect-[9/14]' : 'aspect-video'}`}>
                      <img
                        src={videoTrack.coverUrl}
                        alt={videoTrack.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-black translate-x-0.5" />
                        </div>
                      </div>

                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase">
                        {isVertical ? 'Short 9:16' : 'Video HD'}
                      </span>

                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300">
                        {formatDuration(videoTrack.duration)}
                      </span>
                    </div>

                    <div className="p-3">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#1DB954] truncate">
                        {videoTrack.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {videoTrack.artistName}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Main Track List */}
      <TrackList
        tracks={filteredTracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayTrack={onPlayTrack}
        onOpenVideoModal={onOpenVideoModal}
        likedTrackIds={likedTrackIds}
        onToggleLike={onToggleLike}
        downloadedTrackIds={downloadedTrackIds}
        onToggleDownload={onToggleDownload}
        isLoading={isLoadingTracks}
        onRefresh={onRefreshTracks}
        isSupabaseConnected={isSupabaseConnected}
        emptyMessage={
          isOfflineMode
            ? 'No tienes pistas descargadas en caché todavía. Descarga una canción presionando el icono de descarga.'
            : 'No se encontraron pistas para este filtro. Intenta con otro término o sube tu propia canción en el Panel Creador.'
        }
      />
    </div>
  );
};
