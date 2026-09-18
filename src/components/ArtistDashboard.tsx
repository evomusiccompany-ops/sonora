import React, { useState } from 'react';
import { Track, CreatorAnalytics, CreatorEarnings } from '../types';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Upload, 
  Play, 
  ExternalLink, 
  CheckCircle2, 
  CreditCard, 
  ShieldAlert, 
  Radio,
  ArrowUpRight,
  BarChart3,
  Globe,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ArtistDashboardProps {
  tracks: Track[];
  analytics: CreatorAnalytics;
  earnings: CreatorEarnings;
  onOpenUploadModal: () => void;
  onTriggerAdSimulation: () => void;
  onWithdrawFunds: (amount: number) => void;
  artistName: string;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({
  tracks,
  analytics,
  earnings,
  onOpenUploadModal,
  onTriggerAdSimulation,
  onWithdrawFunds,
  artistName
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'monetization' | 'catalog'>('analytics');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Maximum stream day for chart scale
  const maxDayStreams = Math.max(...analytics.streamsByDay.map((d) => d.streams), 1);

  const handleWithdraw = () => {
    if (earnings.accumulatedBalance <= 0) return;
    onWithdrawFunds(earnings.accumulatedBalance);
    setWithdrawSuccess(true);
    try {
      confetti({ particleCount: 50, spread: 70 });
    } catch {}
    setTimeout(() => setWithdrawSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 pb-28" id="artist-studio-dashboard">
      {/* Top Welcome & Actions Header */}
      <div className="bg-[#141622] border border-zinc-800/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1DB954] bg-[#1DB954]/10 px-2.5 py-0.5 rounded-full border border-[#1DB954]/20">
              Panel de Artista Verificado
            </span>
            <span className="text-xs text-zinc-500">• Actualizado en tiempo real</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Studio de Creador: {artistName}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gestiona tus lanzamientos, analiza el comportamiento de tus oyentes y optimiza tu monetización.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onTriggerAdSimulation}
            className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            title="Simular la inserción de un anuncio comercial para ver el impacto en saldo"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Simular Ad-Insertion</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            className="px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#1DB954]/20 transition-all hover:scale-105 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Subir Nuevo Contenido</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Reproducciones Totales</span>
            <TrendingUp className="w-4 h-4 text-[#1DB954]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-sans">
            {analytics.totalStreams.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#1DB954] flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs mes anterior
          </div>
        </div>

        <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Oyentes Mensuales</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-sans">
            {analytics.monthlyListeners.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> +9.8% nuevos seguidores
          </div>
        </div>

        <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Saldo Acumulado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1DB954] font-mono">
            ${earnings.accumulatedBalance.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <span>RPM prom:</span>
            <span className="text-emerald-400 font-bold">${earnings.estimatedRPM.toFixed(2)} USD</span>
          </div>
        </div>

        <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-4.5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Horas Escuchadas</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-sans">
            {analytics.watchHours.toLocaleString()}h
          </div>
          <div className="text-[11px] text-zinc-400">
            Retención promedio: <span className="text-white font-semibold">{analytics.completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Analíticas, Monetización, Catálogo */}
      <div className="flex border-b border-zinc-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analíticas de Audiencia</span>
        </button>

        <button
          onClick={() => setActiveTab('monetization')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'monetization'
              ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Monetización & Ad Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/5'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Catálogo de Lanzamientos ({tracks.length})</span>
        </button>
      </div>

      {/* Tab 1: Analíticas Visuales */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Daily Streams & Ad Impressions Chart */}
          <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#1DB954]" />
                  <span>Reproducciones y Anuncios Servidos (Últimos 7 días)</span>
                </h3>
                <p className="text-xs text-zinc-400">Comparativa de volumen de streams y ads monetizados</p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#1DB954]" />
                  <span className="text-zinc-300">Streams</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-400" />
                  <span className="text-zinc-300">Anuncios</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-4 flex items-end justify-between gap-2 h-52 border-b border-zinc-800 pb-2">
              {analytics.streamsByDay.map((item, idx) => {
                const streamHeight = Math.max(15, (item.streams / maxDayStreams) * 160);
                const adHeight = Math.max(8, (item.ads / maxDayStreams) * 160);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex items-end justify-center gap-1 h-44">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-zinc-800 text-[10px] p-1.5 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg text-white font-mono">
                        {item.streams.toLocaleString()} streams • ${item.revenue.toFixed(1)} USD
                      </div>

                      {/* Stream bar */}
                      <div
                        className="w-3 sm:w-5 bg-gradient-to-t from-[#1DB954]/60 to-[#1DB954] rounded-t-md transition-all duration-500 group-hover:brightness-125"
                        style={{ height: `${streamHeight}px` }}
                      />

                      {/* Ad bar */}
                      <div
                        className="w-2 sm:w-3.5 bg-gradient-to-t from-amber-500/60 to-amber-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                        style={{ height: `${adHeight}px` }}
                      />
                    </div>

                    <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Retention Curve & Demographics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audience Retention Curve */}
            <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Curva de Retención de Audiencia</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Porcentaje de oyentes que continúan escuchando a lo largo del tema
              </p>

              <div className="space-y-2 pt-2">
                {analytics.retentionCurve.map((point) => (
                  <div key={point.second} className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-300">
                      <span>{point.second === 0 ? 'Inicio (0s)' : `${point.second} segundos`}</span>
                      <span className="font-mono font-bold text-[#1DB954]">{point.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-[#1DB954] rounded-full transition-all duration-500"
                        style={{ width: `${point.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demographics & Top Countries */}
            <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Geografía y Demografía de Oyentes</span>
              </h3>
              <p className="text-xs text-zinc-400">Distribución de streams por país y rango de edad</p>

              <div className="space-y-2.5 pt-1">
                {analytics.demographics.countries.map((c) => (
                  <div key={c.country} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="text-zinc-200 font-medium">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400 font-mono">{c.streams.toLocaleString()}</span>
                      <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${c.percentage * 2}%` }}
                        />
                      </div>
                      <span className="text-zinc-300 font-bold font-mono w-8 text-right">
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Age distribution pill tags */}
              <div className="pt-3 border-t border-zinc-800/80">
                <span className="text-[11px] font-semibold text-zinc-400">Rangos de Edad Principales:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analytics.demographics.ageGroups.map((age) => (
                    <span
                      key={age.range}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300"
                    >
                      <strong className="text-white">{age.range} años:</strong> {age.percentage}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sistema de Ingresos y Publicidad */}
      {activeTab === 'monetization' && (
        <div className="space-y-6">
          {/* Ad Simulator Card */}
          <div className="bg-gradient-to-r from-amber-950/40 via-[#13151f] to-zinc-900 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold uppercase mb-1">
                  <Sparkles className="w-3 h-3" /> Simulador de Anuncios (Ad Insertion Engine)
                </div>
                <h2 className="text-lg font-black text-white">
                  Motor de Inserción Publicitaria & Ganancias CPM
                </h2>
                <p className="text-xs text-zinc-300">
                  Prueba el comportamiento del servidor de anuncios VAST/VMAP. Cada anuncio emitido suma saldo inmediato a tu cuenta.
                </p>
              </div>

              <button
                onClick={onTriggerAdSimulation}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Lanzar Anuncio de Prueba</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-zinc-400">Regla de Inserción:</span>
                <div className="font-bold text-white text-sm">Cada 3 Canciones</div>
                <p className="text-[10px] text-zinc-500">Configurable por el artista en cada lanzamiento</p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-zinc-400">Tarifa CPM Promedio:</span>
                <div className="font-bold text-amber-400 text-sm">$5.80 - $7.00 USD</div>
                <p className="text-[10px] text-zinc-500">Por cada 1,000 impresiones de audio/video</p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                <span className="text-zinc-400">Fill Rate Actual:</span>
                <div className="font-bold text-emerald-400 text-sm">96.4% Cobertura</div>
                <p className="text-[10px] text-zinc-500">Campañas activas: Nike, Sony, Red Bull</p>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown & Payout Request */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance and Withdraw */}
            <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Saldo Disponible para Retiro
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#1DB954] font-mono">
                  ${earnings.accumulatedBalance.toFixed(2)}
                  <span className="text-xs text-zinc-400 font-sans ml-1.5 font-normal">USD</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span>Pendiente de liquidación:</span>
                  <span className="font-mono text-zinc-200">${earnings.pendingPayout.toFixed(2)} USD</span>
                </div>
              </div>

              {withdrawSuccess ? (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Retiro procesado con éxito vía Stripe Direct!</span>
                </div>
              ) : (
                <button
                  onClick={handleWithdraw}
                  disabled={earnings.accumulatedBalance <= 0}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                    earnings.accumulatedBalance > 0
                      ? 'bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-lg shadow-[#1DB954]/20'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Solicitar Retiro de Fondos</span>
                </button>
              )}

              <p className="text-[10px] text-zinc-500 text-center">
                Depósito automático en 24-48h hábiles en tu cuenta bancaria vinculada.
              </p>
            </div>

            {/* Income Sources breakdown */}
            <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl p-6 space-y-4 lg:col-span-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Desglose de Ganancias por Categoría</span>
              </h3>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>Ingresos por Anuncios (Audio & Video Ads CPM)</span>
                    <span className="font-mono font-bold text-amber-400">
                      ${earnings.adRevenue.toFixed(2)} USD (66%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '66%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>Regalías por Suscriptores Premium (Stream Share)</span>
                    <span className="font-mono font-bold text-[#1DB954]">
                      ${earnings.streamRoyalty.toFixed(2)} USD (34%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1DB954] rounded-full" style={{ width: '34%' }} />
                  </div>
                </div>
              </div>

              {/* Payout History Table */}
              <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                <span className="text-xs font-bold text-zinc-300">Historial de Liquidaciones Recientes</span>
                <div className="divide-y divide-zinc-800 text-xs">
                  {earnings.history.map((record) => (
                    <div key={record.id} className="py-2.5 flex items-center justify-between text-zinc-400">
                      <div>
                        <div className="text-white font-medium">{record.invoiceNumber}</div>
                        <div className="text-[10px]">{record.date} • {record.method}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">${record.amount.toFixed(2)} USD</div>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Catálogo de Lanzamientos */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">
              Tus Obras Musicales y Videos ({tracks.length})
            </h3>
            <button
              onClick={onOpenUploadModal}
              className="px-3.5 py-1.5 rounded-lg bg-[#1DB954] text-black font-bold text-xs flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nuevo Lanzamiento</span>
            </button>
          </div>

          <div className="bg-[#13151f] border border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-800/80 shadow-xl">
            {tracks.map((track) => (
              <div key={track.id} className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-700/60 shrink-0"
                  />
                  <div className="min-w-0 pr-2">
                    <h4 className="text-sm font-bold text-white truncate">
                      {track.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span>{track.genre}</span>
                      <span>•</span>
                      <span className="capitalize">{track.releaseType}</span>
                      <span>•</span>
                      <span>Lanzado: {track.releaseDate}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-6 text-xs text-zinc-400 font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">REPRODUCCIONES</span>
                    <strong className="text-white">{track.plays.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">MONETIZACIÓN</span>
                    <span className={`font-bold ${track.monetizationEnabled ? 'text-[#1DB954]' : 'text-zinc-500'}`}>
                      {track.monetizationEnabled ? 'Activa (Ad x3)' : 'Desactivada'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
