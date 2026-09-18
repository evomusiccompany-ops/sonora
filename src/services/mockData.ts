import { User, Track, AdItem, CreatorEarnings, CreatorAnalytics, AdminMetrics } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-listener-01',
    name: 'Elena Ruiz',
    email: 'elena.ruiz@sonora.stream',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'listener',
    followersCount: 142,
    plan: 'free',
    createdAt: '2025-01-15'
  },
  {
    id: 'creator-neo-01',
    name: 'Mateo Silva',
    email: 'neo.nova@artist.sonora.stream',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'creator',
    stageName: 'NeoNova',
    bio: 'Productor y compositor de Synthwave y Lo-Fi Latino. Fusionando 80s drums con lírica urbana moderna.',
    verified: true,
    followersCount: 48920,
    plan: 'premium',
    createdAt: '2024-06-10'
  },
  {
    id: 'admin-01',
    name: 'Sofia Vance',
    email: 'admin.sofia@sonora.platform',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    role: 'admin',
    followersCount: 0,
    plan: 'premium',
    createdAt: '2023-11-01'
  }
];

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-01',
    title: 'Noches de Neón (Midnight Drift)',
    artistId: 'creator-neo-01',
    artistName: 'NeoNova',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    albumName: 'Cyber Delirium EP',
    releaseType: 'single',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'virtual://synth-midnight',
    mediaType: 'audio',
    duration: 198,
    genre: 'Synthwave / Retro',
    releaseDate: '2025-08-12',
    plays: 248910,
    likes: 18420,
    monetizationEnabled: true,
    adFrequencyPlays: 3,
    bpm: 108,
    lyrics: [
      '[0:00] (Sintetizadores análogos y drum machine vintage)',
      '[0:15] Luces de la gran ciudad parpadean al pasar',
      '[0:32] Cien kilómetros por hora sin mirar atrás',
      '[0:50] Si el asfalto guarda el eco de tu voz',
      '[1:12] Esta noche somos tú, el neón y yo...',
      '[1:35] (Solo de sintetizador arpegiado)',
      '[2:05] Vuelvo a la frecuencia donde te encontré',
      '[2:30] Antes del amanecer te llevaré otra vez.'
    ]
  },
  {
    id: 'track-02',
    title: 'Café & Lluvia en Buenos Aires',
    artistId: 'creator-neo-01',
    artistName: 'NeoNova ft. Luna Valiente',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    albumName: 'Ventanas Abiertas',
    releaseType: 'single',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'virtual://lofi-rain',
    mediaType: 'audio',
    duration: 172,
    genre: 'Lo-Fi / Chill',
    releaseDate: '2025-09-01',
    plays: 182340,
    likes: 14210,
    monetizationEnabled: true,
    adFrequencyPlays: 3,
    bpm: 85,
    lyrics: [
      '[0:00] (Sonido de lluvia suave y vinilo crepitante)',
      '[0:20] Gotas que caen en la madera fría',
      '[0:45] Café amargo y tu recuerdo todavía',
      '[1:10] La melodía que escribimos aquel día',
      '[1:35] Quedó grabada en la melancolía...'
    ]
  },
  {
    id: 'track-03',
    title: 'Fuego Urbano (Official Video)',
    artistId: 'creator-neo-01',
    artistName: 'NeoNova',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    albumName: 'Fuego Urbano Single',
    releaseType: 'single',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    mediaType: 'video',
    videoOrientation: 'horizontal',
    duration: 210,
    genre: 'Urban / Reggaeton',
    releaseDate: '2025-07-20',
    plays: 341200,
    likes: 29500,
    monetizationEnabled: true,
    adFrequencyPlays: 2,
    bpm: 102
  },
  {
    id: 'track-04',
    title: 'Backstage: Creando el Beat en 60s',
    artistId: 'creator-neo-01',
    artistName: 'NeoNova',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    albumName: 'Studio Shorts',
    releaseType: 'clip',
    coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    mediaType: 'video',
    videoOrientation: 'vertical',
    duration: 45,
    genre: 'Electronic / Dance',
    releaseDate: '2025-09-10',
    plays: 89400,
    likes: 9340,
    monetizationEnabled: true,
    adFrequencyPlays: 2,
    bpm: 120
  },
  {
    id: 'track-05',
    title: 'Aura Solar (Sunset Deep House)',
    artistId: 'creator-neo-01',
    artistName: 'NeoNova ft. Solaria',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    albumName: 'Aura Sessions',
    releaseType: 'album',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'virtual://house-sunset',
    mediaType: 'audio',
    duration: 224,
    genre: 'Electronic / Dance',
    releaseDate: '2025-06-18',
    plays: 145200,
    likes: 11200,
    monetizationEnabled: true,
    adFrequencyPlays: 4,
    bpm: 122
  },
  {
    id: 'track-06',
    title: 'Episodio 14: Monetización en la era del Streaming',
    artistId: 'creator-neo-01',
    artistName: 'NeoNova Podcasts',
    artistAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    albumName: 'El Laboratorio Sonoro',
    releaseType: 'podcast',
    coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'virtual://podcast-stream',
    mediaType: 'audio',
    duration: 480,
    genre: 'Podcast',
    releaseDate: '2025-09-05',
    plays: 42100,
    likes: 3820,
    monetizationEnabled: true,
    adFrequencyPlays: 2,
    bpm: 90
  }
];

