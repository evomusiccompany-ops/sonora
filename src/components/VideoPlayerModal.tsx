import React, { useRef, useState, useEffect } from 'react';
import { Track } from '../types';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  RotateCcw, 
  RotateCw, 
  Heart, 
  Sparkles,
  Radio,
  Share2,
  Tv
} from 'lucide-react';

interface VideoPlayerModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  track,
  isOpen,
  onClose,
  isLiked,
  onToggleLike
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [isOpen, track]);

  if (!isOpen || !track) return null;

  const isVertical = track.videoOrientation === 'vertical' || track.releaseType === 'clip';

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const skipSeconds = (delta: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.5;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-6 backdrop-blur-md animate-fadeIn">
      {/* Video container */}
      <div 
        className={`relative bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col items-center justify-center ${
          isVertical 
            ? 'w-full max-w-sm h-[88vh] aspect-[9/16]' 
            : 'w-full max-w-4xl aspect-video max-h-[88vh]'
        }`}
        onMouseEnter={() => setShowControls(true)}
      >
        {/* The Video Element */}
        <video
          ref={videoRef}
          src={track.mediaUrl}
          poster={track.coverUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
          playsInline
          autoPlay
          onClick={togglePlay}
        />

        {/* Top Header overlay */}
        <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[#1DB954] text-black font-extrabold text-[10px] tracking-wider uppercase">
              {isVertical ? 'Vertical Reel' : 'Music Video HD'}
            </span>
            <span className="text-white text-sm font-bold truncate max-w-[200px] sm:max-w-md">
              {track.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 hover:bg-zinc-800 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col gap-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-300">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="flex-1 h-1.5 accent-[#1DB954] bg-zinc-700/80 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono text-zinc-300">{formatTime(duration)}</span>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black translate-x-0.5" />}
              </button>

              <button
                onClick={() => skipSeconds(-10)}
                className="p-1.5 text-zinc-300 hover:text-white"
                title="Retroceder 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => skipSeconds(10)}
                className="p-1.5 text-zinc-300 hover:text-white"
                title="Adelantar 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 ml-2">
                <button onClick={toggleMute} className="text-zinc-300 hover:text-white">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-16 h-1 accent-[#1DB954] bg-zinc-700 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={track.artistAvatar}
                  alt={track.artistName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-zinc-300 hidden sm:inline">
                  {track.artistName}
                </span>
              </div>

              <button
                onClick={onToggleLike}
                className={`p-1.5 rounded-full ${isLiked ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#1DB954]' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
