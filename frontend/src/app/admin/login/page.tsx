'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/admin/login', { username, password });
      const { access_token } = response.data;
      
      // Save token in store
      login(access_token, null, true);
      
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 border border-zinc-800 p-8 rounded-lg shadow-2xl">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary flex items-center justify-center mx-auto text-primary">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-[0.1em] font-luxury text-primary block pt-2">
            STYLISH TICK CONTROL
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Boutique Executive Login</h2>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-5 text-xs text-zinc-400">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider">Executive Username</label>
            <input 
              type="text" 
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white focus:border-primary/50 rounded px-4 py-2.5 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider">Security Password</label>
            <div className="relative flex items-center">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white focus:border-primary/50 rounded pl-4 pr-11 py-2.5 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-400 hover:text-white transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-primary-foreground font-semibold rounded text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Access Console
          </button>
        </form>

      </div>
    </div>
  );
}
