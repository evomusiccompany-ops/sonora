import React, { useState, useEffect } from 'react';
import { Track } from '../types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Heart, 
  Maximize2, 
  ListMusic, 
  Mic2,
  Download,
  Check
} from 'lucide-react';

interface AudioPlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isRepeat: boolean;
  isShuffle: boolean;
  isLiked: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onChangeVolume: (val: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleLike: () => void;
  onOpenFullscreen: () => void;
  onToggleLyrics: () => void;
  onToggleQueue: () => void;
  onDownloadOffline: (track: Track) => void;
  isDownloaded?: boolean;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isRepeat,
  isShuffle,
  isLiked,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onChangeVolume,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onToggleLike,
  onOpenFullscreen,
  onToggleLyrics,
  onToggleQueue,
  onDownloadOffline,
  isDownloaded
}) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  useEffect(() => {
    if (!isScrubbing) {
      setScrubValue(currentTime);
    }
  }, [currentTime, isScrubbing]);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (scrubValue / duration) * 100 : 0;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#12131a]/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-2.5 flex flex-col gap-1 text-white shadow-2xl"
      id="persistent-audio-player"
    >
      {/* Top progress scrubber */}
      <div className="w-full flex items-center gap-2 group/bar">
        <span className="text-[11px] font-mono text-zinc-400 w-8 text-right select-none">
          {formatTime(scrubValue)}
        </span>
        
        <div className="relative flex-1 flex items-center h-4 cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={scrubValue}
            onChange={(e) => {
              setIsScrubbing(true);
              setScrubValue(Number(e.target.value));
            }}
            onMouseUp={() => {
              setIsScrubbing(false);
              onSeek(scrubValue);
            }}
            onTouchEnd={() => {
              setIsScrubbing(false);
              onSeek(scrubValue);
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            id="audio-scrub-input"
          />
          {/* Track background */}
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden group-hover/bar:h-1.5 transition-all">
            <div 
              className="h-full bg-gradient-to-r from-[#1DB954] to-emerald-400 transition-[width] duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Thumb marker */}
          <div 
            className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-md pointer-events-none group-hover/bar:scale-125 transition-transform"
            style={{ left: `calc(${progressPercent}% - 5px)` }}
          />
        </div>

        <span className="text-[11px] font-mono text-zinc-400 w-8 select-none">
          {formatTime(duration)}
        </span>
      </div>

      {/* Main player controls row */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          <div 
            onClick={onOpenFullscreen}
            className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 group cursor-pointer shadow-md"
          >
            <img 
              src={currentTrack.coverUrl} 
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                <span className="w-0.5 bg-[#1DB954] rounded-full animate-eq-1" />
                <span className="w-0.5 bg-[#1DB954] rounded-full animate-eq-2" />
                <span className="w-0.5 bg-[#1DB954] rounded-full animate-eq-3" />
              </div>
            )}
          </div>

          <div className="min-w-0 pr-1">
            <h4 
              onClick={onOpenFullscreen}
              className="text-xs font-bold text-white hover:underline cursor-pointer truncate"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer truncate">
              {currentTrack.artistName}
            </p>
          </div>

          <button
            onClick={onToggleLike}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${
              isLiked ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
            }`}
            title={isLiked ? 'Guardado en tus favoritos' : 'Me gusta'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1DB954]' : ''}`} />
          </button>

          <button
            onClick={() => onDownloadOffline(currentTrack)}
            className={`p-1.5 rounded-full transition-colors shrink-0 hidden sm:block ${
              isDownloaded ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
            }`}
            title={isDownloaded ? 'Descargada para modo offline' : 'Descargar canción'}
          >
            {isDownloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: Playback Buttons */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={onToggleShuffle}
            className={`p-1.5 rounded-full transition-colors hidden sm:block ${
              isShuffle ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
            }`}
            title="Modo aleatorio"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={onPrev}
            className="p-1.5 text-zinc-300 hover:text-white transition-colors"
            title="Anterior"
            id="player-prev-btn"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            id="player-play-pause-btn"
            className="w-10 h-10 rounded-full bg-white hover:bg-zinc-100 text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-1.5 text-zinc-300 hover:text-white transition-colors"
            title="Siguiente"
            id="player-next-btn"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={onToggleRepeat}
            className={`p-1.5 rounded-full transition-colors hidden sm:block ${
              isRepeat ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
            }`}
            title="Repetir"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Auxiliary & Volume Controls */}
        <div className="flex items-center justify-end gap-2.5 min-w-0 w-1/4">
          <button
            onClick={onToggleLyrics}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors hidden md:block"
            title="Ver Letras"
          >
            <Mic2 className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleQueue}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors hidden sm:block"
            title="Cola de reproducción"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume control */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={onToggleMute}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onChangeVolume(Number(e.target.value))}
              className="w-18 h-1 accent-[#1DB954] cursor-pointer bg-zinc-700 rounded-lg"
              title="Volumen"
            />
          </div>

          <button
            onClick={onOpenFullscreen}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            title="Pantalla completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
