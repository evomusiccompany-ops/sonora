export type UserRole = 'listener' | 'creator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  stageName?: string;
  bio?: string;
  verified?: boolean;
  followersCount: number;
  plan: 'free' | 'premium';
  createdAt: string;
}

export type MediaType = 'audio' | 'video';
export type ReleaseType = 'single' | 'album' | 'ep' | 'podcast' | 'clip';
export type Genre = 
  | 'Urban / Reggaeton'
  | 'Lo-Fi / Chill'
  | 'Synthwave / Retro'
  | 'Trap / Hip-Hop'
  | 'Indie Pop'
  | 'Acoustic / Folk'
  | 'Electronic / Dance'
  | 'Podcast';

export interface Track {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  albumName: string;
  releaseType: ReleaseType;
  coverUrl: string;
  mediaUrl: string;
  mediaType: MediaType;
  videoOrientation?: 'vertical' | 'horizontal';
  duration: number; // in seconds
  genre: Genre;
  releaseDate: string;
  plays: number;
  likes: number;
  lyrics?: string[];
  monetizationEnabled: boolean;
  adFrequencyPlays: number; // e.g. every 3 plays
  isDownloaded?: boolean;
  isExplicit?: boolean;
  bpm?: number;
}

export interface AdItem {
  id: string;
  brand: string;
  title: string;
  tagline: string;
  sponsorMessage: string;
  duration: number; // seconds (e.g. 10 or 15)
  bannerUrl: string;
  clickUrl: string;
  cpmRate: number; // e.g. $5.50
}

export interface StreamEvent {
  id: string;
  trackId: string;
  trackTitle: string;
  userId: string;
  artistId: string;
  timestamp: string;
  durationPlayedSeconds: number;
  completed: boolean;
  adServed: boolean;
  revenueEarned: number;
  country: string;
  device: string;
}

export interface CreatorEarnings {
  accumulatedBalance: number;
  pendingPayout: number;
  totalPaidOut: number;
  estimatedRPM: number; // Revenue per 1,000 streams
  adRevenue: number;
  streamRoyalty: number;
  history: PayoutRecord[];
}

export interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Stripe Direct' | 'PayPal' | 'Bank Transfer (SEPA/ACH)';
  status: 'completed' | 'processing' | 'pending';
  invoiceNumber: string;
}

export interface CreatorAnalytics {
  totalStreams: number;
  monthlyListeners: number;
  watchHours: number;
  completionRate: number;
  streamsByDay: { day: string; streams: number; ads: number; revenue: number }[];
  retentionCurve: { second: number; percentage: number }[];
  demographics: {
    countries: { country: string; flag: string; percentage: number; streams: number }[];
    ageGroups: { range: string; percentage: number }[];
    gender: { male: number; female: number; other: number };
  };
}

export interface AdminMetrics {
  totalUsers: number;
  activeCreators: number;
  globalStreamsToday: number;
  activeAdCampaigns: number;
  platformAdRevenueToday: number;
  averageFillRate: number;
  serverLatencyMs: number;
}
