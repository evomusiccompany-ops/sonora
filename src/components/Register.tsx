import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Headphones, Mic2, ShieldCheck, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface RegisterProps {
  onSuccess?: (registeredUser?: any) => void;
  onCancel?: () => void;
}

export function Register({ onSuccess, onCancel }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'listener' | 'artist'>('listener');
  const [stageName, setStageName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!supabase) {
      setErrorMsg('Supabase no está configurado actualmente. Revisa las variables de entorno o credenciales.');
      setLoading(false);
      return;
    }

    try {
      // 1. Crear usuario en la Autenticación de Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setErrorMsg(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Insertar el perfil extendido en la tabla 'users'
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: authData.user.id, // Enlaza el ID de Auth con la tabla
            email,
            name,
            role,
            stage_name: role === 'artist' ? stageName : null,
          },
        ]);

        if (profileError) {
          setErrorMsg('Usuario registrado en Auth, pero hubo un error al guardar el perfil en la tabla users: ' + profileError.message);
        } else {
          setSuccessMsg('¡Cuenta registrada exitosamente en Sonora!');
          if (onSuccess) {
            onSuccess({
              id: authData.user.id,
              email,
              name,
              stageName: role === 'artist' ? stageName : undefined,
              role: role === 'artist' ? 'creator' : 'listener',
            });
          }
        }
      } else {
        setSuccessMsg('Registro enviado. Por favor verifica tu bandeja de entrada si la confirmación de correo está activada.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado durante el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="max-w-md mx-auto p-5 bg-[#14161f] text-white rounded-2xl border border-zinc-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1DB954]" />
            Crear Cuenta en Sonora
          </h2>
          <p className="text-xs text-zinc-400">Autenticación Supabase con asignación de roles</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
          >
            Cancelar
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 mb-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 mb-3 bg-[#1DB954]/10 border border-[#1DB954]/30 text-[#1DB954] text-xs rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Seleccionar Rol */}
      <div className="flex gap-2.5 mb-4">
        <button
          type="button"
          onClick={() => setRole('listener')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
            role === 'listener'
              ? 'bg-[#1DB954]/15 border-[#1DB954] text-[#1DB954]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <Headphones className="w-4 h-4" />
          Oyente
        </button>
        <button
          type="button"
          onClick={() => setRole('artist')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
            role === 'artist'
              ? 'bg-[#1DB954]/15 border-[#1DB954] text-[#1DB954]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <Mic2 className="w-4 h-4" />
          Creador / Artista
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-zinc-300 font-medium mb-1">Nombre Completo</label>
          <input
            type="text"
            placeholder="Ej: Laura Gómez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 text-sm rounded-xl border border-zinc-800 focus:outline-none focus:border-[#1DB954] placeholder-zinc-500"
            required
          />
        </div>

        {role === 'artist' && (
          <div>
            <label className="block text-xs text-zinc-300 font-medium mb-1">Nombre Artístico / Proyecto</label>
            <input
              type="text"
              placeholder="Ej: DJ Shadow Beat"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 text-sm rounded-xl border border-zinc-800 focus:outline-none focus:border-[#1DB954] placeholder-zinc-500"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-zinc-300 font-medium mb-1">Correo Electrónico</label>
          <input
            type="email"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 text-sm rounded-xl border border-zinc-800 focus:outline-none focus:border-[#1DB954] placeholder-zinc-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-300 font-medium mb-1">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 text-sm rounded-xl border border-zinc-800 focus:outline-none focus:border-[#1DB954] placeholder-zinc-500"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Registrando en Supabase...
          </>
        ) : (
          'Registrarse'
        )}
      </button>
    </form>
  );
}
