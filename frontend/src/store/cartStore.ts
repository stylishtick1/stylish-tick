import { create } from 'zustand';
import api from '../services/api';

export interface CartItem {
  id: number | string; // Item ID from database or watch ID for local guest
  watch_id: string;
  quantity: number;
  watch: {
    id: string;
    name: string;
    brand: string;
    price: number;
    stock: number;
    category: string;
    images: Array<{ image_url: string }>;
  };
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  fetchCart: (isLoggedIn: boolean) => Promise<void>;
  addItem: (watch: any, quantity: number, isLoggedIn: boolean) => Promise<void>;
  updateQuantity: (itemId: number | string, watchId: number | string, quantity: number, isLoggedIn: boolean) => Promise<void>;
  removeItem: (itemId: number | string, watchId: number | string, isLoggedIn: boolean) => Promise<void>;
  clearCart: (isLoggedIn: boolean) => Promise<void>;
  initializeCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  
  initializeCart: () => {
    if (typeof window === 'undefined') return;
    const localCart = localStorage.getItem('local_cart');
    if (localCart) {
      set({ items: JSON.parse(localCart) });
    }
  },
  
  fetchCart: async (isLoggedIn) => {
    if (!isLoggedIn) {
      get().initializeCart();
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const response = await api.get('/cart');
      set({ items: response.data.items || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Failed to fetch cart', loading: false });
    }
  },
  
  addItem: async (watch, quantity, isLoggedIn) => {
    if (isLoggedIn) {
      set({ loading: true, error: null });
      try {
        await api.post('/cart/items', { watch_id: watch.id, quantity });
        const response = await api.get('/cart');
        set({ items: response.data.items || [], loading: false });
      } catch (err: any) {
        set({ error: err.response?.data?.detail || 'Failed to add item', loading: false });
        throw err;
      }
    } else {
      // Local guest add
      const currentItems = [...get().items];
      const existingItemIdx = currentItems.findIndex(item => item.watch_id === watch.id);
      
      if (existingItemIdx !== -1) {
        const newQty = currentItems[existingItemIdx].quantity + quantity;
        currentItems[existingItemIdx].quantity = newQty;
      } else {
        currentItems.push({
          id: watch.id, // using watch id as item id for guest
          watch_id: watch.id,
          quantity,
          watch
        });
      }
      
      localStorage.setItem('local_cart', JSON.stringify(currentItems));
      set({ items: currentItems });
    }
  },
  
  updateQuantity: async (itemId, watchId, quantity, isLoggedIn) => {
    if (isLoggedIn) {
      set({ loading: true, error: null });
      try {
        await api.put(`/cart/items/${itemId}`, { quantity });
        const response = await api.get('/cart');
        set({ items: response.data.items || [], loading: false });
      } catch (err: any) {
        set({ error: err.response?.data?.detail || 'Failed to update quantity', loading: false });
        throw err;
      }
    } else {
      // Local guest update
      const currentItems = get().items.map(item => {
        if (item.watch_id === watchId) {

          return { ...item, quantity };
        }
        return item;
      });
      localStorage.setItem('local_cart', JSON.stringify(currentItems));
      set({ items: currentItems });
    }
  },
  
  removeItem: async (itemId, watchId, isLoggedIn) => {
    if (isLoggedIn) {
      set({ loading: true, error: null });
      try {
        await api.delete(`/cart/items/${itemId}`);
        const response = await api.get('/cart');
        set({ items: response.data.items || [], loading: false });
      } catch (err: any) {
        set({ error: err.response?.data?.detail || 'Failed to remove item', loading: false });
      }
    } else {
      // Local guest remove
      const currentItems = get().items.filter(item => item.watch_id !== watchId);
      localStorage.setItem('local_cart', JSON.stringify(currentItems));
      set({ items: currentItems });
    }
  },
  
  clearCart: async (isLoggedIn) => {
    if (isLoggedIn) {
      set({ loading: true, error: null });
      try {
        await api.delete('/cart/clear');
        set({ items: [], loading: false });
      } catch (err: any) {
        set({ error: err.response?.data?.detail || 'Failed to clear cart', loading: false });
      }
    } else {
      localStorage.removeItem('local_cart');
      set({ items: [] });
    }
  },
  
  getCartTotal: () => {
    return get().items.reduce((sum, item) => sum + (item.watch.price * item.quantity), 0);
  },
  
  getCartCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  }
}));
