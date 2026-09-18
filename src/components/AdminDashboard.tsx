import React from 'react';
import { AdminMetrics, AdItem } from '../types';
import { 
  ShieldCheck, 
  Activity, 
  DollarSign, 
  Radio, 
  Layers, 
  Server, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AdminDashboardProps {
  metrics: AdminMetrics;
  adCampaigns: AdItem[];
  onTriggerAdSimulation: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  adCampaigns,
  onTriggerAdSimulation
}) => {
  return (
    <div className="space-y-6 pb-28" id="admin-dashboard-container">
      {/* Top Header */}
      <div className="bg-[#141622] border border-zinc-800/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Supervisión de Plataforma
            </span>
            <span className="text-xs text-zinc-500">• Sonora Operations Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Métricas Globales de la Plataforma
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitoreo en tiempo real de tráfico, entrega publicitaria (VAST/VMAP) y transcodificación CDN.
          </p>
        </div>

        <button
          onClick={onTriggerAdSimulation}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Probar Inserción Publicitaria</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-4.5 space-y-1.5">
          <div className="text-xs text-zinc-400">Streams Globales Hoy</div>
          <div className="text-xl sm:text-2xl font-black text-white font-sans">
            {metrics.globalStreamsToday.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#1DB954] flex items-center gap-1 font-semibold">
            <Activity className="w-3.5 h-3.5" /> +22.4% pico de tráfico
          </div>
        </div>

        <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-4.5 space-y-1.5">
          <div className="text-xs text-zinc-400">Facturación Publicitaria Hoy</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            ${metrics.platformAdRevenueToday.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400">
            eCPM Medio: <span className="text-white font-bold">$6.15 USD</span>
          </div>
        </div>

        <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-4.5 space-y-1.5">
          <div className="text-xs text-zinc-400">Fill Rate Publicitario</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {metrics.averageFillRate}%
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Inventario cubierto
          </div>
        </div>

        <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-4.5 space-y-1.5">
          <div className="text-xs text-zinc-400">Latencia Edge CDN</div>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
            {metrics.serverLatencyMs}ms
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-cyan-400" /> Cloudflare Stream SLA 99.99%
          </div>
        </div>
      </div>

      {/* Active Campaigns Management */}
      <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Campañas de Anuncios Activas en Sonora Ad Server</span>
            </h3>
            <p className="text-xs text-zinc-400">Pautas comerciales en rotación con reglas VAST/VMAP</p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            {adCampaigns.length} Campañas Verificadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {adCampaigns.map((ad) => (
            <div key={ad.id} className="bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
              <div className="relative aspect-video w-full">
                <img src={ad.bannerUrl} alt={ad.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-amber-400">
                  CPM ${ad.cpmRate.toFixed(2)}
                </div>
              </div>
              <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#1DB954]">{ad.brand}</span>
                  <h4 className="text-xs font-bold text-white leading-snug">{ad.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{ad.tagline}</p>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Duración: {ad.duration}s</span>
                  <span className="text-emerald-400 font-semibold">Activa</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
