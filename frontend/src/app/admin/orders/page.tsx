'use client';

import React, { useEffect, useState } from 'react';
import { Search, Eye, Edit, X, ShieldAlert, CheckCircle, Package } from 'lucide-react';
import api from '../../../services/api';

interface OrderItem {
  id: number;
  watch: { name: string; brand: string; price: number };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  payment_method: string;
  created_at: string;
  user_name: string;
  user_email: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Order inspection
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  
  // Status editing state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      let url = '/admin/orders';
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) params.push(`status=${encodeURIComponent(statusFilter)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await api.get(url);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to pull order logs.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleOpenEditStatus = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.payment_status);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setStatusSubmitting(true);
    try {
      await api.put(`/admin/orders/${editingOrder.id}`, {
        status: newStatus,
        payment_status: newPaymentStatus
      });
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status.');
    } finally {
      setStatusSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-zinc-950">
      
      <div>
        <h1 className="text-2xl font-light tracking-widest font-luxury uppercase text-zinc-900">Order Registry</h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest pt-1">Inspect transactions & update shipment stages</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center relative max-w-sm w-full">
          <input 
            type="text" 
            placeholder="Search order ref or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-zinc-200 focus:border-primary/50 text-zinc-900 rounded pl-4 pr-10 py-2.5 outline-none"
          />
          <Search className="w-4 h-4 absolute right-3 text-zinc-500" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-zinc-200 text-zinc-800 focus:border-primary/50 rounded py-2.5 px-3 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center animate-pulse text-xs text-zinc-400 uppercase tracking-widest">
          Loading acquisition logs...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 border border-zinc-200 bg-white text-center text-xs text-zinc-500 rounded shadow-sm">
          No orders registered in system.
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-500 uppercase tracking-wider text-[10px]">
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Shipment</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50/50">
                  <td className="p-4 font-semibold text-primary">{o.order_number}</td>
                  <td className="p-4">
                    <p className="font-semibold text-zinc-800">{o.user_name}</p>
                    <p className="text-[10px] text-zinc-500">{o.user_email}</p>
                  </td>
                  <td className="p-4">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-mono font-semibold text-zinc-900">₹{o.total_amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      o.status === 'Delivered' ? 'bg-primary/10 text-primary' : 
                      o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-zinc-100 text-zinc-800'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      o.payment_status === 'Paid' ? 'text-emerald-700 bg-emerald-50' : 
                      o.payment_status === 'Awaiting Verification' ? 'text-amber-600 bg-amber-50 border border-amber-100 animate-pulse' : 'text-zinc-600 bg-zinc-100'
                    }`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setInspectingOrder(o)}
                      className="p-1.5 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded"
                      title="Inspect Items"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditStatus(o)}
                      className="p-1.5 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded"
                      title="Edit Status"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== INSPECT MODAL ==================== */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setInspectingOrder(null)} />
          
          <div className="bg-white border border-zinc-200 w-full max-w-xl rounded-lg shadow-2xl z-10 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-800">Acquisition Details</h3>
                <p className="text-[10px] text-primary uppercase font-bold">{inspectingOrder.order_number}</p>
              </div>
              <button onClick={() => setInspectingOrder(null)} className="p-1 text-zinc-400 hover:text-zinc-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-600">
              
              {/* Shipping info */}
              <div className="grid grid-cols-2 gap-4 border-b border-zinc-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Courier Address</span>
                  <p className="text-zinc-800">{inspectingOrder.shipping_address}</p>
                  <p>{inspectingOrder.city}, {inspectingOrder.state}, {inspectingOrder.postal_code}</p>
                  <p>{inspectingOrder.country}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Transaction Summary</span>
                  <p>Method: <span className="text-zinc-800">{inspectingOrder.payment_method}</span></p>
                  <p>Settlement: <span className="font-semibold text-emerald-700">{inspectingOrder.payment_status}</span></p>
                  <p>Date: <span>{new Date(inspectingOrder.created_at).toLocaleString()}</span></p>
                </div>
              </div>

              {/* Items list */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Acquired timepieces</span>
                {inspectingOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-none">
                    <div>
                      <p className="font-semibold text-zinc-800">{item.watch.name}</p>
                      <p className="text-[10px] text-zinc-500">{item.watch.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-zinc-800">₹{item.price.toLocaleString()}</p>
                      <p className="text-[10px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2 text-sm font-semibold border-t border-zinc-100">
                <span>Grand Total</span>
                <span className="text-primary font-mono">₹{inspectingOrder.total_amount.toLocaleString()}</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT STATUS MODAL ==================== */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingOrder(null)} />
          
          <div className="bg-white border border-zinc-200 w-full max-w-sm rounded-lg shadow-2xl z-10">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-800">Edit Order Status</h3>
              <button onClick={() => setEditingOrder(null)} className="p-1 text-zinc-400 hover:text-zinc-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="p-6 space-y-4 text-xs text-zinc-600">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider">Shipment Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 rounded px-3 py-2 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 rounded px-3 py-2 outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Awaiting Verification">Awaiting Verification</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusSubmitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
