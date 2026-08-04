'use client';

import React, { useEffect, useState } from 'react';
import { Search, Eye, Power, AlertCircle, ShoppingBag, X } from 'lucide-react';
import api from '../../../services/api';

interface Customer {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Customer orders inspection
  const [inspectingCustomer, setInspectingCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const url = search ? `/admin/customers?search=${encodeURIComponent(search)}` : '/admin/customers';
      const response = await api.get(url);
      setCustomers(response.data);
    } catch (err) {
      setError('Failed to pull customer database.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleToggleActive = async (id: number) => {
    try {
      const response = await api.put(`/admin/customers/${id}/toggle-active`);
      
      // Update local state
      setCustomers((prev) => 
        prev.map((c) => c.id === id ? { ...c, is_active: response.data.is_active } : c)
      );
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleInspectOrders = async (customer: Customer) => {
    setInspectingCustomer(customer);
    setOrdersLoading(true);
    try {
      const response = await api.get(`/admin/customers/${customer.id}/orders`);
      setCustomerOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-zinc-950">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-widest font-luxury uppercase text-zinc-900">Customer Database</h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest pt-1">Inspect customer details & authorization privileges</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Search toolbar */}
      <div className="flex items-center relative max-w-sm w-full text-xs">
        <input 
          type="text" 
          placeholder="Filter customers by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-zinc-200 focus:border-primary/50 text-zinc-900 rounded pl-4 pr-10 py-2.5 outline-none"
        />
        <Search className="w-4 h-4 absolute right-3 text-zinc-500" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center animate-pulse text-xs text-zinc-400 uppercase tracking-widest">
          Querying ledger...
        </div>
      ) : customers.length === 0 ? (
        <div className="p-8 border border-zinc-200 bg-white text-center text-xs text-zinc-500 rounded shadow-sm">
          No registered customer accounts matching.
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-500 uppercase tracking-wider text-[10px]">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Registration</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/50">
                  <td className="p-4 font-semibold text-zinc-800">{c.full_name}</td>
                  <td className="p-4 font-mono text-zinc-600">{c.email}</td>
                  <td className="p-4">{c.phone || 'N/A'}</td>
                  <td className="p-4">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-semibold ${c.is_active ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                      {c.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleInspectOrders(c)}
                      className="p-1.5 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded"
                      title="Inspect Acquisitions"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(c.id)}
                      className={`p-1.5 hover:bg-zinc-100 rounded ${c.is_active ? 'text-zinc-500 hover:text-red-600' : 'text-zinc-500 hover:text-emerald-600'}`}
                      title={c.is_active ? 'Suspend Account' : 'Activate Account'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== ORDERS INSPECTOR MODAL ==================== */}
      {inspectingCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setInspectingCustomer(null)} />
          
          <div className="bg-white border border-zinc-200 w-full max-w-lg rounded-lg shadow-2xl z-10 flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-800">Acquisitions Overview</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{inspectingCustomer.full_name}</p>
              </div>
              <button onClick={() => setInspectingCustomer(null)} className="p-1 text-zinc-400 hover:text-zinc-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {ordersLoading ? (
                <div className="py-10 text-center animate-pulse text-zinc-400 uppercase tracking-widest">
                  Retrieving purchases...
                </div>
              ) : customerOrders.length === 0 ? (
                <p className="text-center text-zinc-500 py-10">No orders logged for this client.</p>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="p-4 border border-zinc-200 rounded bg-zinc-50 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-primary">{order.order_number}</p>
                        <p className="text-[10px] text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold font-mono text-zinc-800">₹{order.total_amount.toLocaleString()}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          order.status === 'Delivered' ? 'bg-primary/10 text-primary' : 
                          order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-zinc-100 text-zinc-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
