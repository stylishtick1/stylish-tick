'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldAlert, CreditCard, ChevronRight, CheckCircle, Package } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import api from '../../../services/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user, isInitialized } = useAuthStore();
  const { items, getCartTotal, clearCart } = useCartStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'UPI via WhatsApp'>('UPI via WhatsApp');
  
  // Checkout Success State
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Force login
  useEffect(() => {
    if (isInitialized && (!token || !user)) {
      router.push('/login?redirect=/checkout');
    } else if (isInitialized && user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.full_name || '',
        phone: user.phone || ''
      }));
    }
  }, [isInitialized, token, user, router]);

  if (!isInitialized || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-pulse">
        <p className="text-muted-foreground text-xs uppercase tracking-widest">Verifying boutique session...</p>
      </div>
    );
  }

  if (items.length === 0 && !createdOrder) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-muted-foreground font-luxury">Your cart is currently empty. Cannot checkout.</p>
        <Link href="/shop" className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider">
          Explore Watches
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.address || !formData.city || !formData.state || !formData.country || !formData.postalCode) {
      setError('Please fill in all shipping fields.');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        shipping_address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.postalCode,
        payment_method: paymentMethod
      };
      
      const response = await api.post('/orders', orderPayload);
      setCreatedOrder(response.data);
      
      // Clear store cart
      await clearCart(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  // If order was created successfully, show confirmation screen
  if (createdOrder) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center space-y-6">
        <div className="space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto stroke-[1.5] animate-bounce" />
          <h1 className="text-3xl font-light font-luxury tracking-wider text-foreground">Order Placed</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Your timepiece has been successfully reserved</p>
        </div>

        <div className="bg-card border border-border p-4 sm:p-6 rounded-lg text-xs text-left space-y-4 shadow">
          <div className="flex justify-between pb-3 border-b border-border/50 font-semibold text-sm">
            <span>Order Reference</span>
            <span className="text-primary font-mono">{createdOrder.order_number}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="font-semibold text-foreground">₹{createdOrder.total_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-semibold text-foreground">{createdOrder.payment_method === 'UPI via WhatsApp' ? 'UPI Transfer' : 'Cash on Delivery (COD)'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Payment Status</span>
            <span className={`font-semibold ${createdOrder.payment_status === 'Awaiting Verification' ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-foreground'}`}>
              {createdOrder.payment_status}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Delivery Address</span>
            <span className="font-semibold text-foreground max-w-[200px] text-right truncate">
              {createdOrder.shipping_address}, {createdOrder.city}
            </span>
          </div>
        </div>

        {createdOrder.payment_method === 'UPI via WhatsApp' ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs space-y-2 text-left">
            <p className="font-bold uppercase tracking-wider text-[10px] text-emerald-600 dark:text-emerald-400">Payment Verification Required</p>
            <p className="leading-relaxed">To activate order processing, click the green button below to connect with our WhatsApp boutique concierge, submit your UPI screenshot, and confirm shipping.</p>
          </div>
        ) : (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-lg text-xs space-y-2 text-left">
            <p className="font-bold uppercase tracking-wider text-[10px] text-amber-600 dark:text-amber-400">COD Verification Required</p>
            <p className="leading-relaxed">Your cash-on-delivery order is reserved. Please click the button below to verify your address details on WhatsApp to expedite dispatch.</p>
          </div>
        )}

        <div className="flex flex-col gap-3 justify-center w-full max-w-sm mx-auto pt-2">
          <a 
            href={
              createdOrder.payment_method === 'UPI via WhatsApp'
                ? `https://wa.me/919876543210?text=Hi%20StylishTick%20Boutique%2C%20I%20have%20placed%20order%20%23${createdOrder.order_number}%20worth%20%E2%82%B9${createdOrder.total_amount}.%20Please%20verify%20my%20details%20and%20share%20the%20UPI%20payment%20instructions.`
                : `https://wa.me/919876543210?text=Hi%20StylishTick%20Boutique%2C%20I%20want%20to%20verify%20my%20COD%20order%20%23${createdOrder.order_number}.`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold rounded transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm5.835-4.26c1.656.982 3.284 1.503 4.887 1.504 5.548 0 10.063-4.505 10.066-10.054.001-2.688-1.042-5.216-2.935-7.11C15.918 2.185 13.393.976 10.708.975c-5.55 0-10.067 4.506-10.07 10.057-.001 1.957.513 3.867 1.489 5.558L1.13 21.05l4.762-1.31z"/></svg>
            Verify on WhatsApp
          </a>
          <div className="flex gap-2.5 w-full">
            <Link 
              href="/profile"
              className="flex-1 text-center px-4 py-2.5 border border-border hover:border-primary text-foreground text-[10px] uppercase tracking-wider font-semibold rounded transition-colors"
            >
              My Orders
            </Link>
            <Link 
              href="/shop"
              className="flex-1 text-center px-4 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-[10px] uppercase tracking-wider font-semibold rounded transition-colors"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-8">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/shop" className="hover:text-primary transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-semibold">Checkout</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-light font-luxury tracking-wider text-foreground">Secure Checkout</h1>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded flex items-center gap-3 text-xs">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Shipping details Form */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 bg-card border border-border p-4 sm:p-6 rounded-lg space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider border-b border-border pb-3">Shipping Address</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Recipient Name</label>
              <input 
                type="text" 
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Phone Number</label>
              <input 
                type="text" 
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Street Address</label>
            <input 
              type="text" 
              name="address"
              required
              placeholder="e.g. 100 Main St, Apt 4"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">City</label>
              <input 
                type="text" 
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">State</label>
              <input 
                type="text" 
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Country</label>
              <input 
                type="text" 
                name="country"
                required
                value={formData.country}
                onChange={handleInputChange}
                className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Postal Code</label>
              <input 
                type="text" 
                name="postalCode"
                required
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider pb-1 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Payment Method
            </h2>
            
            <div className="space-y-3">
              {/* Option 1: WhatsApp UPI */}
              <div 
                className={`p-4 border rounded flex items-start gap-3 text-xs cursor-pointer transition-all ${paymentMethod === 'UPI via WhatsApp' ? 'border-primary bg-primary/5' : 'border-border bg-muted/40 hover:bg-muted/70'}`}
                onClick={() => setPaymentMethod('UPI via WhatsApp')}
              >
                <input 
                  type="radio" 
                  name="paymentMethodSelect"
                  checked={paymentMethod === 'UPI via WhatsApp'}
                  onChange={() => setPaymentMethod('UPI via WhatsApp')}
                  className="accent-primary mt-0.5 flex-shrink-0" 
                />
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    UPI Transfer & WhatsApp Verification
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Recommended</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Complete payment using GPay, PhonePe or Paytm. Send payment receipt on WhatsApp for priority processing.
                  </p>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div 
                className={`p-4 border rounded flex items-start gap-3 text-xs cursor-pointer transition-all ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5' : 'border-border bg-muted/40 hover:bg-muted/70'}`}
                onClick={() => setPaymentMethod('Cash on Delivery')}
              >
                <input 
                  type="radio" 
                  name="paymentMethodSelect"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="accent-primary mt-0.5 flex-shrink-0" 
                />
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">Cash on Delivery (COD)</div>
                  <p className="text-[11px] text-muted-foreground">
                    Pay with cash at the time of delivery. Requires brief verification call/message before dispatch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-primary-foreground font-semibold rounded text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2 px-4"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <Package className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-center leading-normal">Place Luxury Order</span>
          </button>
        </form>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-5 bg-card border border-border p-4 sm:p-6 rounded-lg space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider border-b border-border pb-3">Order Summary</h2>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {items.map((item) => {
              const watchImage = item.watch.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=200';
              return (
                <div key={item.id} className="flex gap-3 text-xs">
                  <div className="relative w-14 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
                    <Image 
                      src={watchImage} 
                      alt={item.watch.name} 
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold line-clamp-1">{item.watch.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{item.watch.brand}</p>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground text-[10px]">
                      <span>Qty: {item.quantity}</span>
                      <span className="font-semibold text-foreground">₹{(item.watch.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border/60 text-xs space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Boutique Shipping</span>
              <span className="font-semibold text-primary uppercase text-[10px]">Complimentary</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT / Customs</span>
              <span className="font-semibold text-primary uppercase text-[10px]">Included</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/40 font-semibold text-sm">
              <span>Grand Total</span>
              <span className="text-primary text-base">₹{getCartTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
