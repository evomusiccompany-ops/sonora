import React, { useState, useRef } from 'react';
import { Track, MediaType, ReleaseType, Genre } from '../types';
import { 
  X, 
  UploadCloud, 
  Music, 
  Film, 
  Image as ImageIcon, 
  DollarSign, 
  Check, 
  Sparkles,
  FileAudio,
  Radio,
  Sliders,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { uploadAudioFile, uploadCoverImage } from '../lib/storage';

interface ArtistUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackCreated: (newTrack: Track) => void;
  artistId: string;
  artistName: string;
  artistAvatar: string;
}

const GENRES: Genre[] = [
  'Urban / Reggaeton',
  'Lo-Fi / Chill',
  'Synthwave / Retro',
  'Trap / Hip-Hop',
  'Indie Pop',
  'Acoustic / Folk',
  'Electronic / Dance',
  'Podcast'
];

export const ArtistUploadModal: React.FC<ArtistUploadModalProps> = ({
  isOpen,
  onClose,
  onTrackCreated,
  artistId,
  artistName,
  artistAvatar
}) => {
  const [mediaType, setMediaType] = useState<MediaType>('audio');
  const [title, setTitle] = useState('');
  const [albumName, setAlbumName] = useState('Nuevo Sencillo');
  const [releaseType, setReleaseType] = useState<ReleaseType>('single');
  const [genre, setGenre] = useState<Genre>('Urban / Reggaeton');
  
  // Storage files
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  // URLs & Previews
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileDuration, setFileDuration] = useState(180);
  const [videoOrientation, setVideoOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [monetizationEnabled, setMonetizationEnabled] = useState(true);
  const [adFrequency, setAdFrequency] = useState(3);
  const [lyricsInput, setLyricsInput] = useState('');
  
  // Upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setFileName(file.name);
    setErrorMessage(null);

    // If it's a video file, auto select video type
    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else if (file.type.startsWith('audio/')) {
      setMediaType('audio');
    }

    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    setMediaUrl(objectUrl);

    // Auto extract duration
    if (file.type.startsWith('audio/')) {
      const audio = new Audio(objectUrl);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setFileDuration(Math.round(audio.duration));
        }
      };
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = objectUrl;
      video.onloadedmetadata = () => {
        if (video.duration && !isNaN(video.duration)) {
          setFileDuration(Math.round(video.duration));
        }
        if (video.videoHeight > video.videoWidth) {
          setVideoOrientation('vertical');
        }
      };
    }

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
      setCoverUrl(url);
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Por favor ingresa un título para la obra.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      let finalAudioUrl = mediaUrl;
      let finalCoverUrl = coverUrl;

      // 1. Upload audio / media file to Supabase Storage 'audio' bucket
      if (audioFile) {
        setUploadProgressText('Subiendo pista a Supabase Storage (bucket: audio)...');
        const audioResult = await uploadAudioFile(audioFile, artistId);
        if (audioResult.publicUrl) {
          finalAudioUrl = audioResult.publicUrl;
        }
      }

      // 2. Upload cover artwork to Supabase Storage 'covers' bucket
      if (coverFile) {
        setUploadProgressText('Subiendo portada a Supabase Storage (bucket: covers)...');
        const coverResult = await uploadCoverImage(coverFile, artistId);
        if (coverResult.publicUrl) {
          finalCoverUrl = coverResult.publicUrl;
        }
      }

      // Fallbacks if no files were selected
      if (!finalCoverUrl) {
        finalCoverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
      }
      if (!finalAudioUrl) {
        finalAudioUrl = mediaType === 'video' 
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' 
          : 'virtual://user-uploaded-track';
      }

      setUploadProgressText('Registrando canción en la base de datos...');

      const newTrack: Track = {
        id: `track-${Date.now()}`,
        title: title.trim(),
        artistId,
        artistName,
        artistAvatar,
        albumName: albumName.trim() || 'Sencillo 2026',
        releaseType,
        coverUrl: finalCoverUrl,
        mediaUrl: finalAudioUrl,
        mediaType,
        videoOrientation: mediaType === 'video' ? videoOrientation : undefined,
        duration: fileDuration || 190,
        genre,
        releaseDate: new Date().toISOString().split('T')[0],
        plays: 0,
        likes: 1,
        monetizationEnabled,
        adFrequencyPlays: adFrequency,
        lyrics: lyricsInput.trim() ? lyricsInput.split('\n').filter(Boolean) : undefined,
        bpm: 110
      };

      // Notify parent to append track and insert into Supabase ('tracks' or 'songs' table)
      await onTrackCreated(newTrack);

      setIsUploading(false);
      onClose();
    } catch (err: any) {
      console.error('Error during upload submission:', err);
      setErrorMessage(err.message || 'Ocurrió un error al subir los archivos.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#141622] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        id="artist-upload-dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#191b2b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-[#1DB954]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Subir Canción a Sonora (Supabase Storage)</h2>
              <p className="text-xs text-zinc-400">Archivos a buckets 'audio' y 'covers' + registro de pista</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Format selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300">Tipo de Medio</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMediaType('audio')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all ${
                  mediaType === 'audio'
                    ? 'border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954]'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Pista de Audio (.mp3, .wav)</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all ${
                  mediaType === 'video'
                    ? 'border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954]'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Video (Videoclip / Reel)</span>
              </button>
            </div>
          </div>

          {/* Media File Dropzone (Audio .mp3 / .wav) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 flex items-center justify-between">
              <span>Archivo de Audio Principal (.mp3, .wav) *</span>
              <span className="text-[10px] text-[#1DB954] font-medium">Bucket: audio</span>
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group ${
                audioFile 
                  ? 'border-[#1DB954] bg-[#1DB954]/5' 
                  : 'border-zinc-700 hover:border-[#1DB954] bg-zinc-900/40 hover:bg-zinc-900/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={mediaType === 'audio' ? '.mp3,.wav,audio/mp3,audio/wav,audio/mpeg,audio/*' : '.mp4,.webm,video/mp4,video/*'}
                onChange={handleMediaFileChange}
                className="hidden"
              />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                audioFile ? 'bg-[#1DB954]/20 text-[#1DB954]' : 'bg-zinc-800 text-zinc-400 group-hover:text-[#1DB954]'
              }`}>
                {audioFile ? (
                  <Check className="w-6 h-6 text-[#1DB954]" />
                ) : mediaType === 'audio' ? (
                  <FileAudio className="w-6 h-6" />
                ) : (
                  <Film className="w-6 h-6" />
                )}
              </div>

              <div>
                <p className="font-bold text-sm text-white">
                  {audioFile ? audioFile.name : `Seleccionar archivo ${mediaType === 'audio' ? '.mp3 / .wav' : '.mp4'}`}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {audioFile 
                    ? `Tamaño: ${(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Duración: ~${fileDuration}s` 
                    : 'Haz clic para explorar tus archivos locales.'}
                </p>
              </div>
            </div>
          </div>

          {/* Cover Art Dropzone & Selector (Bucket: covers) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 flex items-center justify-between">
              <span>Imagen de Portada (Cover Art .jpg, .png)</span>
              <span className="text-[10px] text-purple-400 font-medium">Bucket: covers</span>
            </label>
            <div className="flex gap-3 items-center">
              {coverPreview && (
                <img 
                  src={coverPreview} 
                  alt="Cover preview" 
                  className="w-14 h-14 rounded-xl object-cover border border-[#1DB954]/40 bg-zinc-800 shrink-0 shadow-md"
                />
              )}
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setCoverPreview(e.target.value);
                  }}
                  placeholder="URL o sube un archivo .jpg/.png a Supabase Storage..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1DB954]"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center gap-1.5 border border-zinc-700 transition-colors shrink-0"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span>{coverFile ? 'Cambiar Imagen' : 'Subir Archivo'}</span>
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*,.jpg,.jpeg,.png,.webp"
                  onChange={handleCoverFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* If video, orientation selector */}
          {mediaType === 'video' && (
            <div className="flex items-center gap-4 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              <span className="font-semibold text-zinc-300">Formato de Video:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                <input
                  type="radio"
                  name="orientation"
                  checked={videoOrientation === 'horizontal'}
                  onChange={() => setVideoOrientation('horizontal')}
                  className="accent-[#1DB954]"
                />
                <span>Horizontal (16:9 HD)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
                <input
                  type="radio"
                  name="orientation"
                  checked={videoOrientation === 'vertical'}
                  onChange={() => setVideoOrientation('vertical')}
                  className="accent-[#1DB954]"
                />
                <span>Vertical (9:16 Shorts / Reels)</span>
              </label>
            </div>
          )}

          {/* Track Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Título de la Canción / Pista *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Ecos de la Noche"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1DB954]"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Género Principal *</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1DB954]"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Tipo de Lanzamiento</label>
              <select
                value={releaseType}
                onChange={(e) => setReleaseType(e.target.value as ReleaseType)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1DB954]"
              >
                <option value="single">Sencillo (Single)</option>
                <option value="album">Álbum Completo</option>
                <option value="ep">EP (Extended Play)</option>
                <option value="clip">Clip Corto / Reel</option>
                <option value="podcast">Episodio de Podcast</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">Nombre del Álbum o Colección</label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="Ej: Prisma Nocturno"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1DB954]"
              />
            </div>
          </div>

          {/* Monetization & Ad settings */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Monetización por Publicidad</h4>
                  <p className="text-[11px] text-zinc-400">Genera ingresos CPM insertando anuncios en tus reproducciones</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={monetizationEnabled}
                  onChange={(e) => setMonetizationEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1DB954]"></div>
              </label>
            </div>

            {monetizationEnabled && (
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                <span className="text-zinc-300">Frecuencia de inserción de anuncios:</span>
                <select
                  value={adFrequency}
                  onChange={(e) => setAdFrequency(Number(e.target.value))}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-white font-semibold"
                >
                  <option value={2}>Cada 2 reproducciones (Alta)</option>
                  <option value={3}>Cada 3 reproducciones (Equilibrada)</option>
                  <option value={5}>Cada 5 reproducciones (Leve)</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit button & Progress status */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
            <div className="text-zinc-400 text-xs flex items-center gap-2">
              {isUploading && (
                <>
                  <Loader2 className="w-4 h-4 text-[#1DB954] animate-spin" />
                  <span className="text-zinc-300">{uploadProgressText || 'Subiendo archivos...'}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isUploading || !title}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  isUploading || !title
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-lg shadow-[#1DB954]/20 hover:scale-105 active:scale-95'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subiendo a Supabase...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Subir Canción & Publicar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
