import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_USERS } from '../services/mockData';
import { Register } from './Register';
import { 
  X, 
  Check, 
  Shield, 
  Key, 
  Mail, 
  UserCheck, 
  Sparkles, 
  Headphones, 
  Mic2, 
  Copy,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
  onRegisterUser: (newUser: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onRegisterUser
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'supabase_register' | 'register' | 'jwt'>('supabase_register');
  const [registerRole, setRegisterRole] = useState<UserRole>('creator');
  const [name, setName] = useState('');
  const [stageName, setStageName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen) return null;

  // Generate simulated JWT payload for display
  const simulatedJwtHeader = {
    alg: 'HS256',
    typ: 'JWT'
  };
  const simulatedJwtPayload = {
    sub: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    stageName: currentUser.stageName || null,
    plan: currentUser.plan,
    verified: currentUser.verified || false,
    iss: 'https://auth.sonora.stream',
    aud: 'https://api.sonora.stream',
    exp: Math.floor(Date.now() / 1000) + 86400,
    iat: Math.floor(Date.now() / 1000)
  };
  const simulatedJwtString = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(simulatedJwtPayload))}.c29ub3JhLXNpZ25hdHVyZS1rZXktMjAyNg`;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      stageName: registerRole === 'creator' ? (stageName || name) : undefined,
      email,
      bio: registerRole === 'creator' ? (bio || 'Artista independiente en Sonora.') : undefined,
      avatar: registerRole === 'creator'
        ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      role: registerRole,
      verified: registerRole === 'creator',
      followersCount: registerRole === 'creator' ? 120 : 12,
      plan: 'free',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onRegisterUser(newUser);
    onSelectUser(newUser);
    onClose();
  };

  const copyTokenToClipboard = () => {
    navigator.clipboard.writeText(simulatedJwtString);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#14161f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        id="auth-modal-dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#191b26]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#1DB954]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Autenticación & Roles Duales</h2>
              <p className="text-xs text-zinc-400">OAuth 2.0 / JWT Role-Based Access Control</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-zinc-800 bg-[#12141c] text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('supabase_register')}
            className={`flex-1 min-w-[120px] py-2.5 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'supabase_register'
                ? 'border-[#1DB954] text-[#1DB954] bg-zinc-800/30'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Registro Supabase
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 min-w-[110px] py-2.5 px-2 text-center transition-colors border-b-2 ${
              activeTab === 'switch'
                ? 'border-[#1DB954] text-[#1DB954] bg-zinc-800/30'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Cambiar Rol
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 min-w-[110px] py-2.5 px-2 text-center transition-colors border-b-2 ${
              activeTab === 'register'
                ? 'border-[#1DB954] text-[#1DB954] bg-zinc-800/30'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Registro Rápido
          </button>
          <button
            onClick={() => setActiveTab('jwt')}
            className={`flex-1 min-w-[100px] py-2.5 px-2 text-center transition-colors border-b-2 ${
              activeTab === 'jwt'
                ? 'border-[#1DB954] text-[#1DB954] bg-zinc-800/30'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Token JWT
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'supabase_register' && (
            <div className="space-y-3">
              <Register
                onSuccess={(registeredUser) => {
                  if (registeredUser) {
                    const newUser: User = {
                      id: registeredUser.id,
                      name: registeredUser.name,
                      stageName: registeredUser.stageName,
                      email: registeredUser.email,
                      role: registeredUser.role,
                      avatar: registeredUser.role === 'creator'
                        ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
                        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
                      verified: registeredUser.role === 'creator',
                      followersCount: 0,
                      plan: 'free',
                      createdAt: new Date().toISOString().split('T')[0]
                    };
                    onRegisterUser(newUser);
                    onSelectUser(newUser);
                  }
                  onClose();
                }}
              />
            </div>
          )}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-300">
                Selecciona una identidad para probar los flujos diferenciados de la plataforma:
              </p>

              <div className="space-y-2.5">
                {INITIAL_USERS.map((user) => {
                  const isCurrent = currentUser.id === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        onClose();
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'border-[#1DB954] bg-[#1DB954]/10'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-white">
                              {user.stageName || user.name}
                            </span>
                            {user.verified && (
                              <span className="w-3.5 h-3.5 bg-blue-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-400">{user.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                          user.role === 'creator'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : user.role === 'admin'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {user.role === 'creator' ? 'Artista / Creador' : user.role === 'admin' ? 'Admin Plataforma' : 'Oyente'}
                        </span>
                        {isCurrent && <Check className="w-4 h-4 text-[#1DB954]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* OAuth Providers Simulation */}
              <div className="pt-3 border-t border-zinc-800/80">
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Proveedores OAuth 2.0 Soportados
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      // switch to listener with Google auth simulated
                      onSelectUser({
                        ...INITIAL_USERS[0],
                        email: 'user.google@gmail.com',
                        name: 'Elena (Google OAuth)'
                      });
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    Google OAuth
                  </button>

                  <button 
                    onClick={() => {
                      onSelectUser({
                        ...INITIAL_USERS[1],
                        email: 'artist.apple@icloud.com',
                        name: 'NeoNova (Apple ID)'
                      });
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white border border-zinc-700 transition-colors"
                  >
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.58-7.7-11.66-13.98-5.83-9.08-10.4-19.12-13.72-30.14-3.32-11.01-4.98-21.72-4.98-32.13 0-14.38 3.65-26.06 10.95-35.03 7.3-8.97 16.32-13.54 27.06-13.72 4.48 0 9.47 1.15 14.97 3.44 5.5 2.3 9.4 3.51 11.7 3.65 2.14 0 6.07-1.28 11.8-3.85 5.72-2.57 10.6-3.79 14.63-3.65 11.23.6 20.31 4.7 27.24 12.3-9.82 5.92-14.62 14.28-14.42 25.07.2 8.52 3.47 15.69 9.8 21.52 6.34 5.83 13.98 9.28 22.92 10.35-2.02 6.08-4.48 12.06-7.38 17.94zM119.22 33.37c0-7.05 2.5-13.48 7.5-19.28 5-5.8 11.13-9.51 18.39-11.13.3 2.14.45 4.14.45 6.01 0 7.05-2.58 13.59-7.75 19.62-5.17 6.03-11.39 9.58-18.59 10.64v-5.86z" />
                    </svg>
                    Apple ID OAuth
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleCreateAccount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tipo de Cuenta (Rol)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('creator')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      registerRole === 'creator'
                        ? 'border-[#1DB954] bg-[#1DB954]/10 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Mic2 className="w-5 h-5 text-[#1DB954]" />
                    <div>
                      <div className="text-xs font-bold">Creador Musical</div>
                      <div className="text-[10px] text-zinc-400">Publicar y monetizar</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('listener')}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      registerRole === 'listener'
                        ? 'border-[#1DB954] bg-[#1DB954]/10 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Headphones className="w-5 h-5 text-[#1DB954]" />
                    <div>
                      <div className="text-xs font-bold">Oyente General</div>
                      <div className="text-[10px] text-zinc-400">Escuchar y explorar</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Carlos Mendoza"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              {registerRole === 'creator' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Nombre Artístico</label>
                  <input
                    type="text"
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="Ej: Lunar Waves"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1DB954]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos@ejemplo.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1DB954]"
                />
              </div>

              {registerRole === 'creator' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Biografía Breve</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe tu género, influencias o proyectos musicales..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1DB954]"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-4"
              >
                <UserCheck className="w-4 h-4" />
                Registrar Cuenta con Token Seguro
              </button>
            </form>
          )}

          {activeTab === 'jwt' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#1DB954]" /> JWT Token Activo
                </span>
                <button
                  onClick={copyTokenToClipboard}
                  className="flex items-center gap-1 text-[11px] text-[#1DB954] hover:underline"
                >
                  {copiedToken ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedToken ? 'Copiado!' : 'Copiar Token'}
                </button>
              </div>

              {/* Encoded token preview */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg break-all text-[11px] text-zinc-400 font-mono select-all">
                <span className="text-red-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.
                <span className="text-purple-400">{btoa(JSON.stringify(simulatedJwtPayload)).slice(0, 48)}...</span>.
                <span className="text-cyan-400">c29ub3JhLXNpZ25hdHVyZS1rZXktMjAyNg</span>
              </div>

              {/* Decoded Claims */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Claims Decodificados:</div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-1.5 text-zinc-300">
                  <div><span className="text-amber-400">sub:</span> "{simulatedJwtPayload.sub}"</div>
                  <div><span className="text-amber-400">role:</span> <span className="text-[#1DB954] font-bold">"{simulatedJwtPayload.role}"</span></div>
                  <div><span className="text-amber-400">email:</span> "{simulatedJwtPayload.email}"</div>
                  <div><span className="text-amber-400">verified:</span> {String(simulatedJwtPayload.verified)}</div>
                  <div><span className="text-amber-400">plan:</span> "{simulatedJwtPayload.plan}"</div>
                  <div><span className="text-amber-400">exp:</span> {simulatedJwtPayload.exp} (Válido 24h)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
