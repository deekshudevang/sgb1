'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Package, Box, Truck, CheckCircle2, ArrowRight, AlertTriangle, Flame } from 'lucide-react';

interface StageData {
  id: string;
  label: string;
  count: number;
  icon: any;
  color: string;
  glow: string;
  borderColor: string;
  bgColor: string;
}

export default function WorkflowMap() {
  const [stages, setStages] = useState<StageData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const created = data.filter((o: any) => o.status === 'ORDER_CREATED').length;
        const packed = data.filter((o: any) => o.status === 'PACKED').length;
        const shipped = data.filter((o: any) => o.status === 'SHIPPED').length;
        setTotal(data.length);
        setStages([
          { id: 'created', label: 'Order Placed', count: created, icon: Package, color: 'text-blue-400', glow: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)', bgColor: 'rgba(59,130,246,0.06)' },
          { id: 'packed', label: 'Packaging', count: packed, icon: Box, color: 'text-amber-400', glow: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)', bgColor: 'rgba(245,158,11,0.06)' },
          { id: 'shipped', label: 'Shipped', count: shipped, icon: Truck, color: 'text-emerald-400', glow: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', bgColor: 'rgba(16,185,129,0.06)' },
          { id: 'delivered', label: 'Delivered', count: 0, icon: CheckCircle2, color: 'text-violet-400', glow: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.3)', bgColor: 'rgba(139,92,246,0.06)' },
        ]);
        setLoading(false);
      } catch (err) { console.error(err); }
    };
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const getBottleneck = () => {
    if (!stages.length) return null;
    const max = stages.reduce((a, b) => a.count > b.count ? a : b);
    return max.count > 5 ? max : null;
  };

  const bottleneck = getBottleneck();

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
            <h1 className="text-2xl font-black text-white tracking-tight">Live Workflow Map</h1>
          </div>
          <p className="text-sm text-zinc-500 ml-4">Real-time pipeline visualization · Auto-refreshes every 5s</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Bottleneck Alert */}
      {bottleneck && (
        <div className="glass-card p-4 mb-6 flex items-center gap-3 animate-fade-in-up" style={{ borderColor: 'rgba(245,158,11,0.3)', boxShadow: '0 0 30px rgba(245,158,11,0.08)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <AlertTriangle size={20} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-400">Bottleneck Detected</p>
            <p className="text-xs text-zinc-500"><span className="text-white font-semibold">{bottleneck.label}</span> stage has {bottleneck.count} orders queued — exceeds SLA threshold of 5</p>
          </div>
          <Flame size={20} className="text-amber-500 ml-auto animate-pulse" />
        </div>
      )}

      {/* Pipeline Visualization */}
      <div className="glass-card-lg p-8 mb-6 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Flow label */}
        <div className="relative z-10 flex items-center gap-2 mb-8">
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Order Lifecycle Flow</p>
          <div className="flex-1 h-px bg-white/[0.04]" />
          <p className="text-[10px] font-mono text-zinc-700">{total} orders total</p>
        </div>

        {/* Stage nodes connected by arrows */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const isBottleneck = bottleneck?.id === stage.id;
            return (
              <div key={stage.id} className="flex items-center gap-4 flex-1">
                {/* Node */}
                <div className={`flex-1 rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${isBottleneck ? 'scale-[1.02]' : ''}`}
                  style={{
                    background: stage.bgColor,
                    border: `1px solid ${stage.borderColor}`,
                    boxShadow: isBottleneck ? `0 0 40px ${stage.glow}, 0 0 0 1px ${stage.borderColor}` : `0 4px 20px rgba(0,0,0,0.3)`,
                  }}>
                  {/* Glow orb */}
                  <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${stage.glow}, transparent)` }} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stage.color}`}
                        style={{ background: stage.bgColor, borderColor: stage.borderColor }}>
                        <Icon size={20} />
                      </div>
                      {isBottleneck && (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">⚠ BOTTLENECK</span>
                      )}
                    </div>
                    <div className="text-[36px] font-black text-white leading-none mb-1">{stage.count}</div>
                    <div className="text-[11px] font-semibold text-zinc-400">{stage.label}</div>
                    {total > 0 && (
                      <div className="mt-3">
                        <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(stage.count / total) * 100}%`, background: stage.borderColor }} />
                        </div>
                        <p className="text-[9px] text-zinc-700 mt-1">{total > 0 ? Math.round((stage.count / total) * 100) : 0}% of pipeline</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow connector */}
                {i < stages.length - 1 && (
                  <div className="flex-shrink-0 flex items-center">
                    <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(99,102,241,0.3), rgba(255,255,255,0.08)' }} />
                    <ArrowRight size={14} className="text-brand-400/40 -ml-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Flow Rate Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-black text-white">{total > 0 ? Math.round((stages[2]?.count / total) * 100) : 0}%</p>
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mt-1">Fulfillment Rate</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-black text-white">{stages[0]?.count + stages[1]?.count || 0}</p>
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mt-1">In Progress</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-black text-white">{bottleneck ? '⚠️' : '✅'}</p>
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mt-1">{bottleneck ? 'Bottleneck Active' : 'Flow Healthy'}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
