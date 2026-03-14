'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Box, CheckCircle2, Clock, AlertTriangle, Flame } from 'lucide-react';

function daysAgo(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 86400000); }

export default function PackagingDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [packing, setPacking] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetch = async () => {
    const { data } = await api.get('/orders', { headers: { Authorization: `Bearer ${user?.token}` } });
    setOrders(data);
  };

  useEffect(() => { if (user) fetch(); }, [user]);

  const markPacked = async (id: string) => {
    setPacking(id);
    try {
      await api.put(`/orders/${id}/pack`, {}, { headers: { Authorization: `Bearer ${user?.token}` } });
      await fetch();
    } finally { setPacking(null); }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-1.5 h-5 rounded-full bg-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Packaging Station</h1>
          </div>
          <p className="text-sm text-zinc-500 ml-4">Pick, verify, and pack all queued orders.</p>
        </div>
        <div className="glass-card px-5 py-3 text-center">
          <div className="text-2xl font-black text-white leading-none">{orders.length}</div>
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">In Queue</div>
        </div>
      </div>

      {/* Progress bar */}
      {orders.length > 0 && (
        <div className="glass-card p-4 mb-6 flex items-center gap-4">
          <div className="flex-1 bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(orders.length * 8, 100)}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
          </div>
          <span className="text-[10px] font-semibold text-zinc-600 flex-shrink-0">{orders.length} orders pending</span>
        </div>
      )}

      {/* Order cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {orders.map(order => {
          const age = daysAgo(order.createdAt);
          const isOverdue = age >= 5;
          const isUrgent = age >= 2 && !isOverdue;
          const borderColor = isOverdue ? 'rgba(239,68,68,0.25)' : isUrgent ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)';
          const glowColor = isOverdue ? 'rgba(239,68,68,0.1)' : isUrgent ? 'rgba(245,158,11,0.08)' : 'transparent';

          return (
            <div key={order._id} className="glass-card p-5 flex flex-col transition-all duration-300 hover:translate-y-[-2px] group relative overflow-hidden"
              style={{ borderColor, boxShadow: `0 0 30px ${glowColor}, 0 1px 3px rgba(0,0,0,0.6)` }}>

              {/* Card glow */}
              {(isOverdue || isUrgent) && (
                <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${isOverdue ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)'}, transparent)` }} />
              )}

              {/* Card header */}
              <div className="flex justify-between items-start mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border relative z-10 ${isOverdue ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/8 border-amber-500/15'}`}>
                  {isOverdue ? <Flame size={20} className="text-red-400" /> : isUrgent ? <AlertTriangle size={20} className="text-amber-400" /> : <Box size={20} className="text-amber-400" />}
                </div>
                <div className="flex flex-col items-end gap-1.5 relative z-10">
                  {isOverdue && <span className="badge" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}><Flame size={9} fill="currentColor" />OVERDUE</span>}
                  {isUrgent && <span className="badge badge-packed"><AlertTriangle size={9} />URGENT</span>}
                  {!isUrgent && !isOverdue && <span className="badge badge-created"><Box size={9} />QUEUED</span>}
                </div>
              </div>

              <h3 className="text-base font-bold text-white mb-1 truncate relative z-10">{order.customer_name}</h3>
              <p className="text-[11px] text-zinc-600 mb-4 relative z-10 font-mono truncate">{order.phone_number}</p>

              {/* Items */}
              <div className="flex-1 mb-5 relative z-10"
                style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mb-2">Items to Pack</p>
                <p className="text-[12px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{order.product_details}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 relative z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="flex items-center gap-1.5 text-[11px] text-zinc-700">
                  <Clock size={11} />
                  {age === 0 ? 'Today' : `${age}d ago`}
                </span>
                <button onClick={() => markPacked(order._id)} disabled={packing === order._id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold text-zinc-900 transition-all duration-200 active:scale-95 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}>
                  <CheckCircle2 size={13} />
                  {packing === order._id ? 'Packing...' : 'Mark Packed'}
                </button>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="col-span-full py-24 glass-card flex flex-col items-center text-center" style={{ borderStyle: 'dashed' }}>
            <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center mb-4 border-amber-500/15"
              style={{ background: 'rgba(245,158,11,0.06)' }}>
              <Box size={24} className="text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Queue Empty</h3>
            <p className="text-sm text-zinc-600">No orders pending packaging. Well done!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
