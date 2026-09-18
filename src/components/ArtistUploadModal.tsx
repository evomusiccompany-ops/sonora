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
  Sliders
} from 'lucide-react';

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
  const [coverUrl, setCoverUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileDuration, setFileDuration] = useState(180);
  const [videoOrientation, setVideoOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [monetizationEnabled, setMonetizationEnabled] = useState(true);
  const [adFrequency, setAdFrequency] = useState(3);
  const [lyricsInput, setLyricsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    // If it's a video file, auto select video type
    if (file.type.startsWith('video/')) {
      setMediaType('video');
    } else if (file.type.startsWith('audio/')) {
      setMediaType('audio');
    }

    // Create a local blob object url so it can be streamed directly in the browser!
    const objectUrl = URL.createObjectURL(file);
    setMediaUrl(objectUrl);

    // Auto extract duration if possible
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
      const url = URL.createObjectURL(file);
      setCoverUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);

    setTimeout(() => {
      const newTrack: Track = {
        id: `track-${Date.now()}`,
        title: title.trim(),
        artistId,
        artistName,
        artistAvatar,
        albumName: albumName.trim() || 'Sencillo 2026',
        releaseType,
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
        mediaUrl: mediaUrl || (mediaType === 'video' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' : 'virtual://user-uploaded-track'),
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

      onTrackCreated(newTrack);
      setIsUploading(false);
      onClose();
    }, 600);
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
              <h2 className="text-sm font-bold text-white">Subir Contenido Multimedia</h2>
              <p className="text-xs text-zinc-400">Audio (MP3/WAV) o Video (MP4/WebM) con monetización</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
                <span>Pista de Audio (Música / Podcast)</span>
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
                <span>Video (Videoclip / Reel Vertical)</span>
              </button>
            </div>
          </div>

          {/* Media File Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-[#1DB954] rounded-2xl p-5 text-center cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/70 transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={mediaType === 'audio' ? 'audio/mp3,audio/wav,audio/mpeg,audio/*' : 'video/mp4,video/webm,video/*'}
              onChange={handleMediaFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-[#1DB954]/20 flex items-center justify-center transition-colors">
              {fileName ? (
                <Check className="w-6 h-6 text-[#1DB954]" />
              ) : mediaType === 'audio' ? (
                <FileAudio className="w-6 h-6 text-zinc-400 group-hover:text-[#1DB954]" />
              ) : (
                <Film className="w-6 h-6 text-zinc-400 group-hover:text-[#1DB954]" />
              )}
            </div>

            <div>
              <p className="font-bold text-sm text-white">
                {fileName ? fileName : `Selecciona o arrastra tu archivo ${mediaType === 'audio' ? 'MP3 / WAV' : 'MP4'}`}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {fileName 
                  ? `Duración detectada: ~${fileDuration}s` 
                  : 'Máximo 200MB. Transcodificación automática en edge CDN.'}
              </p>
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
              <label className="block font-semibold text-zinc-300 mb-1">Título de la Obra *</label>
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

          {/* Cover image field */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-zinc-300">Portada de la Pista (Cover Art)</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... o sube una imagen"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#1DB954]"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center gap-1.5 border border-zinc-700 transition-colors shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Subir Imagen</span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverFileChange}
                className="hidden"
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

          {/* Submit button */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors"
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
              <Sparkles className="w-4 h-4" />
              <span>{isUploading ? 'Procesando & Transcodificando...' : 'Publicar en Sonora'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
