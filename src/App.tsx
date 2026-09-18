import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Track, AdItem, CreatorEarnings, CreatorAnalytics, AdminMetrics } from './types';
import { 
  INITIAL_USERS, 
  AD_CAMPAIGNS, 
  INITIAL_CREATOR_EARNINGS, 
  INITIAL_CREATOR_ANALYTICS, 
  INITIAL_ADMIN_METRICS 
} from './services/mockData';
import { getTracks, createTrack, isSupabaseConfigured, supabase } from './services/supabase';
import { audioEngine } from './services/audioEngine';
import { Navbar } from './components/Navbar';
import { ListenerFeed } from './components/ListenerFeed';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { AdOverlay } from './components/AdOverlay';
import { ArtistUploadModal } from './components/ArtistUploadModal';
import { ArtistDashboard } from './components/ArtistDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ArchitectureDoc } from './components/ArchitectureDoc';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';

export default function App() {
  // Users & Session State synced via AuthContext & Supabase
  const { currentUser, setCurrentUser, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState<'stream' | 'studio' | 'admin' | 'architecture' | 'profile'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/perfil')) {
      return 'profile';
    }
    return 'stream';
  });
  
  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Content Catalog State (Fetched via Supabase getTracks)
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(true);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set(['track-01', 'track-03']));
  const [downloadedTrackIds, setDownloadedTrackIds] = useState<Set<string>>(new Set(['track-01', 'track-02']));
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Audio Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // Modals & Overlays
  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState(false);
  const [activeVideoTrack, setActiveVideoTrack] = useState<Track | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Ad Insertion Engine State
  const [adCounter, setAdCounter] = useState<{ current: number; threshold: number }>({ current: 0, threshold: 3 });
  const [activeAd, setActiveAd] = useState<AdItem | null>(null);

  // Creator & Admin Metrics
  const [creatorEarnings, setCreatorEarnings] = useState<CreatorEarnings>(INITIAL_CREATOR_EARNINGS);
  const [creatorAnalytics, setCreatorAnalytics] = useState<CreatorAnalytics>(INITIAL_CREATOR_ANALYTICS);
  const [adminMetrics, setAdminMetrics] = useState<AdminMetrics>(INITIAL_ADMIN_METRICS);

  // Playback timer ref
  const progressTimerRef = useRef<number | null>(null);

  // Fetch tracks from Supabase getTracks()
  const loadTracks = useCallback(async () => {
    setIsLoadingTracks(true);
    try {
      const data = await getTracks();
      setTracks(data);
      if (data.length > 0) {
        setCurrentTrack((prev) => {
          if (prev) return prev;
          setDuration(data[0].duration);
          return data[0];
        });
      }
    } catch (err) {
      console.error('Error fetching tracks with getTracks():', err);
    } finally {
      setIsLoadingTracks(false);
    }
  }, []);

  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

  // Sync volume with audioEngine
  useEffect(() => {
    audioEngine.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      audioEngine.stop();
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // Play a specific track
  const handlePlayTrack = useCallback((track: Track) => {
    if (isOfflineMode && !downloadedTrackIds.has(track.id)) {
      alert('Esta pista no está descargada para reproducción offline.');
      return;
    }

    if (track.mediaType === 'video') {
      audioEngine.pause();
      setIsPlaying(false);
      setActiveVideoTrack(track);
      return;
    }

    setCurrentTrack(track);
    setDuration(track.duration);
    setCurrentTime(0);
    setIsPlaying(true);

    // Audio Engine play
    audioEngine.playTrack(track.id, track.mediaUrl, track.bpm || 100, (elapsed) => {
      setCurrentTime(elapsed);
    });

    // Increment play count
    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, plays: t.plays + 1 } : t))
    );

    // Increment ad counter if track has monetization enabled
    if (track.monetizationEnabled) {
      setAdCounter((prev) => {
        const nextCount = prev.current + 1;
        if (nextCount >= prev.threshold) {
          // Trigger Ad Break!
          const randomAd = AD_CAMPAIGNS[Math.floor(Math.random() * AD_CAMPAIGNS.length)];
          setTimeout(() => {
            audioEngine.pause();
            setIsPlaying(false);
            setActiveAd(randomAd);
          }, 800);
          return { ...prev, current: 0 };
        }
        return { ...prev, current: nextCount };
      });
    }
  }, [downloadedTrackIds, isOfflineMode]);

  // Toggle Play/Pause
  const handleTogglePlay = () => {
    if (!currentTrack) return;

    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.resume((elapsed) => {
        setCurrentTime(elapsed);
      });
      setIsPlaying(true);
    }
  };

  // Next Track
  const handleNext = () => {
    if (!currentTrack) return;
    const availableTracks = isOfflineMode 
      ? tracks.filter(t => downloadedTrackIds.has(t.id) && t.mediaType === 'audio')
      : tracks.filter(t => t.mediaType === 'audio');

    if (availableTracks.length === 0) return;

    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * availableTracks.length);
      handlePlayTrack(availableTracks[randomIdx]);
      return;
    }

    const currentIndex = availableTracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % availableTracks.length;
    handlePlayTrack(availableTracks[nextIndex]);
  };

  // Prev Track
  const handlePrev = () => {
    if (!currentTrack) return;
    const availableTracks = isOfflineMode 
      ? tracks.filter(t => downloadedTrackIds.has(t.id) && t.mediaType === 'audio')
      : tracks.filter(t => t.mediaType === 'audio');

    if (availableTracks.length === 0) return;

    const currentIndex = availableTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + availableTracks.length) % availableTracks.length;
    handlePlayTrack(availableTracks[prevIndex]);
  };

  // Seek
  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    audioEngine.seek(newTime);
  };

  // Likes toggle
  const handleToggleLike = (trackId: string) => {
    setLikedTrackIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(trackId)) {
        updated.delete(trackId);
        setTracks((all) => all.map((t) => (t.id === trackId ? { ...t, likes: Math.max(0, t.likes - 1) } : t)));
      } else {
        updated.add(trackId);
        setTracks((all) => all.map((t) => (t.id === trackId ? { ...t, likes: t.likes + 1 } : t)));
      }
      return updated;
    });
  };

  // Offline download simulation
  const handleToggleDownload = (track: Track) => {
    setDownloadedTrackIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(track.id)) {
        updated.delete(track.id);
      } else {
        updated.add(track.id);
      }
      return updated;
    });
  };

  // Ad completed handler (Simulated Monetization CPM attribution)
  const handleAdCompleted = (revenueEarned: number) => {
    setActiveAd(null);

    // Update Creator earnings state
    setCreatorEarnings((prev) => ({
      ...prev,
      accumulatedBalance: Number((prev.accumulatedBalance + revenueEarned).toFixed(2)),
      adRevenue: Number((prev.adRevenue + revenueEarned).toFixed(2))
    }));

    // Update Admin platform stats
    setAdminMetrics((prev) => ({
      ...prev,
      platformAdRevenueToday: Number((prev.platformAdRevenueToday + revenueEarned * 1.4).toFixed(2))
    }));

    // Resume track playback
    if (currentTrack) {
      audioEngine.resume((elapsed) => {
        setCurrentTime(elapsed);
      });
      setIsPlaying(true);
    }
  };

  // Manual Trigger Ad Simulation
  const handleTriggerAdSimulation = () => {
    audioEngine.pause();
    setIsPlaying(false);
    const randomAd = AD_CAMPAIGNS[Math.floor(Math.random() * AD_CAMPAIGNS.length)];
    setActiveAd(randomAd);
  };

  // Withdraw funds
  const handleWithdrawFunds = (amount: number) => {
    setCreatorEarnings((prev) => ({
      ...prev,
      accumulatedBalance: 0,
      totalPaidOut: prev.totalPaidOut + amount,
      history: [
        {
          id: `pay-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount,
          method: 'Stripe Direct',
          status: 'completed',
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
        },
        ...prev.history
      ]
    }));
  };

  // New Track uploaded by artist
  const handleTrackCreated = async (newTrack: Track) => {
    setTracks((prev) => [newTrack, ...prev]);
    // Persist to Supabase if configured
    await createTrack(newTrack);

    // If it's audio, auto queue & play
    if (newTrack.mediaType === 'audio') {
      handlePlayTrack(newTrack);
    } else {
      setActiveVideoTrack(newTrack);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn('Signout warning:', err);
    } finally {
      setCurrentTab('stream');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#f1f2f6] flex flex-col font-sans selection:bg-[#1DB954] selection:text-black">
      {/* Top Persistent Header */}
      <Navbar
        currentUser={currentUser}
        activeRole={currentUser?.role}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOfflineMode={isOfflineMode}
        onToggleOffline={() => setIsOfflineMode(!isOfflineMode)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onNavigateToProfile={() => {
          setCurrentTab('profile');
          if (typeof window !== 'undefined' && window.history?.pushState) {
            window.history.pushState({}, '', '/perfil');
          }
        }}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onSignOut={handleSignOut}
        adCounter={adCounter}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Tab 1: Oyente (Listener App Feed) */}
        {currentTab === 'stream' && (
          <ListenerFeed
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onOpenVideoModal={(track) => {
              audioEngine.pause();
              setIsPlaying(false);
              setActiveVideoTrack(track);
            }}
            likedTrackIds={likedTrackIds}
            onToggleLike={handleToggleLike}
            downloadedTrackIds={downloadedTrackIds}
            onToggleDownload={handleToggleDownload}
            isOfflineMode={isOfflineMode}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            isLoadingTracks={isLoadingTracks}
            onRefreshTracks={loadTracks}
            isSupabaseConnected={isSupabaseConfigured}
          />
        )}

        {/* Tab 2: Creador (Artist Studio Dashboard) */}
        {currentTab === 'studio' && (
          <ArtistDashboard
            tracks={tracks.filter((t) => t.artistId === 'creator-neo-01' || (currentUser && t.artistName === (currentUser.stageName || currentUser.name)))}
            analytics={creatorAnalytics}
            earnings={creatorEarnings}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onTriggerAdSimulation={handleTriggerAdSimulation}
            onWithdrawFunds={handleWithdrawFunds}
            artistName={currentUser?.stageName || currentUser?.name || 'Artista'}
          />
        )}

        {/* Tab 3: Administrador de Plataforma */}
        {currentTab === 'admin' && (
          <AdminDashboard
            metrics={adminMetrics}
            adCampaigns={AD_CAMPAIGNS}
            onTriggerAdSimulation={handleTriggerAdSimulation}
          />
        )}

        {/* Tab 4: Arquitectura de Software & Backend */}
        {currentTab === 'architecture' && <ArchitectureDoc />}

        {/* Tab 5: Vista de Perfil (/perfil) */}
        {currentTab === 'profile' && currentUser && (
          <ProfilePage
            user={currentUser}
            onUpdateUser={(updatedUser) => {
              setCurrentUser(updatedUser);
            }}
            onBack={() => {
              setCurrentTab('stream');
              if (typeof window !== 'undefined' && window.history?.pushState) {
                window.history.pushState({}, '', '/');
              }
            }}
          />
        )}
      </main>

      {/* Persistent Global Audio Player Bar (Spotify style) */}
      <AudioPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isRepeat={isRepeat}
        isShuffle={isShuffle}
        isLiked={currentTrack ? likedTrackIds.has(currentTrack.id) : false}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        onSeek={handleSeek}
        onChangeVolume={(val) => {
          setVolume(val);
          setIsMuted(false);
        }}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleRepeat={() => setIsRepeat(!isRepeat)}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleLike={() => currentTrack && handleToggleLike(currentTrack.id)}
        onOpenFullscreen={() => setIsFullScreenPlayerOpen(true)}
        onToggleLyrics={() => setIsFullScreenPlayerOpen(true)}
        onToggleQueue={() => {}}
        onDownloadOffline={handleToggleDownload}
        isDownloaded={currentTrack ? downloadedTrackIds.has(currentTrack.id) : false}
      />

      {/* Full-Screen Immersive Audio Player Modal with Synced Lyrics */}
      <FullScreenPlayer
        track={currentTrack}
        isOpen={isFullScreenPlayerOpen}
        onClose={() => setIsFullScreenPlayerOpen(false)}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        onSeek={handleSeek}
        isLiked={currentTrack ? likedTrackIds.has(currentTrack.id) : false}
        onToggleLike={() => currentTrack && handleToggleLike(currentTrack.id)}
      />

      {/* Full-Screen Video Player Modal (Videoclips & Vertical Shorts) */}
      <VideoPlayerModal
        track={activeVideoTrack}
        isOpen={Boolean(activeVideoTrack)}
        onClose={() => setActiveVideoTrack(null)}
        isLiked={activeVideoTrack ? likedTrackIds.has(activeVideoTrack.id) : false}
        onToggleLike={() => activeVideoTrack && handleToggleLike(activeVideoTrack.id)}
      />

      {/* Ad Insertion Overlay (Simulated Commercial Break with Confetti & CPM Revenue) */}
      {activeAd && (
        <AdOverlay
          ad={activeAd}
          isOpen={Boolean(activeAd)}
          onAdCompleted={handleAdCompleted}
          creatorName={currentTrack?.artistName || 'NeoNova'}
        />
      )}

      {/* Artist Media Upload Modal (Audio MP3/WAV, Video MP4, metadata, ad frequency) */}
      <ArtistUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onTrackCreated={handleTrackCreated}
        artistId={currentUser?.id || 'creator-anonymous'}
        artistName={currentUser?.stageName || currentUser?.name || 'Artista'}
        artistAvatar={currentUser?.avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'}
      />

      {/* Auth Modal: Google OAuth, Email/Password and Role Selection */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessAuth={(user) => {
          setCurrentUser(user);
          if (user.role === 'creator') {
            setCurrentTab('studio');
          } else {
            setCurrentTab('stream');
          }
        }}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          user={currentUser}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onEditProfile={() => {
            setCurrentTab('profile');
            if (typeof window !== 'undefined' && window.history?.pushState) {
              window.history.pushState({}, '', '/perfil');
            }
          }}
          onGoToStudio={() => {
            setCurrentTab('studio');
          }}
        />
      )}

      {/* Settings Modal */}
      {currentUser && (
        <SettingsModal
          currentUser={currentUser}
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}
    </div>
  );
}
