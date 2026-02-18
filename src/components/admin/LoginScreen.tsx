import { useState, useEffect } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { encryptToken, decryptToken } from './utils';
import { STORAGE_KEY, STORAGE_SALT, STORAGE_IV } from './constants';

interface LoginScreenProps {
  onLogin: (token: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<'password' | 'token'>('password');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hasEncryptedToken = !!localStorage.getItem(STORAGE_KEY);

  useEffect(() => {
    setMode(hasEncryptedToken ? 'password' : 'token');
  }, [hasEncryptedToken]);

  const handlePasswordLogin = async () => {
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const enc = localStorage.getItem(STORAGE_KEY)!;
      const salt = localStorage.getItem(STORAGE_SALT)!;
      const iv = localStorage.getItem(STORAGE_IV)!;
      const decrypted = await decryptToken(enc, salt, iv, password);
      onLogin(decrypted);
    } catch {
      setError('Contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenLogin = async () => {
    if (!token.trim()) return;
    setError('');

    if (setupPassword) {
      if (setupPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      setLoading(true);
      try {
        const { enc, salt, iv } = await encryptToken(token.trim(), setupPassword);
        localStorage.setItem(STORAGE_KEY, enc);
        localStorage.setItem(STORAGE_SALT, salt);
        localStorage.setItem(STORAGE_IV, iv);
      } catch {
        setError('Error al guardar');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    onLogin(token.trim());
  };

  const clearStoredToken = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_SALT);
    localStorage.removeItem(STORAGE_IV);
    setMode('token');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 mb-4">
            <Lock size={24} className="text-white/70" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Panel de administración</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6 space-y-4">
            {hasEncryptedToken && mode === 'password' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    Contraseña
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
                    placeholder="Tu contraseña corta"
                    className="bg-gray-800 border-gray-700 text-white"
                    autoFocus
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <Button onClick={handlePasswordLogin} disabled={loading} className="w-full">
                  {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                  Ingresar
                </Button>
                <button
                  onClick={clearStoredToken}
                  className="w-full text-xs text-gray-500 hover:text-gray-300 transition text-center"
                >
                  Usar token directamente
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    GitHub Token
                  </label>
                  <Input
                    type="password"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="ghp_..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-500 mb-3">
                    Opcional: proteger con contraseña corta para próximos accesos
                  </p>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      value={setupPassword}
                      onChange={e => setSetupPassword(e.target.value)}
                      placeholder="Contraseña corta (ej: 1234)"
                      className="bg-gray-800 border-gray-700 text-white text-sm"
                    />
                    {setupPassword && (
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar contraseña"
                        className="bg-gray-800 border-gray-700 text-white text-sm"
                      />
                    )}
                  </div>
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <Button onClick={handleTokenLogin} disabled={loading} className="w-full">
                  {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                  {setupPassword ? 'Guardar y entrar' : 'Entrar sin contraseña'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}