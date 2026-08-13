'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Watch, Users, ShoppingBag, LogOut, ChevronLeft, Shield, Bell, Tag } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, isAdmin, isInitialized, logout } = useAuthStore();

  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; time: Date }>>([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState<boolean>(false);

  // Route Guard: enforce admin only on pages under /admin (except /admin/login)
  useEffect(() => {
    if (isInitialized && pathname !== '/admin/login') {
      if (!token || !isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [isInitialized, token, isAdmin, pathname, router]);

  // Long poll for new orders to generate notification alerts
  useEffect(() => {
    let intervalId: any;
    
    async function checkNewOrders() {
      try {
        const res = await api.get('/admin/orders');
        const ordersList = res.data;
        const currentCount = ordersList.length;
        
        const storedCountStr = localStorage.getItem('last_orders_count');
        const storedCount = storedCountStr ? parseInt(storedCountStr, 10) : 0;
        
        if (storedCount > 0 && currentCount > storedCount) {
          const newOrdersDiff = currentCount - storedCount;
          const newNotifications = ordersList.slice(0, newOrdersDiff).map((order: any) => ({
            id: String(order.id),
            message: `New Order ${order.order_number} placed (₹${order.total_amount.toLocaleString()})`,
            time: new Date()
          }));
          
          setNotifications(prev => [...newNotifications, ...prev]);
        }
        
        localStorage.setItem('last_orders_count', String(currentCount));
        setOrdersCount(currentCount);
      } catch (err) {
        console.error('Failed to query admin orders check:', err);
      }
    }
    
    if (token && isAdmin) {
      checkNewOrders();
      intervalId = setInterval(checkNewOrders, 10000); // Check every 10 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, isAdmin]);

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.admin-bell-container')) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // If path is admin login page, don't show the dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading state
  if (!isInitialized || !token || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-zinc-500 flex items-center justify-center animate-pulse text-xs uppercase tracking-widest">
        Authenticating Secure Admin Shell...
      </div>
    );
  }

  const menuItems = [
    { name: 'Analytics', href: '/admin', icon: LayoutDashboard },
    { name: 'Watches CRUD', href: '/admin/watches', icon: Watch },
    { name: 'Brand Control', href: '/admin/brands', icon: Tag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Orders Control', href: '/admin/orders', icon: ShoppingBag }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between relative admin-bell-container">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-primary/10 border border-primary/30 text-primary rounded flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-[0.1em] font-luxury text-primary whitespace-nowrap">
                  STYLISH TICK
                </span>
                <p className="text-[9px] uppercase tracking-wider text-zinc-500">Control Desk</p>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-primary transition-all relative"
                title="Admin Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full flex items-center justify-center text-[7px] text-white font-bold animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-64 bg-white border border-zinc-200 rounded-lg shadow-xl py-2 z-50 text-[10px] text-zinc-800 animate-fade-in">
                  <div className="px-3.5 py-1.5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                    <span className="font-bold uppercase tracking-wider text-zinc-600">Pending Alerts</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-primary hover:underline font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-center text-zinc-400 font-sans">
                      No new acquisition alerts.
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-50 max-h-60 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-3 hover:bg-zinc-50 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-zinc-700 leading-snug">{notif.message}</p>
                            <p className="text-[8px] text-zinc-400 font-mono mt-0.5">
                              {notif.time.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu Links */}
          <nav className="p-4 space-y-1.5 text-xs font-semibold uppercase tracking-wider">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-200 space-y-2 text-xs font-semibold uppercase tracking-wider">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Boutique Front
          </Link>
          
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-red-50 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-zinc-50">
        {children}
      </main>

    </div>
  );
}
