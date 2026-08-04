'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../../services/api';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-lg shadow-xl">
        
        {/* Title / Header */}
        <div className="text-center space-y-2">
          <span className="text-2xl font-bold tracking-[0.1em] font-luxury gold-text-gradient">
            STYLISH TICK
          </span>
          <h2 className="text-xl font-light uppercase tracking-wider text-foreground">Create Account</h2>
          <p className="text-xs text-muted-foreground">Join our exclusive circle of watch connoisseurs</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-4 bg-primary/10 border border-primary text-primary rounded flex items-center gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Registration successful!</p>
              <p className="text-[10px]">Redirecting you to the boutique login...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Full Name *</label>
            <input 
              type="text" 
              name="fullName"
              required
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-4 py-2.5 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Email Address *</label>
            <input 
              type="email" 
              name="email"
              required
              placeholder="e.g. name@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-4 py-2.5 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              placeholder="e.g. +1 555-0199"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-4 py-2.5 outline-none transition-all"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Password *</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
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

          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Confirm Password *</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              name="confirmPassword"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-4 py-2.5 outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || success}
            className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-primary-foreground font-semibold rounded text-xs uppercase tracking-widest transition-colors shadow-lg mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Register Account
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-muted-foreground">
          Already a member?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
