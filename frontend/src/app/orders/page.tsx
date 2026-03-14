'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Package, Loader2, ArrowLeft, CheckCircle2, User, Phone, MapPin, ChevronDown, IndianRupee, Plus, Trash2, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PRODUCTS: Record<string, number> = {
  'SGB BC-520 Brush Cutter': 13000,
  'SGB Cycle Weeder': 3499,
  'SGB G45L Brush Cutter': 13000,
  'SGB Brush Cutter Trolley': 3999,
  'SGB Wheel Barrow': 6500,
  'SGB Carry Cart': 50000,
};

interface LineItem {
  product: string;
  qty: number;
}

export default function OrdersDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderId, setOrderId] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ product: '', qty: 1 }]);
  const [total, setTotal] = useState('');
  const [deposit, setDeposit] = useState('');
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const calculated = items.reduce((sum, item) => sum + (PRODUCTS[item.product] || 0) * (item.qty || 1), 0);
    if (calculated > 0 || total) setTotal(calculated.toString());
  }, [items]);

  const residual = (parseFloat(total || '0') - parseFloat(deposit || '0')).toFixed(2);

  const addItem = () => setItems([...items, { product: '', qty: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof LineItem, val: any) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [key]: val };
    setItems(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some(it => !it.product)) return;
    setLoading(true); setSuccess(false);
    const productDetails = items.map(it => `${it.qty}x ${it.product}`).join('\n');
    const notes = `Total: ₹${total || '0'} | Deposit: ₹${deposit || '0'} | Residual: ₹${residual}`;
    try {
      await api.post('/orders', {
        customer_name: customerName,
        phone_number: phone,
        delivery_address: address,
        product_details: `Order ID: ${orderId}\n${productDetails}\n---\n${notes}`,
      }, { headers: { Authorization: `Bearer ${user?.token}` } });
      setSuccess(true);
      setCustomerName(''); setPhone(''); setAddress(''); setOrderId('');
      setItems([{ product: '', qty: 1 }]); setTotal(''); setDeposit('');
      if (user?.role === 'ADMIN') setTimeout(() => router.push('/admin'), 1500);
      else if (user?.role === 'BILLING') setTimeout(() => router.push('/billing'), 1500);
      else setTimeout(() => setSuccess(false), 3000);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-wrap gap-4 justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-1.5 h-5 rounded-full bg-blue-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Create Fulfillment Order</h1>
          </div>
          <p className="text-sm text-zinc-500 ml-4">Spawn a new order directly into the Packaging team queue.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button onClick={() => router.push('/admin')} className="btn-ghost flex items-center gap-2">
            <ArrowLeft size={14} /> Back to Ledger
          </button>
        )}
        {user?.role === 'BILLING' && (
          <button onClick={() => router.push('/billing')} className="btn-ghost flex items-center gap-2">
            <ArrowLeft size={14} /> Back to Queue
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl animate-fade-in-up" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">Order spawned into Packaging queue!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

          {/* ── LEFT: Customer + Products (3 cols) ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Customer info card */}
            <div className="glass-card-lg p-6">
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }}>
                  <User size={18} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Customer Information</h2>
                  <p className="text-[10px] text-zinc-600">Shipping and contact details</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><Hash size={10} /> Order ID</label>
                  <input required type="text" placeholder="e.g. ORD-2026-001" value={orderId} onChange={e => setOrderId(e.target.value)} className="premium-input font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><User size={10} /> Name</label>
                  <input required type="text" placeholder="e.g. Arjun Mehta" value={customerName} onChange={e => setCustomerName(e.target.value)} className="premium-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><Phone size={10} /> Phone</label>
                  <input required type="tel" placeholder="+91 98200 XXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="premium-input" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={10} /> Delivery Address</label>
                <textarea required rows={2} placeholder="Full street address, city, PIN code..." value={address} onChange={e => setAddress(e.target.value)} className="premium-input resize-none" />
              </div>
            </div>

            {/* Product selection card */}
            <div className="glass-card-lg p-6">
              <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)' }}>
                    <Package size={18} className="text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Products</h2>
                    <p className="text-[10px] text-zinc-600">Select SGB products and quantities</p>
                  </div>
                </div>
                <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-violet-400 transition-all hover:bg-violet-500/10" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
                  <Plus size={12} /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    {/* Product dropdown */}
                    <div className="flex-1 relative">
                      <select value={item.product} onChange={e => updateItem(i, 'product', e.target.value)} required
                        className="premium-input appearance-none pr-10 cursor-pointer"
                        style={{ color: item.product ? 'white' : '#52525b' }}>
                        <option value="" disabled>Select a product...</option>
                        {Object.keys(PRODUCTS).map(p => <option key={p} value={p} style={{ background: '#18181b', color: 'white' }}>{p} (₹{PRODUCTS[p]})</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                    </div>

                    {/* Qty */}
                    <div className="w-20">
                      <input type="number" min={1} value={item.qty} onChange={e => updateItem(i, 'qty', parseInt(e.target.value) || 1)}
                        className="premium-input text-center text-[13px] font-bold" />
                    </div>

                    {/* Remove */}
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Selected summary */}
              {items.some(it => it.product) && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Order Summary</p>
                  <div className="space-y-1">
                    {items.filter(it => it.product).map((it, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">{it.product}</span>
                        <span className="text-white font-bold">×{it.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Billing (2 cols) ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card-lg p-6 lg:sticky lg:top-6">
              <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
                  <IndianRupee size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Amount</h2>
                  <p className="text-[10px] text-zinc-600">Payment breakdown</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Total */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm font-bold">₹</span>
                    <input required type="number" min={0} step="0.01" placeholder="0.00" value={total} onChange={e => setTotal(e.target.value)}
                      className="premium-input pl-8 text-lg font-black text-white" />
                  </div>
                </div>

                {/* Deposit */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Deposit Received (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm font-bold">₹</span>
                    <input required type="number" min={0} step="0.01" placeholder="0.00" value={deposit} onChange={e => setDeposit(e.target.value)}
                      className="premium-input pl-8 text-lg font-black text-emerald-400" />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

                {/* Residual */}
                <div className="p-4 rounded-xl" style={{ background: parseFloat(residual) > 0 ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)', border: `1px solid ${parseFloat(residual) > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'}` }}>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Residual Amount</p>
                  <p className={`text-3xl font-black leading-none ${parseFloat(residual) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    ₹{residual}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-1">Total − Deposit = Residual</p>
                </div>
              </div>

              {/* Submit */}
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <button type="submit" disabled={loading}
                  className="btn-brand w-full flex items-center justify-center gap-2.5 py-4 text-[13px]">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                  <span>{loading ? 'Creating...' : 'Spawn Order to Queue'}</span>
                </button>
                <p className="text-[10px] text-zinc-700 text-center mt-3">Order will be sent to the Packaging team automatically.</p>
              </div>
            </div>
          </div>

        </div>
      </form>
    </DashboardLayout>
  );
}
