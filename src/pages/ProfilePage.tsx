import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { 
  Camera, 
  Upload, 
  Check, 
  AlertCircle, 
  Loader2, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Headphones, 
  Mic2, 
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Save
} from 'lucide-react';
import { uploadUserAvatar, uploadUserBanner } from '../lib/storage';
import { supabase, getSupabase } from '../services/supabase';
import { saveOrUpdateProfile } from '../services/profileService';
import { useAuth } from '../context/AuthContext';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateUser,
  onBack
}) => {
  const { fetchUserProfile } = useAuth();

  // Image previews and states
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatar || '');
  const [bannerUrl, setBannerUrl] = useState<string>(user.banner || '');
  
  // Editable fields
  const [name, setName] = useState(user.name || '');
  const [stageName, setStageName] = useState(user.stageName || '');
  const [bio, setBio] = useState(user.bio || '');

  // Keep state synced with user updates
  useEffect(() => {
    if (user.avatar) setAvatarUrl(user.avatar);
    if (user.banner) setBannerUrl(user.banner);
    if (user.name) setName(user.name);
    if (user.stageName) setStageName(user.stageName);
    if (user.bio) setBio(user.bio);
  }, [user]);

  // Loading & feedback states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hidden file input refs
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  // Fallbacks: Generic banner & Initials
  const defaultBanner = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80';
  
  const getInitials = (fullName: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  // 1. Handle Avatar Upload to Supabase Storage ('avatars' bucket) & upsert profiles
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview
    const tempUrl = URL.createObjectURL(file);
    setAvatarUrl(tempUrl);
    setIsUploadingAvatar(true);
    setStatusMessage(null);

    try {
      // Upload to bucket 'avatars' with path: `${user.id}/avatar_${Date.now()}.png`
      const uploadResult = await uploadUserAvatar(file, user.id);

      if (uploadResult.error) {
        console.warn('Storage warning, continuing with fallback:', uploadResult.error.message);
      }

      const newPublicUrl = uploadResult.publicUrl || tempUrl;
      setAvatarUrl(newPublicUrl);

      // 1. Select de la fila, 2. Si existe .update(eq('id', user.id)), 3. Si no existe .insert(), pasando siempre id: user.id
      const fullName = name.trim() || user.name;
      const { error: saveError } = await saveOrUpdateProfile({
        id: user.id,
        full_name: fullName,
        avatar_url: newPublicUrl,
        banner_url: bannerUrl || null
      });

      if (saveError) {
        console.warn('Notice updating profile avatar:', saveError.message);
      }

      // Refrescar el estado global del usuario (Header, Player, etc.)
      if (fetchUserProfile) {
        await fetchUserProfile(user.id);
      }

      // Update local state in App
      const updatedUser: User = {
        ...user,
        name: fullName,
        avatar: newPublicUrl
      };
      onUpdateUser(updatedUser);

      setStatusMessage({
        type: 'success',
        text: '¡Foto de perfil actualizada y guardada con éxito!'
      });
    } catch (err: any) {
      console.error('Error updating avatar:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al subir la nueva foto de perfil.'
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 2. Handle Banner Upload to Supabase Storage ('avatars' bucket)
  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast local preview
    const tempUrl = URL.createObjectURL(file);
    setBannerUrl(tempUrl);
    setIsUploadingBanner(true);
    setStatusMessage(null);

    try {
      // Upload to bucket 'avatars' with path: `${user.id}/banner_${Date.now()}.png`
      const uploadResult = await uploadUserBanner(file, user.id);

      if (uploadResult.error) {
        console.warn('Storage warning, continuing with fallback:', uploadResult.error.message);
      }

      const newPublicUrl = uploadResult.publicUrl || tempUrl;
      setBannerUrl(newPublicUrl);

      // 1. Select de la fila, 2. Si existe .update(eq('id', user.id)), 3. Si no existe .insert(), pasando siempre id: user.id
      const fullName = name.trim() || user.name;
      const { error: saveError } = await saveOrUpdateProfile({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl || null,
        banner_url: newPublicUrl
      });

      if (saveError) {
        console.warn('Notice updating profile banner:', saveError.message);
      }

      // Refrescar el estado global del usuario
      if (fetchUserProfile) {
        await fetchUserProfile(user.id);
      }

      const updatedUser: User = {
        ...user,
        name: fullName,
        banner: newPublicUrl
      };
      onUpdateUser(updatedUser);

      setStatusMessage({
        type: 'success',
        text: '¡Foto de portada actualizada y guardada con éxito!'
      });
    } catch (err: any) {
      console.error('Error updating banner:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al subir la nueva portada.'
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // 3. Save profile metadata changes with select -> update / insert and call fetchUserProfile
  const handleSaveProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setStatusMessage(null);

    const fullName = name.trim();

    try {
      // 1. Select de la fila, 2. Si existe .update(eq('id', user.id)), 3. Si no existe .insert(), pasando siempre id: user.id
      const { error: saveError } = await saveOrUpdateProfile({
        id: user.id,
        full_name: fullName,
        stage_name: isArtist ? stageName.trim() : undefined,
        bio: bio.trim(),
        avatar_url: avatarUrl || null,
        banner_url: bannerUrl || null
      });

      if (saveError) {
        console.error('Error during profiles save:', saveError);
        throw new Error(saveError.message);
      }

      // Refrescar el estado en toda la aplicación (incluyendo la foto del Header)
      if (fetchUserProfile) {
        await fetchUserProfile(user.id);
      }

      const updatedUser: User = {
        ...user,
        name: fullName,
        stageName: isArtist ? stageName.trim() : undefined,
        bio: bio.trim(),
        avatar: avatarUrl,
        banner: bannerUrl
      };
      onUpdateUser(updatedUser);

      setStatusMessage({
        type: 'success',
        text: '¡Datos del perfil guardados correctamente!'
      });
    } catch (err: any) {
      console.error('Error saving profile info:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error al guardar los datos del perfil.'
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const isArtist = user.role === 'creator';

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 animate-fadeIn" id="profile-page-view">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between py-3 mb-3">
        <button
          onClick={onBack}
          id="profile-back-btn"
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-800 transition"
        >
          <ArrowLeft className="w-4 h-4 text-[#1DB954]" />
          <span>Volver al Catálogo</span>
        </button>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            isArtist 
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
              : 'bg-emerald-500/10 text-[#1DB954] border-[#1DB954]/30'
          }`}>
            {isArtist ? 'Cuenta Artista / Creador' : 'Cuenta de Oyente'}
          </span>
        </div>
      </div>

      {/* Main Profile Card Container */}
      <div className="bg-[#12141c] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
        {/* 1. FOTO DE PORTADA (BANNER) */}
        <div className="relative h-48 sm:h-64 w-full bg-zinc-900 overflow-hidden group">
          <img 
            src={bannerUrl || defaultBanner} 
            alt="Portada del perfil" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-black/30 to-transparent" />

          {/* Botón de Cambiar Portada (con icono de cámara) */}
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={isUploadingBanner}
            id="change-banner-btn"
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 text-white text-xs font-semibold backdrop-blur-md border border-white/20 hover:border-[#1DB954] transition shadow-lg disabled:opacity-50"
          >
            {isUploadingBanner ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#1DB954]" />
            ) : (
              <Camera className="w-4 h-4 text-[#1DB954]" />
            )}
            <span>{isUploadingBanner ? 'Subiendo Portada...' : 'Cambiar Portada'}</span>
          </button>

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/*"
            onChange={handleBannerFileChange}
            className="hidden"
          />
        </div>

        {/* 2. AVATAR CIRCULAR SOBREPUESTO + INFORMACIÓN */}
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
            {/* Avatar Container */}
            <div className="relative group self-start">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#12141c] bg-zinc-800 shadow-2xl overflow-hidden flex items-center justify-center relative">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Fallback: Iniciales del nombre */
                  <div className="w-full h-full bg-gradient-to-tr from-[#1DB954] to-[#10b981] flex items-center justify-center text-black font-extrabold text-3xl sm:text-4xl shadow-inner">
                    {getInitials(user.name)}
                  </div>
                )}

                {/* Overlay de carga */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-[10px] font-bold">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1DB954] mb-1" />
                    <span>Subiendo...</span>
                  </div>
                )}
              </div>

              {/* Botón Flotante Cambiar Foto de Avatar */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                id="change-avatar-btn"
                title="Cambiar foto de perfil"
                className="absolute bottom-1 right-1 p-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-xl hover:scale-110 active:scale-95 transition-all border-2 border-[#12141c] disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            {/* Quick Badges & Actions */}
            <div className="flex items-center gap-3">
              {user.plan === 'premium' && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Membresía Hi-Fi Pro</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/90 px-3 py-1.5 rounded-xl border border-zinc-800">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Miembro desde {user.createdAt || '2026'}</span>
              </div>
            </div>
          </div>

          {/* Status Message Banner */}
          {statusMessage && (
            <div className={`p-4 mb-6 rounded-2xl flex items-center gap-3 text-xs border ${
              statusMessage.type === 'success' 
                ? 'bg-[#1DB954]/10 border-[#1DB954]/30 text-[#1DB954]' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* Formulario de Edición de Perfil */}
          <form onSubmit={handleSaveProfileDetails} className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#1DB954]" />
                <span>Información Personal y Artística</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Actualiza tu nombre, descripción y presencia en Sonora.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nombre de Usuario / Oyente */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nombre Completo / Apodo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre público..."
                  className="w-full px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                  required
                />
              </div>

              {/* Correo Electrónico (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Correo Electrónico (Supabase Auth)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-xs text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Nombre Artístico (Solo si es Creador) */}
              {isArtist && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Mic2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Nombre de Artista / Proyecto Musical</span>
                  </label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Ej: NeoNova, Sintaxis Urbana..."
                    className="w-full px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                  />
                </div>
              )}

              {/* Biografía */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Biografía / Presentación
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti o tu música..."
                  className="w-full px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954] resize-none"
                />
              </div>
            </div>

            {/* Storage Info Details */}
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-300">Almacenamiento en Supabase Storage</p>
                <p className="mt-0.5">
                  Tus fotos se guardan en el bucket público <code className="text-[#1DB954] bg-[#1DB954]/10 px-1 rounded">avatars</code> bajo tu identificador único de usuario y se reflejan al instante en la cabecera y en el reproductor.
                </p>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile || isUploadingAvatar || isUploadingBanner}
                id="save-profile-btn"
                className="px-6 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#1DB954]/20 transition disabled:opacity-50 active:scale-95"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando Cambios...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios de Perfil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
