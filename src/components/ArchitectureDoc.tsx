import React, { useState } from 'react';
import { 
  Layers, 
  Database, 
  Server, 
  Code, 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  Radio, 
  Copy, 
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';

export const ArchitectureDoc: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'stack' | 'database' | 'api' | 'backendCode'>('stack');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleBackendCodeAuth = `// ============================================================================
// 1. AUTHENTICATION & RBAC MIDDLEWARE (Node.js / Express / TypeScript)
// ============================================================================
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type UserRole = 'listener' | 'creator' | 'admin';

export interface JwtAuthPayload {
  sub: string;            // User ID (UUIDv4)
  email: string;
  role: UserRole;
  stageName?: string;
  plan: 'free' | 'premium';
  verified: boolean;
}

// Extensión tipada de Request en Express
declare global {
  namespace Express {
    interface Request {
      user?: JwtAuthPayload;
    }
  }
}

/**
 * Middleware para validar el JWT y extraer el sujeto y rol
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización requerido' });
  }

  const secret = process.env.JWT_SECRET || 'sonora-ultra-secret-key-2026';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = decoded as JwtAuthPayload;
    next();
  });
}

/**
 * Guard de Roles (RBAC): Valida si el usuario posee el rol requerido
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: \`Acceso denegado. Se requiere uno de los siguientes roles: \${allowedRoles.join(', ')}\`
      });
    }
    next();
  };
}`;

  const sampleBackendCodeStream = `// ============================================================================
// 2. STREAM VERIFICATION & AD MONETIZATION ENGINE (Anti-Fraud + CPM Calculation)
// ============================================================================
import { Request, Response } from 'express';
import { db } from '../database'; // PostgreSQL ORM / Drizzle / Prisma
import { clickhouse } from '../analytics/clickhouse'; // OLAP Engine
import { redis } from '../cache/redis';

export async function registerStreamPlay(req: Request, res: Response) {
  const { trackId, durationPlayedSeconds, playbackToken } = req.body;
  const userId = req.user?.sub;

  if (!trackId || typeof durationPlayedSeconds !== 'number') {
    return res.status(400).json({ error: 'trackId y durationPlayedSeconds son obligatorios' });
  }

  // 1. REGLA DE INDUSTRIA: Anti-Fraud Streaming (Estándar Spotify / Billboard)
  // Una reproducción solo es computable si supera al menos 30 segundos continuos
  const isPlayCountable = durationPlayedSeconds >= 30;

  if (!isPlayCountable) {
    return res.status(200).json({
      counted: false,
      message: 'Reproducción inferior a 30 segundos; no califica para royalties'
    });
  }

  // 2. DEDUPLICACIÓN EN REDIS (Prevenir bucles de spam o bots artificiales)
  const streamLockKey = \`stream_lock:\${userId}:\${trackId}\`;
  const isDuplicate = await redis.get(streamLockKey);
  if (isDuplicate) {
    return res.status(200).json({ counted: false, reason: 'Duplicate event throttled' });
  }
  // Bloquear por 30s para evitar doble disparo en la misma canción
  await redis.set(streamLockKey, '1', 'EX', 30);

  // 3. CONSULTAR TRACK & CONFIGURACIÓN DE MONETIZACIÓN
  const track = await db.tracks.findUnique({
    where: { id: trackId },
    include: { artist: true }
  });

  if (!track) {
    return res.status(404).json({ error: 'Pista no encontrada' });
  }

  // 4. SIMULADOR DE INSERCIÓN DE ANUNCIOS (AD BREAK EVALUATION)
  // Contar reproducciones en sesión del usuario
  const sessionPlaysCount = await redis.incr(\`user_plays_session:\${userId}\`);
  const shouldServeAd = track.monetizationEnabled && 
    (sessionPlaysCount % (track.adFrequencyPlays || 3) === 0);

  let adRevenue = 0;
  let adDetails = null;

  if (shouldServeAd) {
    // CPM promedio $6.00 / 1000 = $0.006 por impresión
    const baseCpm = 6.00;
    adRevenue = (baseCpm / 1000) * 2.2; // ~$0.0132 USD para el creador

    // Obtener anuncio óptimo mediante algoritmo de subasta VAST
    adDetails = await getOptimalAdBreak(userId, track.genre);
    
    // Incrementar saldo en cuenta del artista (PostgreSQL transaccional)
    await db.creatorEarnings.update({
      where: { creatorId: track.artistId },
      data: {
        accumulatedBalance: { increment: adRevenue },
        adRevenueTotal: { increment: adRevenue }
      }
    });
  }

  // 5. REGISTRO EN BASE DE DATOS ANALÍTICA OLAP (ClickHouse para millones de eventos/segundo)
  await clickhouse.insert({
    table: 'stream_events',
    values: [{
      event_id: crypto.randomUUID(),
      track_id: trackId,
      artist_id: track.artistId,
      user_id: userId,
      duration_seconds: durationPlayedSeconds,
      ad_served: shouldServeAd ? 1 : 0,
      revenue_credited: adRevenue,
      country: req.headers['cf-ipcountry'] || 'ES',
      device: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
      timestamp: new Date()
    }]
  });

  // 6. INCREMENTAR CONTADOR ATÓMICO EN TRACK
  await db.tracks.update({
    where: { id: trackId },
    data: { plays: { increment: 1 } }
  });

  return res.status(200).json({
    counted: true,
    streamId: crypto.randomUUID(),
    adTriggered: shouldServeAd,
    adDetails,
    revenueCredited: adRevenue
  });
}`;

  const databaseSqlDDL = `-- ============================================================================
-- SONORA RELATIONAL DATABASE DDL (PostgreSQL 16+)
-- ============================================================================

-- 1. Usuarios y Roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50) DEFAULT 'email', -- 'google', 'apple', 'email'
    oauth_id VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'listener', -- 'listener', 'creator', 'admin'
    plan VARCHAR(20) NOT NULL DEFAULT 'free',      -- 'free', 'premium'
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Perfil de Artista / Creador Musical
CREATE TABLE artist_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stage_name VARCHAR(120) NOT NULL,
    bio TEXT,
    verified BOOLEAN DEFAULT FALSE,
    followers_count INT DEFAULT 0,
    stripe_account_id VARCHAR(100),
    payout_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Álbumes y Colecciones
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    cover_url TEXT NOT NULL,
    release_date DATE NOT NULL,
    release_type VARCHAR(20) DEFAULT 'album' -- 'single', 'album', 'ep', 'podcast'
);

-- 4. Pistas Multimedia (Audio y Video)
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) NOT NULL DEFAULT 'audio', -- 'audio' | 'video'
    video_orientation VARCHAR(20),                   -- 'vertical' | 'horizontal'
    duration_seconds INT NOT NULL,
    genre VARCHAR(60) NOT NULL,
    monetization_enabled BOOLEAN DEFAULT TRUE,
    ad_frequency_plays INT DEFAULT 3,
    plays_count BIGINT DEFAULT 0,
    likes_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Inventario de Publicidad (Ad Campaigns)
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_name VARCHAR(100) NOT NULL,
    campaign_title VARCHAR(200) NOT NULL,
    target_genre VARCHAR(60),
    cpm_rate NUMERIC(6, 2) NOT NULL, -- Ej: $6.50 por 1,000 impresiones
    media_url TEXT NOT NULL,
    click_url TEXT NOT NULL,
    budget_remaining NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. Historial Financiero y Payouts de Creadores
CREATE TABLE creator_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES artist_profiles(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payout_method VARCHAR(50) NOT NULL, -- 'Stripe Direct', 'PayPal', 'Wire'
    status VARCHAR(30) DEFAULT 'processing',
    transaction_ref VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ClickHouse OLAP Table (Para registrar 50,000+ eventos de streaming por segundo):
-- CREATE TABLE stream_events (
--     event_id UUID,
--     track_id UUID,
--     artist_id UUID,
--     user_id UUID,
--     duration_seconds UInt16,
--     ad_served UInt8,
--     revenue_credited Float32,
--     country LowCardinality(String),
--     timestamp DateTime
-- ) ENGINE = MergeTree()
-- PARTITION BY toYYYYMM(timestamp)
-- ORDER BY (artist_id, timestamp, track_id);`;

  return (
    <div className="space-y-6 pb-28" id="architecture-doc-container">
      {/* Header */}
      <div className="bg-[#141622] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
            Senior Software Architecture
          </span>
          <span className="text-xs text-zinc-500">• Especificación de Ingeniería</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Arquitectura de Plataforma Multimedia & Streaming Sonora
        </h1>
        <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-3xl">
          Diseño integral de alta disponibilidad, transcodificación HLS/DASH, autenticación dual RBAC y motor de monetización por inserción publicitaria VAST/VMAP.
        </p>

        {/* Section buttons */}
        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={() => setActiveSection('stack')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSection === 'stack'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>1. Stack Tecnológico Recomendado</span>
          </button>

          <button
            onClick={() => setActiveSection('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSection === 'database'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. Modelo de Datos & Esquema Relacional</span>
          </button>

          <button
            onClick={() => setActiveSection('api')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSection === 'api'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>3. Endpoints de la API Backend</span>
          </button>

          <button
            onClick={() => setActiveSection('backendCode')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSection === 'backendCode'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>4. Código Inicial de Muestra (Auth & Stream Engine)</span>
          </button>
        </div>
      </div>

      {/* Section 1: Stack Tecnológico */}
      {activeSection === 'stack' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#13151f] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
              <Zap className="w-4 h-4" />
              <h3>Frontend Mobile (iOS & Android)</h3>
            </div>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li>
                <strong className="text-white">React Native / Expo (con react-native-track-player):</strong> Control de playback en segundo plano, integración nativa con lockscreen (Now Playing Widget), soporte de streaming HLS sin buffer gaps y bajo consumo de batería.
              </li>
              <li>
                <strong className="text-white">Alternativa Flutter:</strong> Arquitectura basada en <code>just_audio</code> + <code>audio_service</code> para compilación nativa en 60/120fps con shaders de alto rendimiento.
              </li>
            </ul>
          </div>

          <div className="bg-[#13151f] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
              <Server className="w-4 h-4" />
              <h3>Backend & Microservicios</h3>
            </div>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li>
                <strong className="text-white">API Gateway & Auth:</strong> Node.js / NestJS o Go (Golang) para alto rendimiento I/O y validación de tokens JWT / OAuth2.
              </li>
              <li>
                <strong className="text-white">Streaming & Session Engine:</strong> Microservicio en Go o Rust con gRPC para procesar 100,000+ pings de telemetría de reproducción por segundo con latencia sub-5ms.
              </li>
            </ul>
          </div>

          <div className="bg-[#13151f] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
              <Database className="w-4 h-4" />
              <h3>Bases de Datos Híbridas (OLTP + OLAP)</h3>
            </div>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li>
                <strong className="text-white">PostgreSQL (Transaccional):</strong> Usuarios, perfiles de artistas, catálogo de canciones, suscripciones y balances de payout con integridad ACID.
              </li>
              <li>
                <strong className="text-white">ClickHouse / Apache Pinot (Analítica Masiva):</strong> Almacén columnar para calcular en tiempo real reproducciones, retención y demografía con consultas ultra veloces sobre petabytes de datos.
              </li>
              <li>
                <strong className="text-white">Redis Cluster:</strong> Caché de sesiones, limitador de tasa (rate limiting) y deduplicación anti-fraude de reproducciones.
              </li>
            </ul>
          </div>

          <div className="bg-[#13151f] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm">
              <Radio className="w-4 h-4" />
              <h3>Almacenamiento de Medios (CDNs) & Ad Server</h3>
            </div>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li>
                <strong className="text-white">Cloudflare R2 / AWS S3:</strong> Almacenamiento de audio master (WAV/FLAC) y video con costo cero de egress.
              </li>
              <li>
                <strong className="text-white">Cloudflare Stream / Mux / AWS MediaConvert:</strong> Transcodificación adaptativa HLS / MPEG-DASH (AAC 128/256/320kbps y MP4/H.265 adaptativo).
              </li>
              <li>
                <strong className="text-white">Servidor de Anuncios:</strong> Especificación VAST 4.2 y VMAP con soporte para SSAI (Server-Side Ad Insertion) para evitar bloqueadores de anuncios (ad blockers).
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Section 2: Database Schema */}
      {activeSection === 'database' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Esquema SQL DDL de Producción para PostgreSQL & ClickHouse</span>
            <button
              onClick={() => copyCode('sql', databaseSqlDDL)}
              className="flex items-center gap-1 text-cyan-400 hover:underline"
            >
              {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'sql' ? 'Copiado' : 'Copiar DDL'}</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-x-auto">
            <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
              {databaseSqlDDL}
            </pre>
          </div>
        </div>
      )}

      {/* Section 3: API Endpoints Architecture */}
      {activeSection === 'api' && (
        <div className="bg-[#13151f] border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-white">
              Arquitectura de Endpoints RESTful (API v1)
            </h3>
            <p className="text-xs text-zinc-400">Especificación de contratos con autenticación Bearer JWT</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Auth group */}
            <div className="space-y-2">
              <span className="font-extrabold text-cyan-400 uppercase tracking-wider text-[11px]">
                1. Módulo de Autenticación & Usuarios
              </span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 font-mono">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                    <span className="text-white">/api/v1/auth/register</span>
                  </div>
                  <span className="text-zinc-400 font-sans">Registro con rol ('listener' | 'creator')</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                    <span className="text-white">/api/v1/auth/login</span>
                  </div>
                  <span className="text-zinc-400 font-sans">Autenticación local email/password emite JWT</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                    <span className="text-white">/api/v1/auth/oauth/{'{provider}'}</span>
                  </div>
                  <span className="text-zinc-400 font-sans">Intercambio de ID token de Google o Apple</span>
                </div>
              </div>
            </div>

            {/* Media Upload group */}
            <div className="space-y-2">
              <span className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px]">
                2. Subida de Medios & Transcodificación (Creadores)
              </span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 font-mono">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                    <span className="text-white">/api/v1/media/upload-url</span>
                  </div>
                  <span className="text-zinc-400 font-sans">Genera Presigned S3/R2 URL para carga directa</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                    <span className="text-white">/api/v1/tracks</span>
                  </div>
                  <span className="text-zinc-400 font-sans">Publica metadatos de canción/video y activa webhook HLS</span>
                </div>
              </div>
            </div>

            {/* Streaming & Ads group */}
            <div className="space-y-2">
              <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">
                3. Streaming, Telemetría & Servidor de Anuncios
              </span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 font-mono">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                    <span className="text-white">/api/v1/stream/session/ping</span>
                  </div>
                  <span className="text-zinc-400 font-sans">Verifica regla de 30 segundos, evalúa inserción de ad</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">GET</span>
                    <span className="text-white">/api/v1/ads/vmap</span>
                  </div>
                  <span className="text-zinc-400 font-sans">Devuelve payload VAST/VMAP con pre-roll y mid-rolls</span>
                </div>
              </div>
            </div>

            {/* Creator Analytics group */}
            <div className="space-y-2">
              <span className="font-extrabold text-purple-400 uppercase tracking-wider text-[11px]">
                4. Analíticas de Creador & Retiro de Fondos
              </span>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 font-mono">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">GET</span>
                    <span className="text-white">/api/v1/creator/analytics</span>
                  </div>
                  <span className="text-zinc-400 font-sans">Retorna series temporales, retención y demografía</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                    <span className="text-white">/api/v1/creator/payouts/request</span>
                  </div>
                  <span className="text-zinc-400 font-sans">Dispara transferencia automática vía Stripe Connect</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Sample Backend Code */}
      {activeSection === 'backendCode' && (
        <div className="space-y-6">
          {/* Auth sample */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1DB954]" />
                <span>Esquema de Autenticación con Roles en el Backend (TypeScript / Express)</span>
              </h3>
              <button
                onClick={() => copyCode('auth', sampleBackendCodeAuth)}
                className="flex items-center gap-1 text-cyan-400 hover:underline text-xs"
              >
                {copiedKey === 'auth' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'auth' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
                {sampleBackendCodeAuth}
              </pre>
            </div>
          </div>

          {/* Stream engine sample */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Lógica para Registrar Reproducción de Medio & Calcular Métrica de Anuncios</span>
              </h3>
              <button
                onClick={() => copyCode('stream', sampleBackendCodeStream)}
                className="flex items-center gap-1 text-cyan-400 hover:underline text-xs"
              >
                {copiedKey === 'stream' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'stream' ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
                {sampleBackendCodeStream}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
