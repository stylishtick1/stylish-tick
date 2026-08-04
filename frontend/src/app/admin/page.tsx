'use client';

import React, { useEffect, useState } from 'react';
import { IndianRupee, ShoppingBag, Users, TrendingUp, Sparkles, Award } from 'lucide-react';
import api from '../../services/api';

interface AnalyticsData {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  total_customers: number;
  revenue_by_category: Array<{ category: string; revenue: number; order_count: number }>;
  brand_sales: Array<{ brand: string; units_sold: number; total_revenue: number }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await api.get('/analytics/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to retrieve control analytics.');
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-zinc-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 border border-red-200 bg-red-50 text-red-600 text-xs rounded text-center">
        {error || 'Failed to display dashboard details.'}
      </div>
    );
  }

  return (
    <div className="space-y-10 text-zinc-900">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-widest font-luxury uppercase text-zinc-900">Boutique Executive Overview</h1>
        <p className="text-xs text-zinc-500 uppercase tracking-widest pt-1">Real-time statistics & sales performance</p>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue Card */}
        <div className="bg-white border border-zinc-200 shadow-sm p-6 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Gross Revenue</span>
            <p className="text-2xl font-bold font-mono text-primary">₹{data.total_revenue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white border border-zinc-200 shadow-sm p-6 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Acquisitions</span>
            <p className="text-2xl font-bold font-mono text-zinc-900">{data.total_orders}</p>
          </div>
          <div className="p-3 bg-zinc-100 rounded-full text-zinc-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* AOV Card */}
        <div className="bg-white border border-zinc-200 shadow-sm p-6 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Average Ticket</span>
            <p className="text-2xl font-bold font-mono text-zinc-900">₹{data.average_order_value.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-zinc-100 rounded-full text-zinc-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white border border-zinc-200 shadow-sm p-6 rounded-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Connoisseur Members</span>
            <p className="text-2xl font-bold font-mono text-zinc-900">{data.total_customers}</p>
          </div>
          <div className="p-3 bg-zinc-100 rounded-full text-zinc-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </section>

      {/* Brand & Category Analytics Grids */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Brand popularity */}
        <div className="bg-white border border-zinc-200 shadow-sm p-6 rounded-lg space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider border-b border-zinc-100 pb-3 flex items-center gap-2 text-zinc-800">
            <Award className="w-4.5 h-4.5 text-primary" /> Brand Volumetric Sales
          </h3>
          
          {data.brand_sales.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">No brand sales data collected.</p>
          ) : (
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 text-xs">
              {data.brand_sales.map((b) => (
                <div key={b.brand} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-none">
                  <div>
                    <p className="font-semibold text-zinc-800">{b.brand}</p>
                    <p className="text-[10px] text-zinc-500">{b.units_sold} timepieces sold</p>
                  </div>
                  <span className="font-mono font-bold text-primary">₹{b.total_revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category distribution */}
        <div className="bg-white border border-zinc-200 shadow-sm p-6 rounded-lg space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider border-b border-zinc-100 pb-3 flex items-center gap-2 text-zinc-800">
            <Sparkles className="w-4.5 h-4.5 text-primary" /> Category Revenue Allocation
          </h3>
          
          {data.revenue_by_category.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">No category sales logged.</p>
          ) : (
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1 text-xs">
              {data.revenue_by_category.map((cat) => (
                <div key={cat.category} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-none">
                  <div>
                    <p className="font-semibold text-zinc-800">{cat.category}</p>
                    <p className="text-[10px] text-zinc-500">{cat.order_count} acquisitions</p>
                  </div>
                  <span className="font-mono font-bold text-primary">₹{cat.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
