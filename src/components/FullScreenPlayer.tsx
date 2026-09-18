import React, { useState } from 'react';
import { Track } from '../types';
import { 
  ChevronDown, 
  Heart, 
  Share2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Volume2, 
  Sparkles,
  Radio,
  FileText
} from 'lucide-react';

interface FullScreenPlayerProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  track,
  isOpen,
  onClose,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  isLiked,
  onToggleLike
}) => {
  const [activeView, setActiveView] = useState<'cover' | 'lyrics'>('cover');

  if (!isOpen || !track) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0d0e14] flex flex-col justify-between p-6 sm:p-10 overflow-y-auto animate-fadeIn">
      {/* Background ambient glow */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center blur-3xl pointer-events-none scale-125"
        style={{ backgroundImage: `url(${track.coverUrl})` }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Minimizar"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
            Reproduciendo desde álbum
          </span>
          <h3 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
            {track.albumName || 'Sonora Singles'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView(activeView === 'cover' ? 'lyrics' : 'cover')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              activeView === 'lyrics'
                ? 'bg-[#1DB954] text-black border-[#1DB954]'
                : 'bg-zinc-900/60 text-zinc-300 border-zinc-700/60 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Letras</span>
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        {activeView === 'cover' ? (
          <div className="flex flex-col items-center w-full">
            <div className="relative aspect-square w-full max-w-[340px] sm:max-w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/50 group">
              <img
                src={track.coverUrl}
                alt={track.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              {isPlaying && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-[#1DB954] flex items-center gap-1.5 border border-[#1DB954]/30">
                  <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
                  <span>En vivo</span>
                </div>
              )}
            </div>

            {/* Live Audio Spectrum Bar Simulator */}
            <div className="flex items-center justify-center gap-1 h-8 mt-6">
              {[40, 75, 90, 50, 80, 60, 95, 70, 85, 45, 90, 65, 80, 55].map((height, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying ? 'bg-[#1DB954]' : 'bg-zinc-700'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(8, (height * ((currentTime * 3 + idx) % 10)) / 10)}px` : '6px'
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Lyrics View */
          <div className="w-full max-w-md h-[340px] overflow-y-auto bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" /> Letras sincronizadas
            </h4>
            {track.lyrics && track.lyrics.length > 0 ? (
              track.lyrics.map((line, idx) => (
                <p 
                  key={idx} 
                  className={`text-base font-semibold leading-relaxed transition-colors ${
                    idx === 2 ? 'text-[#1DB954] scale-105 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-sm text-zinc-500 italic">No hay letras disponibles para esta pista.</p>
            )}
          </div>
        )}

        {/* Title and artist */}
        <div className="w-full flex items-center justify-between mt-6">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">
              {track.title}
            </h2>
            <p className="text-sm font-medium text-zinc-400 truncate mt-0.5">
              {track.artistName}
            </p>
          </div>

          <button
            onClick={onToggleLike}
            className={`p-2.5 rounded-full transition-colors ${
              isLiked ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#1DB954]' : ''}`} />
          </button>
        </div>

        {/* Scrubber */}
        <div className="w-full mt-5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1.5 accent-[#1DB954] bg-zinc-800 rounded-lg cursor-pointer"
          />
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mt-1.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Fullscreen playback controls */}
        <div className="w-full flex items-center justify-between mt-6 px-4">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={onPrev}
            className="text-zinc-200 hover:text-white transition-transform active:scale-95"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-black" />
            ) : (
              <Play className="w-8 h-8 fill-black translate-x-1" />
            )}
          </button>

          <button
            onClick={onNext}
            className="text-zinc-200 hover:text-white transition-transform active:scale-95"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button className="text-zinc-400 hover:text-white transition-colors">
            <Repeat className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom info banner */}
      <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/60 pt-4">
        <span className="flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-[#1DB954]" /> Sonora High-Definition Audio (FLAC 24-bit / 96kHz)
        </span>
        <span className="font-mono">ID: {track.id}</span>
      </div>
    </div>
  );
};
