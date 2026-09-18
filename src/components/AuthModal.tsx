import React, { useState } from 'react';
import { UserRole } from '../types';
import { supabase } from '../services/supabase';
import { 
  X, 
  Headphones, 
  Mic2, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAuth?: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessAuth
}) => {
  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Selected account role: 'listener' | 'creator'
  const [accountType, setAccountType] = useState<UserRole>('listener');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [stageName, setStageName] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Google OAuth Flow
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setGoogleLoading(true);

    try {
      // Store user-selected account role in localStorage so upon redirect callback it can be assigned
      localStorage.setItem('sonora_preferred_role', accountType);

      if (!supabase) {
        // Fallback simulation for offline/local environment
        setTimeout(() => {
          setGoogleLoading(false);
          const simulatedUser = {
            id: `google-${Date.now()}`,
            name: accountType === 'creator' ? 'NeoNova Creator (Google)' : 'Carlos Google',
            stageName: accountType === 'creator' ? 'NeoNova' : undefined,
            email: 'usuario.google@gmail.com',
            role: accountType,
            avatar: accountType === 'creator'
              ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
            verified: accountType === 'creator',
            followersCount: accountType === 'creator' ? 240 : 0,
            plan: 'free',
            createdAt: new Date().toISOString().split('T')[0]
          };
          if (onSuccessAuth) onSuccessAuth(simulatedUser);
          onClose();
        }, 1000);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMsg(err.message || 'Error al conectar con Google OAuth.');
      setGoogleLoading(false);
    }
  };

  // 2. Email & Password Flow (Login or Register)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        // Fallback for mock mode
        setTimeout(() => {
          setLoading(false);
          const simulatedUser = {
            id: `user-${Date.now()}`,
            name: name || email.split('@')[0],
            stageName: accountType === 'creator' ? (stageName || name || email.split('@')[0]) : undefined,
            email,
            role: accountType,
            avatar: accountType === 'creator'
              ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
              : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
            verified: accountType === 'creator',
            followersCount: accountType === 'creator' ? 45 : 0,
            plan: 'free',
            createdAt: new Date().toISOString().split('T')[0]
          };
          if (onSuccessAuth) onSuccessAuth(simulatedUser);
          onClose();
        }, 800);
        return;
      }

      if (authMode === 'login') {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          // Fetch existing profile to get assigned role
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const resolvedRole = profile?.role === 'artist' ? 'creator' : profile?.role || accountType;

          const userObj = {
            id: data.user.id,
            name: profile?.name || data.user.email?.split('@')[0] || 'Usuario',
            stageName: profile?.stage_name || undefined,
            email: data.user.email || email,
            role: resolvedRole,
            avatar: resolvedRole === 'creator'
              ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
              : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
            verified: resolvedRole === 'creator',
            followersCount: 0,
            plan: 'free',
            createdAt: profile?.created_at || new Date().toISOString().split('T')[0]
          };

          setSuccessMsg('¡Inicio de sesión exitoso!');
          if (onSuccessAuth) onSuccessAuth(userObj);
          setTimeout(() => onClose(), 600);
        }
      } else {
        // Register (Sign Up)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || email.split('@')[0],
              role: accountType === 'creator' ? 'artist' : 'listener',
              stage_name: accountType === 'creator' ? (stageName || name) : null
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Upsert / Insert profile record in 'users' table
          const dbRole = accountType === 'creator' ? 'artist' : 'listener';
          const { error: profileError } = await supabase.from('users').upsert([
            {
              id: authData.user.id,
              email,
              name: name || email.split('@')[0],
              role: dbRole,
              stage_name: accountType === 'creator' ? (stageName || name) : null
            }
          ]);

          if (profileError) {
            console.warn('Profile table notice:', profileError.message);
          }

          const registeredUser = {
            id: authData.user.id,
            name: name || email.split('@')[0],
            stageName: accountType === 'creator' ? (stageName || name) : undefined,
            email,
            role: accountType,
            avatar: accountType === 'creator'
              ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
              : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
            verified: accountType === 'creator',
            followersCount: 0,
            plan: 'free',
            createdAt: new Date().toISOString().split('T')[0]
          };

          setSuccessMsg('¡Cuenta registrada exitosamente!');
          if (onSuccessAuth) onSuccessAuth(registeredUser);
          setTimeout(() => onClose(), 800);
        }
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setErrorMsg(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#13151f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        id="auth-modal-dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#181a26]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#1DB954]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {authMode === 'login' ? 'Iniciar Sesión en Sonora' : 'Crear Cuenta en Sonora'}
              </h2>
              <p className="text-xs text-zinc-400">Acceso seguro con Google o Correo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Notifications */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] text-xs rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. SELECCIÓN CLARA DEL TIPO DE CUENTA (Oyente vs Creador / Artista) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              1. Selecciona tu Tipo de Cuenta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType('listener')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  accountType === 'listener'
                    ? 'border-[#1DB954] bg-[#1DB954]/10 shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Headphones className={`w-4 h-4 ${accountType === 'listener' ? 'text-[#1DB954]' : 'text-zinc-400'}`} />
                  <span className={accountType === 'listener' ? 'text-white' : 'text-zinc-300'}>Oyente</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  Disfruta música, podcasts y listas en alta fidelidad
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('creator')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  accountType === 'creator'
                    ? 'border-[#1DB954] bg-[#1DB954]/10 shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Mic2 className={`w-4 h-4 ${accountType === 'creator' ? 'text-[#1DB954]' : 'text-zinc-400'}`} />
                  <span className={accountType === 'creator' ? 'text-white' : 'text-zinc-300'}>Creador / Artista</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  Sube canciones, analiza métricas y monetiza con CPM
                </p>
              </button>
            </div>
          </div>

          {/* 2. OPCIÓN A: BOTÓN DIRECTO "CONTINUAR CON GOOGLE" */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              2. Acceso con Google
            </label>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              id="google-signin-btn"
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 hover:border-zinc-600 text-white text-xs font-bold transition flex items-center justify-center gap-3 shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#1DB954]" />
                  <span>Conectando con Google...</span>
                </>
              ) : (
                <>
                  {/* Google Vector Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>
                    Continuar con Google como {accountType === 'creator' ? 'Creador' : 'Oyente'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-zinc-800" />
            <span className="absolute bg-[#13151f] px-3 text-[11px] font-semibold uppercase text-zinc-500">
              o con correo y contraseña
            </span>
          </div>

          {/* 3. OPCIÓN B: FORMULARIO DE CORREO Y CONTRASEÑA */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs text-zinc-300 font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Sofia Mendoza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                  required
                />
              </div>
            )}

            {authMode === 'register' && accountType === 'creator' && (
              <div>
                <label className="block text-xs text-zinc-300 font-semibold mb-1">Nombre Artístico / Proyecto</label>
                <input
                  type="text"
                  placeholder="Ej: Lunar Echoes"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-zinc-300 font-semibold mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-300 font-semibold mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#1DB954]/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === 'login' ? 'Entrar a Sonora' : `Registrarse como ${accountType === 'creator' ? 'Creador' : 'Oyente'}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/80">
            {authMode === 'login' ? (
              <p>
                ¿Aún no tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg(null);
                  }}
                  className="text-[#1DB954] font-bold hover:underline ml-1"
                >
                  Regístrate aquí
                </button>
              </p>
            ) : (
              <p>
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                  }}
                  className="text-[#1DB954] font-bold hover:underline ml-1"
                >
                  Inicia sesión aquí
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
