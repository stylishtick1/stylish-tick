'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Key, ShoppingBag, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Smartphone, Mail, MapPin, Package, Truck, ShieldCheck } from 'lucide-react';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

interface OrderItem {
  id: number;
  watch: { name: string; brand: string; price: number };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: string;
  city: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

const renderOrderStatusStepper = (status: string) => {
  if (status === 'Cancelled') {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-center rounded-lg my-4 font-sans flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span className="font-semibold text-xs uppercase tracking-wider">This acquisition has been cancelled.</span>
      </div>
    );
  }

  const steps = [
    { label: 'Placed', icon: CheckCircle, desc: 'We have received your reservation request.' },
    { label: 'Processing', icon: Package, desc: 'Your watch is undergoing authentication and custom boxing.' },
    { label: 'Shipped', icon: Truck, desc: 'Acquisition has been dispatched via complimentary concierge shipping.' },
    { label: 'Delivered', icon: ShieldCheck, desc: 'Timepiece has been successfully hand-delivered.' }
  ];

  const statusIndices: Record<string, number> = {
    'Pending': 0,
    'Confirmed': 1,
    'Processing': 1,
    'Shipped': 2,
    'Delivered': 3
  };

  const currentStepIdx = statusIndices[status] ?? 0;

  return (
    <div className="py-6 border-y border-border/40 space-y-6 font-sans bg-muted/10 rounded-lg p-4 my-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-[10px] uppercase text-primary tracking-widest animate-pulse">Acquisition Transit Timeline</h4>
        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-2.5 py-0.5 rounded-full uppercase">
          Stage: {steps[currentStepIdx]?.label}
        </span>
      </div>

      <div className="relative flex items-center justify-between w-full max-w-lg mx-auto px-6 py-2">
        {/* Progress Line */}
        <div className="absolute left-10 right-10 top-[22px] h-[2px] bg-border z-0">
          <div 
            className="h-full bg-primary transition-all duration-700" 
            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isActive = idx <= currentStepIdx;
          const StepIcon = step.icon;
          return (
            <div key={step.label} className="flex flex-col items-center z-10 relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-110' 
                    : 'bg-card text-muted-foreground border-border'
                }`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              <span className={`text-[9px] uppercase tracking-widest mt-2 font-bold ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic current state description */}
      <div className="bg-card border border-border/60 p-3.5 rounded-md text-center shadow-xs max-w-md mx-auto">
        <p className="font-semibold text-[10px] text-foreground uppercase tracking-widest mb-0.5">Current Status</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{steps[currentStepIdx]?.desc}</p>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, isInitialized, updateUser } = useAuthStore();
  const isLoggedIn = !!token && !!user;

  // Tabs: 'profile' or 'orders'
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  
  // Profile update form states
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // Password change form states
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Orders list
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/login');
    } else if (isInitialized && user) {
      setProfileForm({
        fullName: user.full_name,
        phone: user.phone || ''
      });
    }
  }, [isInitialized, isLoggedIn, user, router]);

  // Fetch orders history when activeTab changes to orders
  useEffect(() => {
    async function fetchOrders() {
      if (activeTab === 'orders' && isLoggedIn) {
        setOrdersLoading(true);
        try {
          const response = await api.get('/orders');
          setOrders(response.data);
        } catch (err) {
          console.error(err);
        } finally {
          setOrdersLoading(false);
        }
      }
    }
    fetchOrders();
  }, [activeTab, isLoggedIn]);

  if (!isInitialized || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-pulse">
        <p className="text-muted-foreground text-xs uppercase tracking-widest">Loading boutique profile...</p>
      </div>
    );
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    
    try {
      const response = await api.put('/auth/profile/update', {
        full_name: profileForm.fullName,
        phone: profileForm.phone || null
      });
      updateUser(response.data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await api.put('/auth/profile/change-password', {
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password.');
    }
  };

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-8">
      
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-light font-luxury tracking-wider text-foreground">Boutique Account</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Manage your profile credentials and order acquisitions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 bg-card border border-border p-4 rounded-lg flex flex-row lg:flex-col gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 lg:flex-none text-left px-4 py-3 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2.5 ${activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <User className="w-4 h-4" />
            My Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 lg:flex-none text-left px-4 py-3 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2.5 ${activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            Acquisitions ({orders.length || '...'})
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* TAB 1: PROFILE MANAGEMENT */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Profile Details Form */}
              <div className="bg-card border border-border p-6 rounded-lg space-y-4 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider border-b border-border pb-3 flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-primary" /> Profile Credentials
                </h3>
                
                {profileSuccess && (
                  <div className="p-3 bg-primary/10 border border-primary text-primary rounded text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Profile updated successfully.
                  </div>
                )}
                {profileError && (
                  <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {profileError}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Email (Locked)</label>
                    <div className="flex items-center gap-2 bg-muted border border-border rounded px-3.5 py-2.5 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2.5 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Phone Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full bg-muted border border-border focus:border-primary/50 rounded pl-9 pr-3.5 py-2.5 outline-none"
                      />
                      <Smartphone className="w-3.5 h-3.5 absolute left-3 top-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded uppercase tracking-wider">
                    Update Details
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="bg-card border border-border p-6 rounded-lg space-y-4 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wider border-b border-border pb-3 flex items-center gap-2">
                  <Key className="w-4.5 h-4.5 text-primary" /> Security Access
                </h3>

                {passwordSuccess && (
                  <div className="p-3 bg-primary/10 border border-primary text-primary rounded text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Password changed successfully.
                  </div>
                )}
                {passwordError && (
                  <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Old Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="w-full bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2.5 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">New Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2.5 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2.5 outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded uppercase tracking-wider">
                    Change Password
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4 bg-card border border-border p-6 rounded-lg">
              <h3 className="text-sm font-semibold uppercase tracking-wider border-b border-border pb-3 flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-primary" /> Acquisition History
              </h3>

              {ordersLoading ? (
                <div className="py-10 text-center animate-pulse text-xs text-muted-foreground">
                  Retrieving invoices...
                </div>
              ) : orders.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground space-y-4">
                  <p>You have not placed any orders yet.</p>
                  <Link href="/shop" className="inline-block px-5 py-2 bg-primary text-primary-foreground font-semibold rounded uppercase tracking-wider">
                    Shop Catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    return (
                      <div key={order.id} className="border border-border/80 rounded overflow-hidden text-xs">
                        
                        {/* Summary Bar */}
                        <div 
                          onClick={() => toggleOrderExpand(order.id)}
                          className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 hover:bg-muted/70 cursor-pointer transition-colors"
                        >
                          <div className="space-y-1">
                            <p className="font-semibold text-primary">{order.order_number}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Total Paid</p>
                              <p className="font-bold text-foreground">₹{order.total_amount.toLocaleString()}</p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Status</p>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                order.status === 'Delivered' ? 'bg-primary/20 text-primary' : 
                                order.status === 'Cancelled' ? 'bg-destructive/20 text-destructive' : 'bg-accent text-accent-foreground'
                              }`}>
                                {order.status}
                              </span>
                            </div>

                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="p-4 bg-card border-t border-border/50 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border/40 pb-4">
                              <div className="space-y-1.5">
                                <h4 className="font-semibold text-[10px] uppercase text-primary tracking-wider">Shipping Summary</h4>
                                <div className="space-y-1 text-muted-foreground">
                                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {order.shipping_address}</p>
                                  <p className="pl-5">{order.city}</p>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <h4 className="font-semibold text-[10px] uppercase text-primary tracking-wider">Payment Info</h4>
                                <div className="space-y-0.5 text-muted-foreground">
                                  <p>Status: <span className="font-semibold text-foreground">{order.payment_status}</span></p>
                                  <p>Method: <span className="font-semibold text-foreground">{order.payment_method}</span></p>
                                </div>
                              </div>
                            </div>

                            {/* Stepper Progress */}
                            {renderOrderStatusStepper(order.status)}

                            <div className="space-y-3">
                              <h4 className="font-semibold text-[10px] uppercase text-primary tracking-wider">Acquired timepieces</h4>
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-none">
                                  <div>
                                    <p className="font-semibold text-foreground">{item.watch.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{item.watch.brand}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">₹{item.price.toLocaleString()}</p>
                                    <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
