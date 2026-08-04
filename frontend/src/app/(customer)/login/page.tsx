'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate and get Token
      const tokenRes = await api.post('/auth/login', { email, password });
      const { access_token } = tokenRes.data;
      
      // Save temporary token in localStorage so subsequent call utilizes it
      localStorage.setItem('auth_token', access_token);
      
      // 2. Fetch User Profile
      const profileRes = await api.get('/auth/profile');
      const userProfile = profileRes.data;

      // 3. Save to Zustand store
      login(access_token, userProfile, false);
      
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-lg shadow-xl">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-2xl font-bold tracking-[0.1em] font-luxury gold-text-gradient">
            STYLISH TICK
          </span>
          <h2 className="text-xl font-light uppercase tracking-wider text-foreground">Sign In</h2>
          <p className="text-xs text-muted-foreground">Access your private watch boutique account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-4 py-2.5 outline-none transition-all"
            />
          </div>

          <div className="space-y-1 relative">
            <div className="flex justify-between items-center">
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Password</label>
            </div>
            <input 
              type={showPassword ? 'text' : 'password'} 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-4 py-2.5 outline-none transition-all"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-7.5 text-muted-foreground hover:text-primary"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-primary-foreground font-semibold rounded text-xs uppercase tracking-widest transition-colors shadow-lg mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            Sign In
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
}
