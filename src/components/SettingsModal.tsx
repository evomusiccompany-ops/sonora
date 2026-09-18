import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Settings as SettingsIcon, 
  Volume2, 
  Shield, 
  Bell, 
  Sliders, 
  Check, 
  Wifi, 
  Database,
  Eye
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [audioQuality, setAudioQuality] = useState<'normal' | 'high' | 'lossless'>('high');
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [adPersonalization, setAdPersonalization] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#14161f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        id="settings-dialog"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#191b26]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Configuración de Sonora</h2>
              <p className="text-xs text-zinc-400">Preferencias de audio y cuenta</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-zinc-300">
          {/* Calidad de Audio */}
          <div>
            <label className="font-semibold text-white flex items-center gap-1.5 mb-2">
              <Volume2 className="w-4 h-4 text-[#1DB954]" />
              Calidad de Reproducción (Audio Engine)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'high', 'lossless'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAudioQuality(q)}
                  className={`py-2 px-2.5 rounded-xl border text-center transition capitalize ${
                    audioQuality === q
                      ? 'border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-bold'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {q === 'lossless' ? 'Hi-Fi 24-bit' : q === 'high' ? 'Alta (320k)' : 'Normal'}
                </button>
              ))}
            </div>
          </div>

          {/* Normalización */}
          <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
            <div>
              <div className="font-semibold text-white">Normalización de Volumen</div>
              <div className="text-[11px] text-zinc-400">Ajusta el volumen estándar entre pistas</div>
            </div>
            <input 
              type="checkbox"
              checked={normalizeAudio}
              onChange={(e) => setNormalizeAudio(e.target.checked)}
              className="accent-[#1DB954] w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Notificaciones */}
          <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
            <div>
              <div className="font-semibold text-white">Nuevos Lanzamientos & Alertas</div>
              <div className="text-[11px] text-zinc-400">Avisar sobre nuevos tracks de creadores seguidos</div>
            </div>
            <input 
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="accent-[#1DB954] w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Monetización & Anuncios */}
          <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
            <div>
              <div className="font-semibold text-white">Anuncios Patrocinados Relevantes</div>
              <div className="text-[11px] text-zinc-400">Optimizar marcas según géneros musicales favoritos</div>
            </div>
            <input 
              type="checkbox"
              checked={adPersonalization}
              onChange={(e) => setAdPersonalization(e.target.checked)}
              className="accent-[#1DB954] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold transition flex items-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              {savedSuccess ? 'Guardado' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
