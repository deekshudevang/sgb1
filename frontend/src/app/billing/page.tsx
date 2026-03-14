'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { CreditCard, FileText, ArrowRight, Loader2, Clock, AlertCircle } from 'lucide-react';

export default function BillingDashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setOrders(data);
    } catch (err) { 
      console.error(err);
    }
  };

  useEffect(() => { if (user) fetchOrders(); }, [user]);

  const handleProcessBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setLoading(true);

    try {
      // 1. Update billing details
      await api.put(`/orders/${selectedOrder._id}/billing`, {
        invoice_id: invoiceId,
        notes: notes
      }, { headers: { Authorization: `Bearer ${user?.token}` } });

      // 2. Advance State Machine to BILLING_COMPLETED
      await api.put(`/orders/${selectedOrder._id}/advance`, {
        target_status: 'BILLING_COMPLETED'
      }, { headers: { Authorization: `Bearer ${user?.token}` } });

      setSelectedOrder(null);
      setInvoiceId('');
      setNotes('');
      fetchOrders();
    } catch (err) { 
       console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">Billing & Invoicing Queue</h1>
        <p className="text-sm text-zinc-400">Process pending orders, attach invoices, and confirm payments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order: any) => (
          <div key={order._id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-violet-500/30 hover:bg-zinc-900/60 transition-all group shadow-xl">
            <div className="flex justify-between items-start mb-5">
               <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
                 <CreditCard size={24} />
               </div>
               <div className="flex items-center gap-2">
                 {order.product_details?.match(/Order ID:\s*(\S+)/)?.[1] && (
                   <span className="px-2 py-1 rounded-md text-[10px] font-bold tracking-wider font-mono border bg-blue-500/10 text-blue-400 border-blue-500/20">
                     {order.product_details.match(/Order ID:\s*(\S+)/)[1]}
                   </span>
                 )}
                 <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20">
                   {order.status.replace(/_/g, ' ')}
                 </span>
               </div>
            </div>
            
            <h3 className="text-xl font-medium text-white mb-1.5 truncate">{order.customer_name}</h3>
            {order.notes?.includes('[PRIORITY ESCALATED]') && (
               <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md mb-2 w-fit">
                 <AlertCircle size={12} /> SLA Breached - Priority Escalated
               </div>
            )}
            <p className="text-sm text-zinc-400 line-clamp-2 mb-6 h-10">{order.product_details}</p>
            
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500"><Clock size={14} className="text-zinc-600" /> {new Date(order.createdAt).toLocaleDateString()}</span>
              <button 
                onClick={() => setSelectedOrder(order)}
                className="text-xs font-medium bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                Process Payment <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
             <FileText size={48} className="text-zinc-600 mb-4" />
             <h3 className="text-lg font-medium text-white mb-1">No Orders in Queue</h3>
             <p className="text-sm text-zinc-500 max-w-sm">There are currently no orders waiting for billing processing.</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-2">Process Billing</h2>
            <p className="text-sm text-zinc-400 mb-6">Order for <span className="text-white font-medium">{selectedOrder.customer_name}</span></p>
            
            <form onSubmit={handleProcessBilling} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1.5">Invoice ID / Transaction Ref</label>
                <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-600" placeholder="e.g. INV-2026-8921" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-1.5">Billing Notes (Optional)</label>
                <textarea rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all placeholder:text-zinc-600 resize-none" placeholder="Add any payment verifications notes..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg mt-2">
                 <p className="text-xs text-amber-500 font-medium">Clicking Confirm will advance this order to the Shipping Department automatically.</p>
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-white/5">
                <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium shadow-lg shadow-violet-500/20 transition-all flex items-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Confirm Payment & Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
