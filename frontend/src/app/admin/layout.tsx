'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Watch, Users, ShoppingBag, LogOut, ChevronLeft, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, isAdmin, isInitialized, logout } = useAuthStore();

  // Route Guard: enforce admin only on pages under /admin (except /admin/login)
  useEffect(() => {
    if (isInitialized && pathname !== '/admin/login') {
      if (!token || !isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [isInitialized, token, isAdmin, pathname, router]);

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
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Orders Control', href: '/admin/orders', icon: ShoppingBag }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-zinc-200 flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 border border-primary/30 text-primary rounded">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-[0.1em] font-luxury text-primary">
                STYLISH TICK
              </span>
              <p className="text-[9px] uppercase tracking-wider text-zinc-500">Control Desk</p>
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
