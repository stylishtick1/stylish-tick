'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const { token, user } = useAuthStore();
  const isLoggedIn = !!token && !!user;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border text-foreground flex flex-col shadow-2xl transition-transform duration-500 ease-in-out">
          
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Your Collection
            </h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/50 stroke-[1]" />
                <p className="text-muted-foreground font-luxury">Your cart is currently empty</p>
                <Link 
                  href="/shop" 
                  onClick={onClose}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-md text-sm transition-colors uppercase tracking-wider"
                >
                  Explore Watches
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const watchImage = item.watch.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=200';
                return (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-border/50 last:border-none">
                    <div className="relative w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                      <Image 
                        src={watchImage} 
                        alt={item.watch.name}
                        fill
                        sizes="80px"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-medium text-sm line-clamp-1">{item.watch.name}</h3>
                          <span className="font-semibold text-sm text-primary">₹{(item.watch.price).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.watch.brand}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-border rounded">
                          <button 
                            onClick={() => item.quantity > 1 && updateQuantity(item.id, item.watch_id, item.quantity - 1, isLoggedIn)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.watch_id, item.quantity + 1, isLoggedIn)}
                            className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        {/* Remove button */}
                        <button 
                          onClick={() => removeItem(item.id, item.watch_id, isLoggedIn)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-border bg-muted/30 space-y-4">
              <div className="flex justify-between text-base font-medium">
                <span>Subtotal</span>
                <span className="text-primary font-semibold text-lg">₹{getCartTotal().toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping, taxes, and discounts calculated at checkout.</p>
              
              <div className="space-y-2">
                <Link 
                  href="/checkout"
                  onClick={onClose}
                  className="w-full block py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-center text-sm uppercase tracking-wider transition-colors shadow-lg"
                >
                  Proceed to Checkout
                </Link>
                <button 
                  onClick={onClose}
                  className="w-full py-2.5 text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
