'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Package, CreditCard, Truck, LogOut,
  Map, Box, ChevronRight, ChevronLeft, Bell, Settings
} from 'lucide-react';

const navConfig: Record<string, { label: string; href: string; icon: any }[]> = {
  ADMIN: [
    { label: 'Control Panel', href: '/admin', icon: LayoutDashboard },
    { label: 'Workflow Map', href: '/admin/map', icon: Map },
  ],
  ORDER_PLACEMENT: [{ label: 'Create Order', href: '/orders', icon: Package }],
  BILLING: [
    { label: 'Create Order', href: '/orders', icon: Package },
    { label: 'Billing Queue', href: '/billing', icon: CreditCard },
  ],
  PACKAGING: [{ label: 'Packaging Station', href: '/packaging', icon: Box }],
  SHIPMENT: [{ label: 'Shipping Deck', href: '/shipping', icon: Truck }],
};

const roleTheme: Record<string, { badge: string; glow: string; label: string }> = {
  ADMIN: { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', glow: 'rgba(139,92,246,0.2)', label: 'Administrator' },
  ORDER_PLACEMENT: { badge: 'bg-brand-500/10 text-brand-400 border-brand-500/20', glow: 'rgba(99,102,241,0.2)', label: 'Order Placement' },
  BILLING: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', glow: 'rgba(16,185,129,0.2)', label: 'Billing' },
  PACKAGING: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', glow: 'rgba(245,158,11,0.2)', label: 'Packaging' },
  SHIPMENT: { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', glow: 'rgba(244,63,94,0.2)', label: 'Shipment' },
};

function LiveClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right hidden sm:block">
      <p className="text-xs font-mono text-zinc-300 font-medium">{time}</p>
      <p className="text-[10px] text-zinc-600">{date}</p>
    </div>
  );
}

export default function DashboardLayout({ children, sidebarActions }: { children: React.ReactNode; sidebarActions?: React.ReactNode }) {
  const { user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('workflow_user');
    if (stored && !user) setUser(JSON.parse(stored));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !localStorage.getItem('workflow_user')) router.push('/login');
  }, [isMounted, user]);

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-glow"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
            <span className="text-xl font-black text-white">S</span>
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-xs text-zinc-600 font-mono tracking-widest">AUTHENTICATING...</p>
        </div>
      </div>
    );
  }

  const navLinks = navConfig[user.role] || [];
  const theme = roleTheme[user.role] || roleTheme['ADMIN'];
  const initials = user.email.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-surface text-slate-100 flex font-sans">
      {/* ═══ Sidebar ═══ */}
      <aside
        className={`${collapsed ? 'w-[68px]' : 'w-[240px]'} transition-all duration-300 ease-expo flex-shrink-0 flex flex-col relative z-20`}
        style={{
          background: 'linear-gradient(180deg, rgba(26,26,39,0.95) 0%, rgba(16,16,24,0.98) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Sidebar ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top left, ${theme.glow}, transparent 70%)` }} />

        {/* Logo area */}
        <div className={`relative z-10 flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-5'} h-16`}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', boxShadow: '0 2px 16px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
            <span className="text-[13px] font-black text-white">S</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-[12px] font-bold text-white tracking-tight leading-none">SGB Workflow</p>
              <p className="text-[9px] text-brand-400/80 tracking-widest uppercase font-semibold">Enterprise</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 relative z-10 overflow-y-auto">
          {!collapsed && (
            <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-[0.15em] px-3 py-2 mt-1">Workspace</p>
          )}
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} title={collapsed ? link.label : undefined}
                className={`flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative
                  ${isActive ? 'nav-link-active' : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'}`}
              >
                <Icon size={17} className={`flex-shrink-0 transition-colors duration-200 ${isActive ? 'text-brand-400' : 'text-zinc-600 group-hover:text-brand-400'}`} />
                {!collapsed && (
                  <>
                    <span>{link.label}</span>
                    {isActive && <ChevronRight size={13} className="ml-auto text-brand-400/50" />}
                  </>
                )}
              </Link>
            );
          })}
          
          {/* Sidebar Action Area (Dynamic) */}
          {!collapsed && sidebarActions && (
            <div className="mt-6 px-1.5 space-y-2.5 animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="h-px w-full bg-white/[0.04] mb-4" />
              {sidebarActions}
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="p-3 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs text-white"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-white truncate">{user.email}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wide ${theme.badge}`}>{theme.label}</span>
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); router.push('/login'); }}
            title={collapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-xl text-[12px] font-medium text-zinc-600 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200`}
          >
            <LogOut size={15} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-30"
          style={{ background: 'rgba(26,26,39,1)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
        >
          {collapsed ? <ChevronRight size={11} className="text-zinc-400" /> : <ChevronLeft size={11} className="text-zinc-400" />}
        </button>
      </aside>

      {/* ═══ Main content ═══ */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 px-7 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(13,13,20,0.9)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-bold text-white capitalize leading-none">{theme.label}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Workspace · {pathname.replace('/', '').replace('-', ' ') || 'Home'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LiveClock />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 tracking-wider">ONLINE</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-7">
          {children}
        </div>
      </main>
    </div>
  );
}
