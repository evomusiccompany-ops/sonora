import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  Headphones, 
  Mic2, 
  Wifi, 
  WifiOff, 
  User as UserIcon,
  Sparkles, 
  Radio,
  ChevronDown,
  LogIn,
  Sliders,
  LogOut,
  UserPlus
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeRole?: UserRole;
  currentTab: 'stream' | 'studio' | 'admin' | 'architecture';
  onSelectTab: (tab: 'stream' | 'studio' | 'admin' | 'architecture') => void;
  isOfflineMode: boolean;
  onToggleOffline: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenSettingsModal: () => void;
  onSignOut: () => void;
  adCounter: { current: number; threshold: number };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onSelectTab,
  isOfflineMode,
  onToggleOffline,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenSettingsModal,
  onSignOut,
  adCounter
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isCreatorOrArtist = currentUser?.role === 'creator' || (currentUser as any)?.role === 'artist';

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d10]/95 backdrop-blur-md border-b border-[#21232d] px-4 py-3 flex items-center justify-between">
      {/* Brand logo & status */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => onSelectTab('stream')}
          className="flex items-center gap-2 cursor-pointer group"
          id="brand-logo-btn"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1DB954] to-[#10b981] flex items-center justify-center shadow-lg shadow-[#1DB954]/20 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-lg font-sans">
                SONORA
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Streaming & Audio Hi-Fi</p>
          </div>
        </div>

        {/* Offline Mode Indicator Switch */}
        <button
          onClick={onToggleOffline}
          id="toggle-offline-mode-btn"
          title="Alternar modo offline"
          className={`hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors border ${
            isOfflineMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:text-white'
          }`}
        >
          {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          <span>{isOfflineMode ? 'Modo Offline' : 'Online'}</span>
        </button>
      </div>

      {/* Right controls: Ad Tracker pill + User profile with Dynamic Role-Based Dropdown */}
      <div className="flex items-center gap-2.5">
        {/* Ad countdown indicator */}
        <div 
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-zinc-300"
          title="Monetización: Ciclo de anuncios para oyentes"
        >
          <Sparkles className="w-3 h-3 text-[#1DB954]" />
          <span>Ad tracker:</span>
          <span className="font-bold text-[#1DB954]">{adCounter.current}/{adCounter.threshold}</span>
        </div>

        {/* Dynamic User Profile / Auth Area */}
        {!currentUser ? (
          /* Case 1: No active user session -> Clean Login / Register Button */
          <button
            onClick={onOpenAuthModal}
            id="nav-login-btn"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs shadow-md transition-all group"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión / Registrarse</span>
          </button>
        ) : (
          /* Case 2: User with active session -> Avatar + Role + Dynamic Menu */
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              id="user-profile-menu-btn"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all text-left group border ${
                isDropdownOpen
                  ? 'bg-zinc-800 border-[#1DB954]/80'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700/60'
              }`}
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 rounded-full object-cover border border-[#1DB954]/50 bg-zinc-800"
              />
              <div className="hidden sm:block text-left pr-1">
                <div className="flex items-center gap-1 leading-tight">
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-white truncate max-w-[100px]">
                    {currentUser.stageName || currentUser.name}
                  </span>
                  {currentUser.verified && (
                    <span className="w-3 h-3 bg-blue-500 text-[8px] rounded-full flex items-center justify-center text-white font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#1DB954] font-medium capitalize">
                  {isCreatorOrArtist ? 'Artista / Creador' : 'Oyente'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform ${
                isDropdownOpen ? 'rotate-180 text-[#1DB954]' : ''
              }`} />
            </button>

            {/* Dropdown Menu Dinámico por Perfil / Rol */}
            {isDropdownOpen && (
              <div 
                id="user-profile-dropdown"
                className="absolute right-0 mt-2 w-64 bg-[#151722] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-50 animate-fadeIn"
              >
                {/* User quick card header */}
                <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/40">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="w-9 h-9 rounded-full object-cover border border-[#1DB954]/40 bg-zinc-800"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">
                        {currentUser.stageName || currentUser.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isCreatorOrArtist
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : 'bg-emerald-500/10 text-[#1DB954] border-[#1DB954]/30'
                    }`}>
                      {isCreatorOrArtist ? 'Creador / Artista' : 'Oyente'}
                    </span>
                    {currentUser.plan === 'premium' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        HiFi Pro
                      </span>
                    )}
                  </div>
                </div>

                {/* Role-Based Options */}
                <div className="py-1">
                  {/* Opción Exclusiva para Creador / Artista */}
                  {isCreatorOrArtist && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSelectTab('studio');
                      }}
                      id="menu-opt-creator-studio"
                      className="w-full px-4 py-2.5 text-xs text-[#1DB954] hover:bg-[#1DB954]/10 flex items-center gap-2.5 transition text-left font-semibold"
                    >
                      <Mic2 className="w-4 h-4 text-[#1DB954]" />
                      <span>Panel de Creador / Studio</span>
                    </button>
                  )}

                  {/* Ver Perfil (Disponible para todos) */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenProfileModal();
                    }}
                    id="menu-opt-profile"
                    className="w-full px-4 py-2.5 text-xs text-zinc-200 hover:text-white hover:bg-zinc-800/60 flex items-center gap-2.5 transition text-left"
                  >
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                    <span>Ver Perfil</span>
                  </button>

                  {/* Configuración (Disponible para todos) */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenSettingsModal();
                    }}
                    id="menu-opt-settings"
                    className="w-full px-4 py-2.5 text-xs text-zinc-200 hover:text-white hover:bg-zinc-800/60 flex items-center gap-2.5 transition text-left"
                  >
                    <Sliders className="w-4 h-4 text-zinc-400" />
                    <span>Configuración</span>
                  </button>

                  {/* Divider */}
                  <div className="my-1 border-t border-zinc-800/80" />

                  {/* Cerrar Sesión */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut();
                    }}
                    id="menu-opt-signout"
                    className="w-full px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition text-left font-semibold"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
