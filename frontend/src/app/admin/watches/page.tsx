'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload, Check, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

interface Watch {
  id: string | number;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  movement_type: string;
  strap_material: string;
  water_resistance: string;
  warranty_years: number;
  featured: boolean;
  parent_id?: string | null;
  images: Array<{ id: number; image_url: string; image_type: string; display_order: number }>;
}

export default function AdminWatchesPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWatch, setEditingWatch] = useState<Watch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form Field States
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    movement_type: '',
    strap_material: '',
    water_resistance: '',
    warranty_years: 1,
    featured: false,
    parent_id: '',
    images: [] as Array<{ image_url: string; image_type: string; display_order: number }>
  });

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  async function fetchWatches() {
    setLoading(true);
    try {
      const res = await api.get('/watches?limit=100');
      setWatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatches();
  }, []);

  const handleOpenCreate = () => {
    setEditingWatch(null);
    setNewBrandName('');
    setFormData({
      name: '',
      brand: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      movement_type: '',
      strap_material: '',
      water_resistance: '',
      warranty_years: 2,
      featured: false,
      parent_id: '',
      images: []
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (watch: Watch) => {
    setEditingWatch(watch);
    setNewBrandName('');
    setFormData({
      name: watch.name,
      brand: watch.brand,
      description: watch.description,
      price: watch.price,
      stock: watch.stock,
      category: watch.category,
      movement_type: watch.movement_type || '',
      strap_material: watch.strap_material || '',
      water_resistance: watch.water_resistance || '',
      warranty_years: watch.warranty_years,
      featured: watch.featured,
      parent_id: watch.parent_id || '',
      images: watch.images.map(img => ({
        image_url: img.image_url,
        image_type: img.image_type,
        display_order: img.display_order
      }))
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    if (type === 'number') processedValue = Number(value);
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      featured: e.target.checked
    });
  };

  // Upload image to backend
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImage(true);
    setError(null);
    
    const file = files[0];
    const imagePayload = new FormData();
    imagePayload.append('file', file);
    
    try {
      const response = await api.post('/admin/upload-image', imagePayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const uploadedUrl = response.data.image_url;
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, {
          image_url: uploadedUrl,
          image_type: 'Front View',
          display_order: prev.images.length
        }]
      }));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveFormImage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const finalBrand = formData.brand === 'NEW_BRAND' ? newBrandName.trim() : formData.brand;

    if (!finalBrand) {
      setError('Please select or specify a brand.');
      return;
    }

    const payload = {
      ...formData,
      brand: finalBrand,
      parent_id: formData.parent_id === '' ? null : formData.parent_id
    };

    try {
      if (editingWatch) {
        // Edit Watch
        await api.put(`/admin/watches/${editingWatch.id}`, payload);
        setSuccess('Timepiece successfully updated.');
      } else {
        // Create Watch
        await api.post('/admin/watches', payload);
        setSuccess('Timepiece successfully registered.');
      }
      
      setIsFormOpen(false);
      fetchWatches();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit timepiece.');
    }
  };

  const handleDeleteWatch = async (id: string | number) => {
    if (!confirm('Are you sure you want to soft-delete this timepiece from inventory?')) return;
    try {
      await api.delete(`/admin/watches/${id}`);
      setSuccess('Timepiece successfully soft-deleted.');
      fetchWatches();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      alert('Failed to delete timepiece.');
    }
  };

  const filteredWatches = watches.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.brand.toLowerCase().includes(search.toLowerCase()) ||
    w.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-zinc-950">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-widest font-luxury uppercase text-zinc-900">Watch Inventory</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest pt-1">Manage brand timepieces & descriptions</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Timepiece
        </button>
      </div>

      {success && (
        <div className="p-4 bg-primary/10 border border-primary/30 text-primary rounded flex items-center gap-3 text-xs">
          <Check className="w-5 h-5 flex-shrink-0" />
          <p className="font-semibold">{success}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center relative max-w-sm w-full text-xs">
        <input 
          type="text" 
          placeholder="Filter inventory by name, brand, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-zinc-200 focus:border-primary/50 text-zinc-900 rounded pl-4 pr-10 py-2.5 outline-none"
        />
        <Search className="w-4 h-4 absolute right-3 text-zinc-500" />
      </div>

      {/* Inventory table */}
      {loading ? (
        <div className="py-20 text-center animate-pulse text-xs text-zinc-400 uppercase tracking-widest">
          Retrieving inventory logs...
        </div>
      ) : filteredWatches.length === 0 ? (
        <div className="p-8 border border-zinc-200 bg-white text-center text-xs text-zinc-500 rounded shadow-sm">
          No timepieces in inventory matching criteria.
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-zinc-500 uppercase tracking-wider text-[10px]">
                <th className="p-4">Visual</th>
                <th className="p-4">Brand / Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Featured</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredWatches.map((watch) => {
                const watchImg = watch.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=100';
                return (
                  <tr key={watch.id} className="hover:bg-zinc-50/50">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded overflow-hidden bg-zinc-100">
                        <img src={watchImg} alt={watch.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-zinc-800">{watch.name}</p>
                      <p className="text-[10px] text-zinc-500">{watch.brand}</p>
                    </td>
                    <td className="p-4">{watch.category}</td>
                    <td className="p-4 font-mono font-semibold text-primary">₹{watch.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-semibold ${watch.stock > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                        {watch.stock} Left
                      </span>
                    </td>
                    <td className="p-4">
                      {watch.featured ? (
                        <span className="text-primary font-semibold">Yes</span>
                      ) : (
                        <span className="text-zinc-400">No</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(watch)}
                        className="p-1.5 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWatch(watch.id)}
                        className="p-1.5 hover:bg-zinc-100 text-zinc-500 hover:text-red-600 rounded"
                        title="Delete Watch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== FORM MODAL (CREATE / EDIT) ==================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsFormOpen(false)} />
          
          <div className="bg-white border border-zinc-200 w-full max-w-2xl rounded-lg shadow-2xl z-10 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-zinc-800">
                {editingWatch ? `Edit ${editingWatch.name}` : 'Create Timepiece'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-zinc-600">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Watch Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Brand *</label>
                  <select 
                    name="brand"
                    required
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                  >
                    <option value="">Select Brand</option>
                    {Array.from(new Set([
                      'Rolex', 'Omega', 'Seiko', 'Titan', 'Tommy Hilfiger', 'Hublot', 'Fossil', 'Smart Watches',
                      ...(editingWatch ? [editingWatch.brand] : []),
                      ...watches.map(w => w.brand)
                    ].filter(Boolean))).map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                    <option value="NEW_BRAND">+ Add New Brand...</option>
                  </select>
                  {formData.brand === 'NEW_BRAND' && (
                    <input 
                      type="text" 
                      placeholder="Type new brand name..."
                      required
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="w-full mt-1.5 bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Is this a color/strap variant of an existing watch? (Optional Parent Watch)</label>
                <select 
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                >
                  <option value="">No, this is a standalone or parent timepiece</option>
                  {watches
                    .filter(w => !editingWatch || String(w.id) !== String(editingWatch.id))
                    .map(w => (
                      <option key={w.id} value={w.id}>
                        {w.brand} - {w.name} (ID: {String(w.id).substring(0, 8)}...)
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Description *</label>
                <textarea 
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded p-3 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Price (INR) *</label>
                  <input 
                    type="number" 
                    name="price"
                    required
                    min={0}
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Stock Level *</label>
                  <input 
                    type="number" 
                    name="stock"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Category *</label>
                  <select 
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="Diver">Diver</option>
                    <option value="Chronograph">Chronograph</option>
                    <option value="Dress">Dress</option>
                    <option value="Pilot">Pilot</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Warranty (Years) *</label>
                  <input 
                    type="number" 
                    name="warranty_years"
                    required
                    min={1}
                    value={formData.warranty_years}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Movement type</label>
                  <input 
                    type="text" 
                    name="movement_type"
                    placeholder="e.g. Swiss Automatic"
                    value={formData.movement_type}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Strap Material</label>
                  <input 
                    type="text" 
                    name="strap_material"
                    placeholder="e.g. Oystersteel"
                    value={formData.strap_material}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Water Resistance</label>
                  <input 
                    type="text" 
                    name="water_resistance"
                    placeholder="e.g. 300 Meters"
                    value={formData.water_resistance}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-zinc-200 text-zinc-900 focus:border-primary/50 rounded px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="featured"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featured" className="text-zinc-800 font-semibold cursor-pointer">Mark as Featured Masterpiece</label>
              </div>

              {/* Images management */}
              <div className="space-y-3 pt-4 border-t border-zinc-100">
                <h4 className="font-semibold text-zinc-800 uppercase tracking-wider">Timepiece Gallery</h4>
                
                {/* Images preview list */}
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 border border-zinc-200 rounded overflow-hidden">
                        <img src={img.image_url} alt="Gallery item" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveFormImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-500 text-white p-0.5 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Trigger button */}
                <div className="relative border border-dashed border-zinc-200 rounded-lg p-5 flex flex-col items-center justify-center gap-1.5 hover:border-primary/40 cursor-pointer transition-colors bg-zinc-50">
                  <Upload className="w-6 h-6 text-zinc-400" />
                  <span className="text-[10px] text-zinc-500">Upload high-res PNG / JPG. Recommended square.</span>
                  
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-xs text-primary font-semibold">
                      Uploading image...
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded"
                >
                  Save Timepiece
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