export const AD_CAMPAIGNS: AdItem[] = [
  {
    id: 'ad-nike-01',
    brand: 'Nike Running',
    title: 'Rompe tus marcas con Air Zoom Alpha',
    tagline: 'Energía reactiva para cada kilómetro.',
    sponsorMessage: 'Anuncio patrocinado por Nike • Apoyando a creadores independientes en Sonora.',
    duration: 8,
    bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    clickUrl: 'https://nike.com',
    cpmRate: 6.20
  },
  {
    id: 'ad-audiotech-02',
    brand: 'Sony Audio Lab',
    title: 'Auriculares WH-1000XM6 con Hi-Res Audio',
    tagline: 'Cancelación de ruido líder en la industria.',
    sponsorMessage: 'Disfruta tu música en formato sin pérdida con Sony.',
    duration: 8,
    bannerUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    clickUrl: 'https://sony.com',
    cpmRate: 5.80
  },
  {
    id: 'ad-redbull-03',
    brand: 'Red Bull Music',
    title: 'Batalla de Productores 2026',
    tagline: 'Participa por 50,000 USD y un contrato discográfico.',
    sponsorMessage: 'Red Bull te da alas para crear.',
    duration: 8,
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    clickUrl: 'https://redbull.com',
    cpmRate: 7.00
  }
];

export const INITIAL_CREATOR_EARNINGS: CreatorEarnings = {
  accumulatedBalance: 1482.65,
  pendingPayout: 320.40,
  totalPaidOut: 5840.00,
  estimatedRPM: 4.85, // $4.85 per 1,000 streams
  adRevenue: 980.25,
  streamRoyalty: 502.40,
  history: [
    {
      id: 'pay-001',
      date: '2025-08-31',
      amount: 620.50,
      method: 'Stripe Direct',
      status: 'completed',
      invoiceNumber: 'INV-2025-08-NEO'
    },
    {
      id: 'pay-002',
      date: '2025-07-31',
      amount: 540.20,
      method: 'Stripe Direct',
      status: 'completed',
      invoiceNumber: 'INV-2025-07-NEO'
    },
    {
      id: 'pay-003',
      date: '2025-06-30',
      amount: 490.80,
      method: 'PayPal',
      status: 'completed',
      invoiceNumber: 'INV-2025-06-NEO'
    }
  ]
};

export const INITIAL_CREATOR_ANALYTICS: CreatorAnalytics = {
  totalStreams: 1024350,
  monthlyListeners: 84210,
  watchHours: 51200,
  completionRate: 78.4,
  streamsByDay: [
    { day: 'Lun', streams: 12400, ads: 3800, revenue: 58.4 },
    { day: 'Mar', streams: 14200, ads: 4400, revenue: 66.8 },
    { day: 'Mié', streams: 13900, ads: 4200, revenue: 64.2 },
    { day: 'Jue', streams: 16800, ads: 5100, revenue: 78.6 },
    { day: 'Vie', streams: 24500, ads: 7600, revenue: 114.5 },
    { day: 'Sáb', streams: 28900, ads: 8900, revenue: 136.2 },
    { day: 'Dom', streams: 22100, ads: 6900, revenue: 104.8 }
  ],
  retentionCurve: [
    { second: 0, percentage: 100 },
    { second: 15, percentage: 94 },
    { second: 30, percentage: 88 },
    { second: 60, percentage: 82 },
    { second: 120, percentage: 76 },
    { second: 180, percentage: 69 }
  ],
  demographics: {
    countries: [
      { country: 'España', flag: '🇪🇸', percentage: 34, streams: 348270 },
      { country: 'México', flag: '🇲🇽', percentage: 28, streams: 286810 },
      { country: 'Argentina', flag: '🇦🇷', percentage: 16, streams: 163890 },
      { country: 'Colombia', flag: '🇨🇴', percentage: 12, streams: 122920 },
      { country: 'Estados Unidos', flag: '🇺🇸', percentage: 10, streams: 102460 }
    ],
    ageGroups: [
      { range: '18 - 24', percentage: 48 },
      { range: '25 - 34', percentage: 32 },
      { range: '35 - 44', percentage: 14 },
      { range: '45+', percentage: 6 }
    ],
    gender: {
      male: 54,
      female: 42,
      other: 4
    }
  }
};

export const INITIAL_ADMIN_METRICS: AdminMetrics = {
  totalUsers: 248500,
  activeCreators: 4210,
  globalStreamsToday: 1820400,
  activeAdCampaigns: 48,
  platformAdRevenueToday: 11240.50,
  averageFillRate: 96.8,
  serverLatencyMs: 38
};
