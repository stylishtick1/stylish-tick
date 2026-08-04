import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isInitialized: boolean;
  login: (token: string, user: User | null, isAdmin: boolean) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAdmin: false,
  isInitialized: false,
  
  login: (token, user, isAdmin) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', user ? JSON.stringify(user) : '');
    localStorage.setItem('auth_is_admin', isAdmin ? 'true' : 'false');
    
    set({ token, user, isAdmin, isInitialized: true });
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_is_admin');
    
    set({ token: null, user: null, isAdmin: false });
  },
  
  updateUser: (userData) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
  
  initializeAuth: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const isAdminStr = localStorage.getItem('auth_is_admin');
    
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = isAdminStr === 'true';
    
    set({ token, user, isAdmin, isInitialized: true });
  }
}));
