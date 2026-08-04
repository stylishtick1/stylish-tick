'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ChevronRight, Eye } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useWishlistStore } from '../../../store/wishlistStore';

export default function WishlistPage() {
  const { token, user, isInitialized } = useAuthStore();
  const { items, fetchWishlist, toggleWishlist, loading } = useWishlistStore();
  const isLoggedIn = !!token && !!user;

  useEffect(() => {
    if (isInitialized) {
      fetchWishlist(isLoggedIn);
    }
  }, [isInitialized, isLoggedIn, fetchWishlist]);

  if (!isInitialized || loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-pulse">
        <p className="text-muted-foreground text-xs uppercase tracking-widest">Loading your collection...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto" />
        <p className="text-muted-foreground font-luxury">Please log in to view your luxury wishlist.</p>
        <Link href="/login" className="inline-block px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-8">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/shop" className="hover:text-primary transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-semibold">Wishlist</span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-light font-luxury tracking-wider text-foreground">My Private Collection</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Saved models for future consideration</p>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-card border border-border rounded-lg">
          <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto stroke-[1]" />
          <p className="text-muted-foreground font-luxury">You haven't favorited any timepieces yet.</p>
          <Link href="/shop" className="inline-block px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider">
            Explore Watches
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const watchImg = item.watch.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=400';
            return (
              <div 
                key={item.id}
                className="group block space-y-4 luxury-card p-4 rounded-lg bg-card text-xs relative"
              >
                <div className="aspect-square w-full relative bg-muted rounded overflow-hidden">
                  <img 
                    src={watchImg} 
                    alt={item.watch.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => toggleWishlist(item.watch, isLoggedIn)}
                    className="absolute top-3 right-3 p-1.5 bg-background/80 hover:bg-background text-destructive rounded-full shadow transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">{item.watch.brand}</p>
                  <h3 className="font-medium text-sm text-foreground line-clamp-1">{item.watch.name}</h3>
                  <div className="flex justify-between items-center pt-1 pb-3">
                    <span className="font-semibold text-primary text-sm">₹{item.watch.price.toLocaleString()}</span>
                  </div>
                  
                  <Link 
                    href={`/watches/${item.watch.id}`}
                    className="w-full py-2 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground text-center font-semibold rounded uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
