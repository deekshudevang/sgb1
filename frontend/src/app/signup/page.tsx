'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

const roleOptions = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'ORDER_PLACEMENT', label: 'Order Placement' },
  { value: 'BILLING', label: 'Billing Department' },
  { value: 'PACKAGING', label: 'Packaging Team' },
  { value: 'SHIPMENT', label: 'Shipment Team' },
];

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', role: '', secretKey: '' });
  const [showPw, setShowPw] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => { setReady(true); }, []);

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.role) { setError('Please fill in all fields.'); return; }
    setError(''); setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.secretKey) { setError('Secret key is required.'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('http://localhost:5000/api/users/register', {
        email: form.email, password: form.password, role: form.role, secretKey: form.secretKey,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full h-[48px] px-4 rounded-xl text-[14px] text-white placeholder:text-zinc-700 outline-none transition-all duration-200";
  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };
  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.06)'; };
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0118 0%, #070b1a 30%, #04081a 60%, #0c0514 100%)' }}>

      {/* Ambient orbs */}
      <div className="absolute top-[-40%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 60%)' }} />
      <div className="absolute bottom-[-30%] left-[30%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 60%)' }} />

      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Card */}
      <div className={`relative z-10 w-full max-w-[440px] mx-4 transition-all duration-700 ease-out ${ready ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.98]'}`}>
        {/* Glow border */}
        <div className="absolute -inset-px rounded-3xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(99,102,241,0.06), rgba(139,92,246,0.04), rgba(99,102,241,0.1))' }} />

        <div className="relative rounded-3xl px-10 py-10 overflow-hidden"
          style={{
            background: 'linear-gradient(170deg, rgba(18,18,28,0.95), rgba(12,12,18,0.98))',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 100px rgba(99,102,241,0.03)',
          }}>

          {/* Top glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[1px] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />

          {/* ── Success state ── */}
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <CheckCircle2 size={32} style={{ color: '#34d399' }} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Account Created</h2>
              <p className="text-[13px]" style={{ color: '#52525b' }}>Redirecting to sign in...</p>
            </div>
          ) : (
            <>
              {/* Logo + title */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}>
                  <span className="font-black text-white text-2xl leading-none">S</span>
                  <div className="absolute inset-0 rounded-2xl animate-ping opacity-10"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }} />
                </div>
                <h1 className="text-[22px] font-bold text-white tracking-tight">Create Account</h1>
                <p className="text-[12px] mt-1" style={{ color: '#52525b' }}>
                  {step === 1 ? 'Step 1 of 2 — Department details' : 'Step 2 of 2 — Verify access'}
                </p>
              </div>

              {/* Step indicator */}
              <div className="flex gap-2 mb-7">
                <div className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: 'rgba(99,102,241,0.6)' }} />
                <div className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: step >= 2 ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.04)' }} />
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px]"
                  style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', color: '#f87171' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleStepOne} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-medium mb-2 tracking-wide" style={{ color: '#52525b' }}>Email address</label>
                    <input type="email" required placeholder="you@company.com" className={inputCls} style={inputStyle}
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      onFocus={focusIn} onBlur={focusOut} />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-medium mb-2 tracking-wide" style={{ color: '#52525b' }}>Password</label>
                    <div className="relative">
                      <input type={showPw ? 'text' : 'password'} required placeholder="Min. 8 characters"
                        className={`${inputCls} pr-12`} style={inputStyle}
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        onFocus={focusIn} onBlur={focusOut} />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-zinc-300"
                        style={{ color: '#3f3f46' }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-[11px] font-medium mb-2.5 tracking-wide" style={{ color: '#52525b' }}>Department</label>
                    <div className="grid grid-cols-2 gap-2">
                      {roleOptions.map(r => (
                        <button type="button" key={r.value}
                          onClick={() => setForm({ ...form, role: r.value })}
                          className="px-3 py-2.5 rounded-xl text-[12px] font-medium text-left transition-all duration-200"
                          style={{
                            background: form.role === r.value ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${form.role === r.value ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
                            color: form.role === r.value ? '#818cf8' : '#52525b',
                          }}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continue */}
                  <button type="submit"
                    className="w-full h-[48px] rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] mt-2"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 30px rgba(99,102,241,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    Continue <ArrowRight size={15} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-5">
                  {/* Key info */}
                  <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                    style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <KeyRound size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                    <p className="text-[12px] leading-relaxed" style={{ color: '#92400e' }}>
                      Enter the onboarding key from your administrator to activate your account.
                    </p>
                  </div>

                  {/* Secret Key */}
                  <div>
                    <label className="block text-[11px] font-medium mb-2 tracking-wide" style={{ color: '#52525b' }}>Secret Key</label>
                    <div className="relative">
                      <input type={showKey ? 'text' : 'password'} required placeholder="Enter secret key..."
                        className={`${inputCls} pr-12 font-mono`} style={inputStyle}
                        value={form.secretKey} onChange={e => setForm({ ...form, secretKey: e.target.value })}
                        onFocus={focusIn} onBlur={focusOut} />
                      <button type="button" onClick={() => setShowKey(!showKey)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-zinc-300"
                        style={{ color: '#3f3f46' }}>
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setStep(1); setError(''); }}
                      className="flex-1 h-[48px] rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all duration-200"
                      style={{ border: '1px solid rgba(255,255,255,0.06)', color: '#52525b' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a1a1aa'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#52525b'; }}>
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-[2] h-[48px] rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 active:scale-[0.97]"
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
                        boxShadow: '0 4px 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                      }}>
                      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                      {loading ? 'Creating...' : 'Activate Account'}
                    </button>
                  </div>
                </form>
              )}

              {/* Sign in link */}
              <div className="flex items-center gap-3 mt-7">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <Link href="/login" className="text-[12px] font-medium transition-colors" style={{ color: '#3f3f46' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#3f3f46')}>
                  Already have an account? Sign in →
                </Link>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 transition-all duration-700 delay-300 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.4)' }} />
        <span className="text-[10px] font-medium tracking-wider" style={{ color: '#27272a' }}>ENCRYPTED · SECURE · ENTERPRISE GRADE</span>
      </div>
    </div>
  );
}
