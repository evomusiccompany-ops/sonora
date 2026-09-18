import React from 'react';
import { User } from '../types';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Headphones, 
  Mic2, 
  ShieldCheck, 
  Sparkles, 
  Music,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onGoToStudio?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onGoToStudio
}) => {
  if (!isOpen) return null;

  const isArtist = user.role === 'creator';
  const isAdmin = user.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#14161f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        id="user-profile-dialog"
      >
        {/* Cover banner */}
        <div className="h-28 bg-gradient-to-r from-emerald-900/60 via-zinc-900 to-purple-900/60 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-zinc-300 hover:text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile info */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar floating */}
          <div className="-mt-14 mb-4 flex items-end justify-between">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-20 h-20 rounded-2xl object-cover border-4 border-[#14161f] shadow-lg bg-zinc-800"
              />
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-[#14161f]">
                  ✓
                </div>
              )}
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase border flex items-center gap-1.5 ${
              isArtist 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                : isAdmin
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-[#1DB954] border-[#1DB954]/30'
            }`}>
              {isArtist ? <Mic2 className="w-3.5 h-3.5" /> : isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
              {isArtist ? 'Artista / Creador' : isAdmin ? 'Administrador' : 'Oyente'}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {user.stageName || user.name}
            </h3>
            {user.stageName && (
              <p className="text-xs text-zinc-400">{user.name}</p>
            )}
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              {user.email}
            </p>
          </div>

          {user.bio && (
            <div className="mt-4 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
              {user.bio}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
              <div className="text-xs text-zinc-400">Plan de Membresía</div>
              <div className="text-sm font-bold text-white capitalize mt-0.5 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" />
                {user.plan === 'premium' ? 'Sonora HiFi Pro' : 'Estándar Gratis'}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
              <div className="text-xs text-zinc-400">{isArtist ? 'Seguidores' : 'Artistas Seguidos'}</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {user.followersCount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Account details */}
          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              Miembro desde {user.createdAt || '2026'}
            </span>
            <span className="flex items-center gap-1 text-[#1DB954]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cuenta Verificada
            </span>
          </div>

          {isArtist && onGoToStudio && (
            <button
              onClick={() => {
                onClose();
                onGoToStudio();
              }}
              className="w-full mt-5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs"
            >
              <Music className="w-4 h-4" />
              Ir a mi Panel de Creador / Studio
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
