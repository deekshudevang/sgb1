'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore(s => s.setUser);

  useEffect(() => { setReady(true); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
      setUser(data);
      const r: Record<string, string> = {
        ADMIN: '/admin', PACKAGING: '/packaging', SHIPMENT: '/shipping',
        ORDER_PLACEMENT: '/orders', BILLING: '/orders',
      };
      router.push(r[data.role] || '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0118 0%, #070b1a 30%, #04081a 60%, #0c0514 100%)' }}>

      {/* ── Ambient light effects ── */}
      <div className="absolute top-[-40%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 60%)' }} />
      <div className="absolute bottom-[-30%] left-[30%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 60%)' }} />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.03) 0%, transparent 60%)' }} />

      {/* ── Subtle noise overlay ── */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* ── Login Card ── */}
      <div className={`relative z-10 w-full max-w-[420px] mx-4 transition-all duration-700 ease-out ${ready ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.98]'}`}>

        {/* Card glow ring */}
        <div className="absolute -inset-px rounded-3xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06), rgba(99,102,241,0.04), rgba(139,92,246,0.1))', }} />

        {/* Card body */}
        <div className="relative rounded-3xl px-10 py-12 overflow-hidden"
          style={{
            background: 'linear-gradient(170deg, rgba(18,18,28,0.95), rgba(12,12,18,0.98))',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 100px rgba(99,102,241,0.03)',
          }}>

          {/* Inner ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[1px] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }} />

          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}>
              <span className="font-black text-white text-2xl leading-none">S</span>
              {/* Logo pulse ring */}
              <div className="absolute inset-0 rounded-2xl animate-ping opacity-10"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }} />
            </div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">SGB Workflow</h1>
            <p className="text-[12px] mt-1" style={{ color: '#52525b' }}>Sign in to your workspace</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px]"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', color: '#f87171' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-medium mb-2 tracking-wide" style={{ color: '#52525b' }}>
                Email address
              </label>
              <input
                id="login-email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-[48px] px-4 rounded-xl text-[14px] text-white placeholder:text-zinc-700 outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.06)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-medium mb-2 tracking-wide" style={{ color: '#52525b' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password" type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[48px] px-4 pr-12 rounded-xl text-[14px] text-white placeholder:text-zinc-700 outline-none transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.06)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-zinc-300"
                  style={{ color: '#3f3f46' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              id="login-submit"
              className="w-full h-[48px] rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 active:scale-[0.97] mt-1"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 30px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Continue'}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <span className="text-[10px] font-medium tracking-wider" style={{ color: '#27272a' }}>NEW HERE?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>

          {/* Register */}
          <Link href="/signup"
            className="w-full h-[44px] rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all duration-200"
            style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#52525b' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#52525b'; e.currentTarget.style.background = 'transparent'; }}>
            Create an account <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Bottom security text ── */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 transition-all duration-700 delay-300 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.4)' }} />
        <span className="text-[10px] font-medium tracking-wider" style={{ color: '#27272a' }}>ENCRYPTED · SECURE · ENTERPRISE GRADE</span>
      </div>
    </div>
  );
}
