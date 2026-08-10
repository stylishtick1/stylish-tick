'use client';

import React, { useEffect, useState } from 'react';
import { Search, Eye, Edit, X, ShieldAlert, CheckCircle, Package, User, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import api from '../../../services/api';

interface ProductInfo {
  id?: string;
  name: string;
  brand: string;
  price: number;
  description?: string;
  category?: string;
  images?: Array<{ image_url: string; image_type?: string }>;
}

interface OrderItem {
  id: number;
  product?: ProductInfo;
  watch?: ProductInfo;
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
  user_phone?: string;
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
    
    // Check if transitioning to Paid and ask for confirmation
    if (editingOrder.payment_status !== 'Paid' && newPaymentStatus === 'Paid') {
      const isConfirmed = window.confirm(
        `Are you sure you want to mark Order #${editingOrder.order_number} as PAID?\n\nThis will update the order status and immediately trigger a transactional payment receipt email to the customer (${editingOrder.user_email}).`
      );
      if (!isConfirmed) {
        return;
      }
    }

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

  const getItemVisual = (item: OrderItem) => {
    const info = item.product || item.watch;
    const imgUrl = info?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=200';
    const name = info?.name || 'Product';
    const brand = info?.brand || '';
    const description = info?.description || 'No description provided.';
    return { imgUrl, name, brand, description };
  };

  return (
    <div className="space-y-6 text-zinc-950">
      
      <div>
        <h1 className="text-2xl font-light tracking-widest font-luxury uppercase text-zinc-900">Order Registry</h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest pt-1">Inspect customer transactions, shipping addresses & acquired items</p>
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
                <th className="p-4">Customer Details</th>
                <th className="p-4">Products / Photo</th>
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
                  <td className="p-4 min-w-[200px] space-y-1">
                    <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" /> {o.user_name}
                    </p>
                    <p className="text-[10px] text-zinc-600 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-400" /> {o.user_email}
                    </p>
                    {o.user_phone && (
                      <p className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {o.user_phone}
                      </p>
                    )}
                    <p className="text-[10px] text-zinc-500 flex items-start gap-1 pt-0.5 border-t border-zinc-100 mt-1">
                      <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0 mt-0.5" />
                      <span>{o.shipping_address}, {o.city}, {o.state} - {o.postal_code}</span>
                    </p>
                  </td>
                  <td className="p-4 min-w-[220px]">
                    {o.items && o.items.length > 0 ? (
                      <div className="space-y-2">
                        {o.items.map((item) => {
                          const { imgUrl, name, brand, description } = getItemVisual(item);
                          return (
                            <div key={item.id} className="flex items-center gap-3">
                              <img 
                                src={imgUrl} 
                                alt={name}
                                className="w-11 h-11 object-cover rounded border border-zinc-200 shadow-xs flex-shrink-0"
                              />
                              <div className="space-y-0.5">
                                <p className="font-semibold text-zinc-900 line-clamp-1">{name}</p>
                                <p className="text-[10px] text-primary uppercase font-bold">{brand} <span className="text-zinc-500 font-normal ml-1">× {item.quantity}</span></p>
                                <p className="text-[10px] text-zinc-500 line-clamp-1 italic">{description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic text-[10px]">No item details</span>
                    )}
                  </td>
                  <td className="p-4 whitespace-nowrap">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-mono font-semibold text-zinc-900 whitespace-nowrap">₹{o.total_amount.toLocaleString()}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      o.status === 'Delivered' ? 'bg-primary/10 text-primary' : 
                      o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-zinc-100 text-zinc-800'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      o.payment_status === 'Paid' ? 'text-emerald-700 bg-emerald-50' : 
                      o.payment_status === 'Awaiting Verification' ? 'text-amber-600 bg-amber-50 border border-amber-100 animate-pulse' : 'text-zinc-600 bg-zinc-100'
                    }`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
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
          
          <div className="bg-white border border-zinc-200 w-full max-w-2xl rounded-lg shadow-2xl z-10 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-800">Acquisition Details & Products</h3>
                <p className="text-[10px] text-primary uppercase font-bold">{inspectingOrder.order_number}</p>
              </div>
              <button onClick={() => setInspectingOrder(null)} className="p-1 text-zinc-400 hover:text-zinc-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-600">
              
              {/* Customer & Shipping info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 border border-zinc-200/80 p-4 rounded-lg">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3" /> Customer Contact Details
                  </span>
                  <p className="text-zinc-900 font-bold text-sm">{inspectingOrder.user_name}</p>
                  <p className="text-zinc-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" /> {inspectingOrder.user_email}
                  </p>
                  {inspectingOrder.user_phone && (
                    <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> {inspectingOrder.user_phone}
                    </p>
                  )}
                  <div className="pt-2">
                    <a 
                      href={`https://wa.me/919699986430?text=${encodeURIComponent(`Hello ${inspectingOrder.user_name}, regard your order #${inspectingOrder.order_number} at StylishTick...`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-[11px] font-semibold transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Contact via WhatsApp
                    </a>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Courier Delivery Address
                  </span>
                  <p className="text-zinc-800 font-semibold">{inspectingOrder.shipping_address}</p>
                  <p className="text-zinc-700">{inspectingOrder.city}, {inspectingOrder.state}</p>
                  <p className="text-zinc-700">Pincode: <span className="font-mono font-semibold">{inspectingOrder.postal_code}</span></p>
                  <p className="text-zinc-700">{inspectingOrder.country}</p>
                  <div className="pt-1 text-[11px]">
                    <span className="text-zinc-500">Method: </span>
                    <span className="text-zinc-900 font-semibold">{inspectingOrder.payment_method}</span>
                  </div>
                </div>
              </div>

              {/* Items list with Image & Description */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Purchased Products ({inspectingOrder.items.length})</span>
                {inspectingOrder.items.map((item) => {
                  const { imgUrl, name, brand, description } = getItemVisual(item);
                  return (
                    <div key={item.id} className="flex gap-4 p-3 bg-zinc-50 border border-zinc-100 rounded-lg items-start">
                      <img 
                        src={imgUrl} 
                        alt={name} 
                        className="w-16 h-16 object-cover rounded border border-zinc-200 shadow-xs flex-shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-zinc-900 text-sm">{name}</h4>
                            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{brand}</p>
                          </div>
                          <div className="text-right font-mono">
                            <p className="font-bold text-zinc-900">₹{item.price.toLocaleString()}</p>
                            <p className="text-[10px] text-zinc-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-zinc-600 text-[11px] leading-relaxed pt-1 border-t border-zinc-200/60 mt-1">
                          {description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-3 text-base font-semibold border-t border-zinc-200">
                <span>Grand Total</span>
                <span className="text-primary font-mono font-bold">₹{inspectingOrder.total_amount.toLocaleString()}</span>
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
