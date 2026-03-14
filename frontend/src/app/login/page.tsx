'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
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
      const { data } = await api.post('/users/login', { email, password });
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050508]">
      {/* ── Technical Grid Overlay ── */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      
      {/* ── Dramatic Background Orbs ── */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />

      {/* ── Subtle animated noise ── */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className={`relative z-10 w-full max-w-[420px] mx-4 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        
        {/* ── The "Laser" Border ── */}
        <div className="absolute -inset-[1px] rounded-[2rem] p-[1px] overflow-hidden">
          <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite]"
            style={{ background: 'conic-gradient(from 0deg, transparent 0 340deg, #6366f1 360deg)' }} />
        </div>

        {/* ── Main Card ── */}
        <div className="relative rounded-[2rem] bg-[#0a0a0f]/90 backdrop-blur-3xl px-10 py-12 border border-white/5 shadow-2xl overflow-hidden">
          {/* Inner metallic highlight */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent" />
          
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1e1e2d 0%, #0a0a0f 100%)',
                  border: '1px solid rgba(99,102,241,0.5)',
                  boxShadow: '0 0 30px rgba(79,70,229,0.2)',
                }}>
                <span className="font-black text-white text-3xl tracking-tighter italic">S</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#4f46e5]/20 to-transparent" />
              </div>
              {/* Outer logo glow */}
              <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-1">
              SGB <span className="text-indigo-500">SYSTEM</span>
            </h1>
            <div className="h-[2px] w-12 bg-indigo-600 rounded-full mb-2" />
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Secure Access Terminal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl text-[12px] font-bold border-l-4 transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', borderLeftColor: '#ef4444', color: '#fca5a5' }}>
              {error.toUpperCase()}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Identity</label>
              <div className="relative">
                <input
                  id="login-email" type="email" required autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="USER@SGB.SYSTEM"
                  className="w-full h-[52px] px-5 bg-black/40 border border-white/5 rounded-2xl text-sm text-white placeholder:text-zinc-800 focus:border-indigo-500/50 focus:ring-0 transition-all outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Cipher</label>
              <div className="relative">
                <input
                  id="login-password" type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[52px] px-5 bg-black/40 border border-white/5 rounded-2xl text-sm text-white placeholder:text-zinc-800 focus:border-indigo-500/50 focus:ring-0 transition-all outline-none font-mono"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-indigo-400 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              id="login-submit"
              className="w-full h-[54px] rounded-2xl text-xs font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden group border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)] active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
              
              {/* Button Shine Effect */}
              <div className="absolute inset-0 transform -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Initialize Connection</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer UI */}
          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
            <Link href="/signup"
              className="text-[11px] font-black text-zinc-500 uppercase tracking-widest hover:text-indigo-400 transition-colors">
              New Operator? <span className="text-white ml-2 underline underline-offset-4">Register</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Data Scroller Indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="h-[1px] w-8 bg-indigo-500/20" />
        <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] whitespace-nowrap">
          Encrypted · Terminal · v1.0.0
        </span>
        <div className="h-[1px] w-8 bg-indigo-500/20" />
      </div>
    </div>
  );
}
