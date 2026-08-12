'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Search, Package, CheckCircle, Clock, Truck, MapPin, User, Phone, ShieldAlert } from 'lucide-react';
import api from '../../../services/api';

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  
  const [query, setQuery] = useState(initialRef);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(searchRef: string) {
    if (!searchRef.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    
    try {
      const response = await api.get(`/orders/track/${encodeURIComponent(searchRef.trim())}`);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Order not found. Please check your reference number or phone.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-light font-luxury tracking-wider text-foreground">Track Your Order</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Enter your Order Reference Number (e.g. LWP-2026...) or Phone Number
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
        <input 
          type="text" 
          required
          placeholder="Order Ref or Phone Number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-card border border-border focus:border-primary/50 text-foreground text-xs px-4 py-3 rounded outline-none"
        />
        <button 
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Track
        </button>
      </form>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded flex items-center justify-center gap-2 text-xs max-w-md mx-auto">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {order && (
        <div className="bg-card border border-border p-6 rounded-lg space-y-6 animate-fade-in shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-border gap-2 text-xs">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Order Reference</span>
              <p className="text-lg font-mono font-semibold text-primary">{order.order_number}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Order Date</span>
              <p className="text-xs text-foreground font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Status timeline */}
          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className={`p-3 rounded border text-xs space-y-1 ${order.status === 'Pending' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border text-muted-foreground'}`}>
              <Clock className="w-4 h-4 mx-auto" />
              <span>Order Received</span>
            </div>
            <div className={`p-3 rounded border text-xs space-y-1 ${order.status === 'Shipped' ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border text-muted-foreground'}`}>
              <Truck className="w-4 h-4 mx-auto" />
              <span>Dispatched</span>
            </div>
            <div className={`p-3 rounded border text-xs space-y-1 ${order.status === 'Delivered' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold' : 'border-border text-muted-foreground'}`}>
              <CheckCircle className="w-4 h-4 mx-auto" />
              <span>Delivered</span>
            </div>
          </div>

          {/* Details summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-muted/30 p-4 rounded border border-border/60">
            <div className="space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> {order.user_name}
              </p>
              {order.user_phone && (
                <p className="text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {order.user_phone}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span>{order.shipping_address}, {order.city}, {order.state} - {order.postal_code}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">Payment Method: <span className="font-semibold text-foreground">{order.payment_method}</span></p>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
              Timepieces In Order ({order.items.length})
            </h3>
            {order.items.map((item: any) => {
              const watchInfo = item.product || item.watch;
              const imgUrl = watchInfo?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=200';
              return (
                <div key={item.id} className="flex gap-4 items-center text-xs p-2.5 rounded bg-card border border-border/40">
                  <div className="relative w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                    <Image src={imgUrl} alt={watchInfo?.name || 'Product'} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{watchInfo?.name || 'Product'}</h4>
                    <p className="text-[10px] text-muted-foreground">{watchInfo?.brand} • Qty: {item.quantity}</p>
                  </div>
                  <div className="font-semibold text-primary">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border font-semibold text-sm">
            <span>Grand Total</span>
            <span className="text-primary text-base font-mono">₹{order.total_amount.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
