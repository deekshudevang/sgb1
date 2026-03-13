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

  return (
    <DashboardLayout>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-1.5 h-5 rounded-full bg-rose-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Shipping Deck</h1>
          </div>
          <p className="text-sm text-zinc-500 ml-4">Order dispatch & delivery management</p>
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

      {/* ══════ PENDING DISPATCH ══════ */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-4 rounded-full bg-amber-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Pending Dispatch</h2>
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

      {/* ══════ PENDING DELIVERY (in transit) ══════ */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-4 rounded-full bg-orange-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Pending Delivery</h2>
          <span className="text-[10px] font-bold text-zinc-600 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06]">{dispatchedOrders.length}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {dispatchedOrders.map(order => (
            <div key={order._id} className="glass-card p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-1px]" style={{ borderColor: 'rgba(251,146,60,0.15)' }}>
              <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(251,146,60,0.06), transparent)' }} />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
                    <Truck size={16} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-white leading-none">{order.customer_name}</h3>
                    <span className="text-[10px] text-zinc-600 flex items-center gap-1 mt-1"><Clock size={9} /> {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)', color: '#fb923c' }}><span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />In Transit</span>
              </div>
              <div className="space-y-2 relative z-10 mb-4">
                <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Courier</span>
                  <span className="text-[11px] font-semibold text-white">{order.courier_name}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Tracking</span>
                  <span className="text-[11px] font-semibold text-orange-400 font-mono">{order.tracking_id}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Address</span>
                  <span className="text-[11px] text-zinc-400 text-right max-w-[60%]">{order.delivery_address}</span>
                </div>
              </div>
              <button onClick={() => markDelivered(order._id)} disabled={delivering === order._id}
                className="w-full relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 20px rgba(22,163,74,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
                {delivering === order._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {delivering === order._id ? 'Confirming...' : 'Mark as Delivered'}
              </button>
            </div>
          ))}
          {dispatchedOrders.length === 0 && (
            <div className="col-span-full py-12 glass-card flex flex-col items-center text-center" style={{ borderStyle: 'dashed' }}>
              <Truck size={24} className="text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-600">No orders in transit.</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════ DELIVERED ══════ */}
      <div className="mt-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-4 rounded-full bg-violet-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Delivered</h2>
          <span className="text-[10px] font-bold text-zinc-600 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06]">{deliveredOrders.length}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {deliveredOrders.map(order => (
            <div key={order._id} className="glass-card p-5 relative overflow-hidden transition-all duration-300 hover:translate-y-[-1px]" style={{ borderColor: 'rgba(139,92,246,0.15)' }}>
              <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none" style={{ background: 'radial-gradient(circle at top right, rgba(139,92,246,0.06), transparent)' }} />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <CircleCheckBig size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-white leading-none">{order.customer_name}</h3>
                    <span className="text-[10px] text-zinc-600 flex items-center gap-1 mt-1"><Clock size={9} /> {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}><span className="w-1 h-1 rounded-full bg-violet-400" />Delivered</span>
              </div>
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Courier</span>
                  <span className="text-[11px] font-semibold text-white">{order.courier_name}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Tracking</span>
                  <span className="text-[11px] font-semibold text-violet-400 font-mono">{order.tracking_id}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-violet-400 relative z-10">
                <CircleCheckBig size={11} />
                <span className="font-semibold">Delivery confirmed</span>
              </div>
            </div>
          ))}
          {deliveredOrders.length === 0 && (
            <div className="col-span-full py-12 glass-card flex flex-col items-center text-center" style={{ borderStyle: 'dashed' }}>
              <CircleCheckBig size={24} className="text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-600">No delivered orders yet.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
