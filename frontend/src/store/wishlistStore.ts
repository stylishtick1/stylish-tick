import { create } from 'zustand';
import api from '../services/api';

interface WishlistItem {
  id: number;
  watch: {
    id: string;
    name: string;
    brand: string;
    price: number;
    images: Array<{ image_url: string }>;
  };
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  fetchWishlist: (isLoggedIn: boolean) => Promise<void>;
  toggleWishlist: (watch: any, isLoggedIn: boolean) => Promise<void>;
  isInWishlist: (watchId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,
  
  fetchWishlist: async (isLoggedIn) => {
    if (!isLoggedIn) {
      set({ items: [] });
      return;
    }
    set({ loading: true });
    try {
      const response = await api.get('/wishlist');
      set({ items: response.data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },
  
  toggleWishlist: async (watch, isLoggedIn) => {
    if (!isLoggedIn) return;
    
    const currentItems = get().items;
    const existingIdx = currentItems.findIndex(item => item.watch.id === watch.id);
    
    if (existingIdx !== -1) {
      // Remove
      const itemToDelete = currentItems[existingIdx];
      try {
        await api.delete(`/wishlist/${itemToDelete.id}`);
        set({ items: currentItems.filter(item => item.id !== itemToDelete.id) });
      } catch (err) {
        console.error(err);
      }
    } else {
      // Add
      try {
        const response = await api.post('/wishlist', { watch_id: watch.id });
        set({ items: [...currentItems, response.data] });
      } catch (err) {
        console.error(err);
      }
    }
  },
  
  isInWishlist: (watchId) => {
    return get().items.some(item => item.watch.id === watchId);
  }
}));
