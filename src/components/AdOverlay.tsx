import React, { useEffect, useState } from 'react';
import { AdItem } from '../types';
import { Sparkles, ExternalLink, ShieldCheck, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../services/audioEngine';

interface AdOverlayProps {
  ad: AdItem;
  isOpen: boolean;
  onAdCompleted: (revenueEarned: number) => void;
  creatorName: string;
}

export const AdOverlay: React.FC<AdOverlayProps> = ({
  ad,
  isOpen,
  onAdCompleted,
  creatorName
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(5);
      setCanSkip(false);
      audioEngine.playAdJingle();

      const timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Revenue calculation based on ad CPM: CPM / 1000 = revenue per impression
  // e.g. $6.20 CPM = $0.0062 to $0.015 per ad impression
  const estimatedRevenue = Number((ad.cpmRate / 1000 * 2.2).toFixed(4));

  const handleFinishAd = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // ignore
    }
    onAdCompleted(estimatedRevenue);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#13151f] border border-amber-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col"
        id="ad-insertion-overlay"
      >
        {/* Top banner tag */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-4 py-2 flex items-center justify-between text-black font-extrabold text-xs">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Ad Insertion Engine • Patrocinio Activo
          </span>
          <span className="bg-black/20 px-2 py-0.5 rounded text-[11px] font-mono">
            {secondsRemaining > 0 ? `0:${secondsRemaining.toString().padStart(2, '0')}` : 'Listo'}
          </span>
        </div>

        {/* Ad Image / Media */}
        <div className="relative aspect-video w-full overflow-hidden bg-black">
          <img
            src={ad.bannerUrl}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13151f] via-transparent to-black/40" />

          <div className="absolute bottom-3 left-4 right-4">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded">
              {ad.brand}
            </span>
            <h3 className="text-base font-extrabold text-white mt-1 leading-tight">
              {ad.title}
            </h3>
          </div>
        </div>

        {/* Ad Content & Value */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            {ad.tagline}
          </p>

          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-[#1DB954]">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">Monetización directa para:</div>
                <div className="font-bold text-white">{creatorName}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400">Pago por Ad:</span>
              <div className="text-xs font-mono font-bold text-[#1DB954]">
                +${estimatedRevenue.toFixed(3)} USD
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{ad.sponsorMessage}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <a
              href={ad.clickUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
            >
              <span>Ver Promoción</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleFinishAd}
              disabled={!canSkip}
              className={`py-2.5 px-5 rounded-xl font-bold text-xs transition-all ${
                canSkip
                  ? 'bg-[#1DB954] hover:bg-[#1ed760] text-black cursor-pointer shadow-lg shadow-[#1DB954]/20 scale-100'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800'
              }`}
            >
              {canSkip ? 'Saltar & Continuar 🎵' : `Espera ${secondsRemaining}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
