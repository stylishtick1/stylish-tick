'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const initializeCart = useCartStore((state) => state.initializeCart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const { token, isInitialized, user } = useAuthStore();

  // 1. Initialize auth and cart from localStorage on mount
  useEffect(() => {
    initializeAuth();
    initializeCart();
  }, [initializeAuth, initializeCart]);

  // 2. Fetch cart and wishlist from API once auth is loaded and user is logged in
  useEffect(() => {
    if (isInitialized) {
      const isLoggedIn = !!token && !!user;
      fetchCart(isLoggedIn);
      fetchWishlist(isLoggedIn);
    }
  }, [isInitialized, token, user, fetchCart, fetchWishlist]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
