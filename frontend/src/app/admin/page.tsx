'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Package, Download, Boxes, Truck, Clock, Search, TrendingUp, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    axios.get('http://localhost:5000/api/orders', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(r => { setOrders(r.data); setFiltered(r.data); });
  }, [user]);

  useEffect(() => {
    let r = orders;
    if (statusFilter !== 'ALL') r = r.filter(o => o.status === statusFilter);
    if (search) r = r.filter(o =>
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone_number?.includes(search) || o._id?.includes(search)
    );
    if (selectedDate) {
      r = r.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === selectedDate;
      });
    }
    r = [...r].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFiltered(r);
  }, [search, statusFilter, orders, selectedDate]);

  const handleExport = async () => {
    const r = await axios.get('http://localhost:5000/api/orders/export/csv', {
      headers: { Authorization: `Bearer ${user?.token}` }, responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement('a');
    a.href = url; a.setAttribute('download', 'orders_export.csv');
    document.body.appendChild(a); a.click(); a.remove();
  };

  const total = orders.length;
  const created = orders.filter(o => o.status === 'ORDER_CREATED').length;
  const packed = orders.filter(o => o.status === 'PACKED').length;
  const shipped = orders.filter(o => o.status === 'SHIPPED').length;
  const delivered = orders.filter(o => o.status === 'DELIVERED').length;

  const kpis = [
    { l: 'Total Orders', v: total, icon: Boxes, c: 'text-brand-400', bg: 'bg-brand-500/8 border-brand-500/15', g: '#6366f1' },
    { l: 'Pending', v: created, icon: Package, c: 'text-blue-400', bg: 'bg-blue-500/8 border-blue-500/15', g: '#3b82f6' },
    { l: 'In Transit', v: shipped, icon: Truck, c: 'text-orange-400', bg: 'bg-orange-500/8 border-orange-500/15', g: '#fb923c' },
    { l: 'Delivered', v: delivered, icon: Clock, c: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/15', g: '#10b981' },
  ];

  const getStatusBadge = (s: string) => {
    if (s === 'ORDER_CREATED') return <span className="badge badge-created"><span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />Created</span>;
    if (s === 'PACKED') return <span className="badge badge-packed"><span className="w-1 h-1 rounded-full bg-amber-400" />Packed</span>;
    if (s === 'SHIPPED') return <span className="badge badge-shipped"><span className="w-1 h-1 rounded-full bg-orange-400" />In Transit</span>;
    if (s === 'DELIVERED') return <span className="badge badge-shipped" style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.2)', backgroundColor: 'rgba(16,185,129,0.05)' }}><span className="w-1 h-1 rounded-full bg-emerald-400" />Delivered</span>;
  };

  const filters = ['ALL', 'ORDER_CREATED', 'PACKED', 'SHIPPED', 'DELIVERED'];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-1.5 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, #6366f1, #7c3aed)' }} />
            <h1 className="text-2xl font-black text-white tracking-tight">Control Panel</h1>
          </div>
          <p className="text-sm text-zinc-500 ml-4">Real-time order lifecycle · All departments</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={handleExport} className="btn-ghost flex items-center gap-2">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => router.push('/orders')} className="btn-brand flex items-center gap-2">
            <Package size={14} /> <span>New Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={k.l} className={`kpi-card noise border ${k.bg}`} style={{ animationDelay: `${i * 0.07}s` }}>
              {/* Glow orb */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${k.g}, transparent)`, filter: 'blur(12px)' }} />
              <Icon size={18} className={k.c + ' mb-4 relative z-10'} />
              <div className="text-[32px] font-black text-white leading-none mb-1 relative z-10">{k.v}</div>
              <div className="text-[11px] font-semibold text-zinc-500 relative z-10">{k.l}</div>
            </div>
          );
        })}
      </div>

      {/* Pipeline bar */}
      {total > 0 && (
        <div className="glass-card p-4 mb-6">
          <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2.5">
            <span className="flex items-center gap-1.5"><Circle size={8} className="text-blue-400 fill-blue-400" />Created ({created})</span>
            <span className="flex items-center gap-1.5"><Circle size={8} className="text-amber-400 fill-amber-400" />Packed ({packed})</span>
            <span className="flex items-center gap-1.5"><Circle size={8} className="text-orange-400 fill-orange-400" />In Transit ({shipped})</span>
            <span className="flex items-center gap-1.5"><Circle size={8} className="text-emerald-400 fill-emerald-400" />Delivered ({delivered})</span>
          </div>
          <div className="flex h-1.5 rounded-full gap-px bg-white/[0.05] overflow-hidden">
            {created > 0 && <div className="h-full rounded-l-full transition-all" style={{ width: `${(created/total)*100}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />}
            {packed > 0 && <div className="h-full transition-all" style={{ width: `${(packed/total)*100}%`, background: '#f59e0b' }} />}
            {shipped > 0 && <div className="h-full transition-all" style={{ width: `${(shipped/total)*100}%`, background: '#fb923c' }} />}
            {delivered > 0 && <div className="h-full rounded-r-full transition-all" style={{ width: `${(delivered/total)*100}%`, background: 'linear-gradient(90deg, #10b981, #059669)' }} />}
          </div>
        </div>
      )}

      {/* Pending Delivery (In Transit) Section - Moved to Workspace */}
      {shipped > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-4 rounded-full bg-orange-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Pending Delivery (In Transit)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orders.filter(o => o.status === 'SHIPPED').slice(0, 3).map(order => (
              <div key={order._id} className="glass-card p-4 border-orange-500/10 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-white">{order.customer_name}</p>
                    <p className="text-[9px] text-zinc-500 font-mono italic">{order.tracking_id}</p>
                  </div>
                  <Truck size={14} className="text-orange-400" />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-zinc-600 uppercase tracking-tighter font-bold">{order.courier_name}</span>
                  <span className="text-orange-400 font-bold flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />
                    IN TRANSIT
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {/* Table filters */}
        <div className="px-5 py-4 flex flex-wrap gap-3 items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input type="text" placeholder="Search customer, phone, ID..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/6 rounded-lg pl-9 pr-4 py-2 text-[13px] text-white outline-none focus:border-brand-500/40 placeholder:text-zinc-700 transition-all"
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }} />
          </div>
          <div className="flex gap-1.5">
            {filters.map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-200 border ${
                  statusFilter === f
                    ? 'bg-brand-500/10 text-brand-400 border-brand-500/25 shadow-glow-brand'
                    : 'text-zinc-600 border-transparent hover:border-white/8 hover:text-zinc-400'
                }`}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-2">
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-black/40 border border-white/6 rounded-lg px-3 py-1.5 text-[11px] font-mono text-zinc-300 outline-none focus:border-brand-500/40 transition-all cursor-pointer"
              style={{ colorScheme: 'dark' }}
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="w-5 h-5 flex items-center justify-center rounded-full bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors text-xs ml-1">
                ✕
              </button>
            )}
          </div>
        </div>

        <table className="w-full text-[13px] text-left">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)' }}>
              {['Customer & Product', 'Contact', 'Status', 'Logistics', 'Date'].map(h => (
                <th key={h} className="px-6 py-3.5 text-[9px] font-bold text-zinc-600 uppercase tracking-[0.12em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, i) => (
              <tr key={order._id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.025)' }}>
                <td className="px-6 py-4">
                  <div className="font-semibold text-white text-[13px] truncate max-w-[180px]">{order.customer_name}</div>
                  <div className="text-[11px] text-zinc-600 mt-0.5 max-w-[200px] truncate">{order.product_details?.split('\n')[0]}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-zinc-400 text-[12px] font-mono">{order.phone_number}</div>
                  <div className="text-[11px] text-zinc-700 mt-0.5 max-w-[180px] truncate">{order.delivery_address}</div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                <td className="px-6 py-4">
                  {order.status === 'SHIPPED' || order.status === 'DELIVERED' ? (
                    <div>
                      <div className="text-zinc-300 text-[11px] font-semibold">{order.courier_name}</div>
                      <div className="text-zinc-600 text-[11px] font-mono mt-0.5">{order.tracking_id}</div>
                    </div>
                  ) : <span className="text-zinc-800 text-xs">—</span>}
                </td>
                <td className="px-6 py-4 text-zinc-600 text-[11px]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center mb-4">
              <Search size={24} className="text-zinc-700" />
            </div>
            <p className="text-sm font-semibold text-white">No orders found</p>
            <p className="text-xs text-zinc-600 mt-1">Try adjusting the filter or search query.</p>
          </div>
        )}

        <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
          <p className="text-[11px] text-zinc-700">Showing <span className="text-zinc-400 font-semibold">{filtered.length}</span> of <span className="text-zinc-400 font-semibold">{total}</span></p>
          <p className="text-[10px] text-zinc-800 font-mono">{new Date().toLocaleTimeString('en-IN')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
