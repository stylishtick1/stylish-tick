'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Edit2, Trash2, Search, Check, X, Watch, ShieldAlert } from 'lucide-react';
import api from '../../../services/api';

interface BrandItem {
  id: number;
  name: string;
  product_count: number;
  created_at?: string;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Brand state
  const [newBrandName, setNewBrandName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit Brand state
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [editName, setEditName] = useState('');

  // Status message state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchBrands() {
    setLoading(true);
    try {
      const res = await api.get('/admin/brands');
      setBrands(res.data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load brands catalog.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    setIsAdding(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/admin/brands', { name: newBrandName.trim() });
      setSuccess(`Brand "${newBrandName.trim()}" created successfully.`);
      setNewBrandName('');
      fetchBrands();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add brand.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (brand: BrandItem) => {
    setEditingBrand(brand);
    setEditName(brand.name);
  };

  const handleSaveEdit = async (oldName: string) => {
    if (!editName.trim() || editName.trim() === oldName) {
      setEditingBrand(null);
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await api.put(`/admin/brands/${encodeURIComponent(oldName)}`, { name: editName.trim() });
      setSuccess(`Brand "${oldName}" renamed to "${editName.trim()}". All linked watches updated.`);
      setEditingBrand(null);
      fetchBrands();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to rename brand.');
    }
  };

  const handleDeleteBrand = async (brandName: string) => {
    if (!confirm(`Are you sure you want to delete brand "${brandName}"?`)) return;

    setError(null);
    setSuccess(null);

    try {
      await api.delete(`/admin/brands/${encodeURIComponent(brandName)}`);
      setSuccess(`Brand "${brandName}" removed successfully.`);
      fetchBrands();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete brand.');
    }
  };

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 border border-primary/30 text-primary rounded-lg">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider font-luxury text-zinc-900">
                BRAND MANAGEMENT
              </h1>
              <p className="text-xs text-zinc-500 font-sans">
                Add, edit, rename, or delete luxury watch brands across your catalog
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-zinc-100 border border-zinc-200 text-zinc-700 font-semibold px-3 py-1.5 rounded-full">
            Total Brands: <strong className="text-primary">{brands.length}</strong>
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between animate-fade-in">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center justify-between animate-fade-in">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="p-1 hover:bg-emerald-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Bar: Add Brand Form & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Create Brand Card */}
        <div className="md:col-span-2 bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Add New Brand
          </h2>
          <form onSubmit={handleAddBrand} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. ROLE_X, HUBLO_T, Cartie_r..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="flex-1 bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded px-3.5 py-2 focus:border-primary focus:bg-white outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isAdding || !newBrandName.trim()}
              className="bg-primary text-primary-foreground font-semibold px-5 py-2 text-xs uppercase tracking-wider rounded hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {isAdding ? 'Adding...' : 'Add Brand'}
            </button>
          </form>
        </div>

        {/* Search Card */}
        <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm flex flex-col justify-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-400" />
            Filter Brands
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by brand name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded pl-9 pr-3.5 py-2 focus:border-primary focus:bg-white outline-none transition-all"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
            Catalog Brands Listing ({filteredBrands.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-xs uppercase tracking-widest animate-pulse">
            Loading Brand Catalog...
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs font-sans">
            No brand entries match your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100/80 text-zinc-600 font-semibold uppercase tracking-wider border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3.5">#</th>
                  <th className="px-6 py-3.5">Brand Identifier</th>
                  <th className="px-6 py-3.5 text-center">Active Watches</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filteredBrands.map((brand, idx) => {
                  const isEditing = editingBrand?.id === brand.id;

                  return (
                    <tr key={brand.id || brand.name} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-zinc-400 text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="px-6 py-4 font-medium">
                        {isEditing ? (
                          <div className="flex items-center gap-2 max-w-sm">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-white border border-primary text-zinc-900 px-3 py-1 text-xs rounded outline-none w-full"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(brand.name)}
                              className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                              title="Save Edit"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingBrand(null)}
                              className="p-1.5 bg-zinc-200 text-zinc-700 rounded hover:bg-zinc-300 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-900 text-sm tracking-wide">
                              {brand.name}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 border border-zinc-200 text-zinc-700">
                          <Watch className="w-3.5 h-3.5 text-primary" />
                          {brand.product_count} {brand.product_count === 1 ? 'Watch' : 'Watches'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isEditing && (
                            <button
                              onClick={() => handleStartEdit(brand)}
                              className="p-1.5 text-zinc-500 hover:text-primary hover:bg-zinc-100 rounded transition-all flex items-center gap-1"
                              title="Edit / Rename Brand"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="text-[10px] font-semibold uppercase">Edit</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteBrand(brand.name)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-all flex items-center gap-1"
                            title="Delete Brand"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-[10px] font-semibold uppercase">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
