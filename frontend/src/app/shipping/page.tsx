'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Truck, SendHorizonal, PackageCheck, Loader2, Clock, CheckCircle2, CircleCheckBig } from 'lucide-react';

export default function ShippingDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [shipping, setShipping] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, { courier_name: string; tracking_id: string }>>({});
  const { user } = useAuthStore();

  // ── Fetch orders ──
  const fetchOrders = async () => {
    const { data } = await axios.get('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${user?.token}` } });
    setOrders(data);
    const init: any = {};
    data.forEach((o: any) => { init[o._id] = { courier_name: '', tracking_id: '' }; });
    setForms(init);
  };
  useEffect(() => { if (user) fetchOrders(); }, [user]);

  const markShipped = async (id: string) => {
    const f = forms[id];
    if (!f?.courier_name || !f?.tracking_id) return;
    setShipping(id);
    try { 
      // Aligned with New Unified Shipping API
      await axios.post(`http://localhost:5000/api/shipping/ship`, {
        orderId: id,
        courier: f.courier_name,
        trackingId: f.tracking_id
      }, { headers: { Authorization: `Bearer ${user?.token}` } }); 
      await fetchOrders(); 
    }
    finally { setShipping(null); }
  };

  const handleManualWhatsApp = (order: any) => {
    const f = forms[order._id];
    const message = `Hello ${order.customer_name},\n\nYour order from SGB Agro Industries has been shipped.\n\nCourier: ${f.courier_name || 'Dispatch'}\nTracking ID: ${f.tracking_id || 'N/A'}\n\nThank you!`;
    const encoded = encodeURIComponent(message);
    const phone = order.phone_number.replace(/\D/g, ''); // strip for URL
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  const [delivering, setDelivering] = useState<string | null>(null);
  const markDelivered = async (id: string) => {
    setDelivering(id);
    try { await axios.put(`http://localhost:5000/api/orders/${id}/deliver`, {}, { headers: { Authorization: `Bearer ${user?.token}` } }); await fetchOrders(); }
    finally { setDelivering(null); }
  };

  const pendingOrders = orders.filter(o => o.status === 'PACKED');
  const dispatchedOrders = orders.filter(o => o.status === 'SHIPPED');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

  const sidebarActions = (
    <>
      <button 
        onClick={() => {
          const el = document.getElementById('pending-dispatch');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-[0.15em] hover:bg-amber-500/20 transition-all shadow-lg shadow-amber-500/5 group"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
        <span className="flex-1 text-left">Access Dispatch</span>
        <span className="bg-amber-500/20 px-2 py-0.5 rounded-md font-mono text-[9px] text-amber-400/80 border border-amber-500/10">{pendingOrders.length}</span>
      </button>
      
      <button 
        onClick={() => {
          const el = document.getElementById('operational-workspace');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-[0.15em] hover:bg-indigo-500/20 transition-all shadow-lg shadow-indigo-500/5 group"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
        <span className="flex-1 text-left">Live Workshop</span>
      </button>
    </>
  );

  return (
    <DashboardLayout sidebarActions={sidebarActions}>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-10 animate-fade-in-up">
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-1.5 h-5 rounded-full bg-rose-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Shipping Deck</h1>
          </div>
          <p className="text-sm text-zinc-500">Order dispatch & delivery management</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 text-center">
            <div className="text-lg font-black text-amber-400 leading-none">{pendingOrders.length}</div>
            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Pending</div>
          </div>
          <div className="glass-card px-4 py-2 text-center">
            <div className="text-lg font-black text-orange-400 leading-none">{dispatchedOrders.length}</div>
            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">In Transit</div>
          </div>
          <div className="glass-card px-4 py-2 text-center">
            <div className="text-lg font-black text-violet-400 leading-none">{deliveredOrders.length}</div>
            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Delivered</div>
          </div>
        </div>
      </div>

      {/* ══════ OPERATIONAL WORKSPACE ══════ */}
      <div id="operational-workspace" className="mb-10 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Truck size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wider">In Transit Workspace</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active Delivery Tracking</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400">
            {dispatchedOrders.length} ORDERS LIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dispatchedOrders.map(order => (
            <div key={order._id} className="glass-card p-5 relative group transition-all duration-300 hover:border-indigo-500/30">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{order.customer_name}</h3>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{order.tracking_id}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">{order.courier_name}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
              
              <div className="h-px w-full bg-white/5 mb-4" />
              
              <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase">Destination</span>
                  <span className="text-[11px] text-zinc-400 truncate max-w-[120px]">{order.delivery_address}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-zinc-600 uppercase">Dispatch Date</span>
                  <span className="text-[11px] text-zinc-400">{new Date(order.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button onClick={() => markDelivered(order._id)} disabled={delivering === order._id}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black text-white uppercase tracking-widest transition-all duration-300 relative overflow-hidden group/btn"
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', boxShadow: '0 4px 15px rgba(16,185,129,0.2)' }}>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                  {delivering === order._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {delivering === order._id ? 'Verifying...' : 'Complete Delivery'}
                </button>
              </div>
            </div>
          ))}
          {dispatchedOrders.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-2xl">
              <Truck size={32} className="text-zinc-800 mb-2" />
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">Zero Live Shipments</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════ PENDING DISPATCH ══════ */}
      <div id="pending-dispatch" className="mb-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-4 rounded-full bg-amber-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Pending Dispatch</h2>
          <span className="text-[10px] font-bold text-zinc-600 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06]">{pendingOrders.length}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {pendingOrders.map(order => {
            const form = forms[order._id] || { courier_name: '', tracking_id: '' };
            const isReady = form.courier_name.trim() && form.tracking_id.trim();
            return (
              <div key={order._id} className="glass-card p-6 flex flex-col transition-all duration-300 hover:translate-y-[-2px] group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'radial-gradient(circle at top right, rgba(244,63,94,0.06), transparent)' }} />
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.2)' }}>
                      <PackageCheck size={18} className="text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-none">{order.customer_name}</h3>
                      <span className="text-[10px] text-zinc-600 flex items-center gap-1 mt-1"><Clock size={9} /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                  <span className="badge badge-packed">PACKED</span>
                </div>
                <div className="mb-4 relative z-10 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mb-1">Deliver To</p>
                  <p className="text-[11px] text-zinc-400">{order.delivery_address}</p>
                  <p className="text-[11px] text-zinc-600 font-mono mt-0.5">{order.phone_number}</p>
                </div>
                <div className="mb-5 relative z-10 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mb-1">Items</p>
                  <p className="text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed">{order.product_details}</p>
                </div>
                <div className="space-y-3 relative z-10 mt-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Courier</label>
                      <input type="text" placeholder="e.g. BlueDart" value={form.courier_name} onChange={e => setForms({ ...forms, [order._id]: { ...form, courier_name: e.target.value } })} className="premium-input text-[12px] py-2.5" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-1.5">Tracking ID</label>
                      <input type="text" placeholder="BD-XXXX-YYY" value={form.tracking_id} onChange={e => setForms({ ...forms, [order._id]: { ...form, tracking_id: e.target.value } })} className="premium-input text-[12px] py-2.5 font-mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => markShipped(order._id)} disabled={!isReady || shipping === order._id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: isReady ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'rgba(244,63,94,0.15)', boxShadow: isReady ? '0 4px 20px rgba(244,63,94,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none' }}>
                      {shipping === order._id ? <Loader2 size={15} className="animate-spin" /> : <SendHorizonal size={15} />}
                      {shipping === order._id ? 'Dispatching...' : 'Dispatch & Notify'}
                    </button>
                    <button onClick={() => handleManualWhatsApp(order)}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[12px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all"
                      title="Send manually via WhatsApp Web/App if automated fails">
                      <SendHorizonal size={15} className="rotate-[-45deg]" />
                      Manual
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {pendingOrders.length === 0 && (
            <div className="col-span-full py-16 glass-card flex flex-col items-center text-center" style={{ borderStyle: 'dashed' }}>
              <CheckCircle2 size={32} className="text-emerald-500 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">All Clear!</h3>
              <p className="text-xs text-zinc-600">No packed orders waiting for dispatch.</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════ COMPLETED DELIVERIES ══════ */}
      <div>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-4 rounded-full bg-violet-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Completed Deliveries</h2>
          <span className="text-[10px] font-bold text-zinc-600 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06]">{deliveredOrders.length}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {deliveredOrders.slice(0, 8).map(order => (
            <div key={order._id} className="glass-card p-4 flex flex-col gap-2 border-violet-500/10">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-white truncate max-w-[120px]">{order.customer_name}</span>
                <CheckCircle2 size={12} className="text-violet-400" />
              </div>
              <p className="text-[9px] text-zinc-600 font-mono truncate">{order.tracking_id}</p>
              <span className="text-[8px] font-black text-violet-500/50 uppercase tracking-widest">Successful Delivery</span>
            </div>
          ))}
          {deliveredOrders.length === 0 && (
            <div className="col-span-full py-8 text-center border border-dashed border-white/5 rounded-2xl">
              <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">History Empty</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
