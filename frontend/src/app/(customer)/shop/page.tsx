'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Check, ChevronDown } from 'lucide-react';
import api from '../../../services/api';

interface Watch {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  stock: number;
  images: Array<{ image_url: string }>;
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search Param Initializer
  const initialSearch = searchParams.get('search') || '';
  const initialBrand = searchParams.get('brand') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialFeatured = searchParams.get('featured') || '';
  const initialMinPrice = searchParams.get('min_price') || '';
  const initialMaxPrice = searchParams.get('max_price') || '';

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<number | ''>(initialMinPrice === '' ? '' : Number(initialMinPrice));
  const [maxPrice, setMaxPrice] = useState<number | ''>(initialMaxPrice === '' ? '' : Number(initialMaxPrice));
  const [sortBy, setSortBy] = useState('newest');
  
  // Page / Pagination States
  const [page, setPage] = useState(1);
  const limit = 12;

  // Metadata Options fetched from API
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Custom Dropdown States & Refs
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const mobileSortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (mobileSortDropdownRef.current && !mobileSortDropdownRef.current.contains(event.target as Node)) {
        setIsMobileSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch filter options (Brands & Categories)
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [brandsRes, catsRes] = await Promise.all([
          api.get('/watches/brands'),
          api.get('/watches/categories')
        ]);
        setAvailableBrands(brandsRes.data);
        setAvailableCategories(catsRes.data);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    fetchFilterOptions();
  }, []);

  // Fetch watches when filters change
  useEffect(() => {
    async function fetchWatches() {
      setLoading(true);
      try {
        const offset = (page - 1) * limit;
        let url = `/watches?limit=${limit}&offset=${offset}`;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (selectedBrand) url += `&brand=${encodeURIComponent(selectedBrand)}`;
        if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (minPrice !== '') url += `&min_price=${minPrice}`;
        if (maxPrice !== '') url += `&max_price=${maxPrice}`;
        if (initialFeatured === 'true') url += `&featured=true`;
        if (sortBy) url += `&sort_by=${sortBy}`;

        const res = await api.get(url);
        setWatches(res.data);
      } catch (err) {
        console.error('Failed to fetch watches:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWatches();
  }, [search, selectedBrand, selectedCategory, minPrice, maxPrice, sortBy, page, initialFeatured]);

  // Sync state with search params if they change externally
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    setSelectedCategory(searchParams.get('category') || '');
    const minP = searchParams.get('min_price') || '';
    const maxP = searchParams.get('max_price') || '';
    setMinPrice(minP === '' ? '' : Number(minP));
    setMaxPrice(maxP === '' ? '' : Number(maxP));
  }, [searchParams]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
    router.push('/shop');
  };

  const getSelectedBrandsList = () => selectedBrand ? selectedBrand.split(',') : [];
  const getSelectedCategoriesList = () => selectedCategory ? selectedCategory.split(',') : [];

  const handleBrandToggle = (brandName: string) => {
    const list = getSelectedBrandsList();
    const newList = list.includes(brandName)
      ? list.filter((b) => b !== brandName)
      : [...list, brandName];
    setSelectedBrand(newList.join(','));
    setPage(1);
  };

  const handleCategoryToggle = (catName: string) => {
    const list = getSelectedCategoriesList();
    const newList = list.includes(catName)
      ? list.filter((c) => c !== catName)
      : [...list, catName];
    setSelectedCategory(newList.join(','));
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="text-center py-8 space-y-2">
        <h1 className="text-3xl md:text-5xl font-light tracking-widest font-luxury uppercase text-foreground">
          The Boutique Catalog
        </h1>
        <div className="h-0.5 w-24 bg-primary mx-auto" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest pt-2">
          {initialFeatured === 'true' ? 'Exclusive Featured Masterpieces' : 'Timeless designs for standard and luxury collections'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch lg:items-start mt-8">
        
        {/* ==================== 1. SIDEBAR FILTERS (DESKTOP) ==================== */}
        <aside className="w-full lg:w-64 bg-card border border-border p-6 rounded-lg space-y-6 flex-shrink-0 hidden lg:block">
          <div className="flex justify-between items-center pb-4 border-b border-border/60">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              Bespoke Filters
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] uppercase font-bold text-primary hover:underline transition-all"
            >
              Reset All
            </button>
          </div>

          {/* Search inside catalog */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Search Title</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full text-xs bg-muted border border-border focus:border-primary/50 rounded pl-3 pr-8 py-2 outline-none"
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-muted-foreground" />
            </div>
          </div>

          {/* Brands list */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Brand</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <button
                onClick={() => { setSelectedBrand(''); setPage(1); }}
                className={`w-full text-left text-xs py-1 px-2 rounded flex items-center justify-between transition-colors ${!selectedBrand ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-muted-foreground'}`}
              >
                All Brands
                {!selectedBrand && <Check className="w-3.5 h-3.5" />}
              </button>
              {availableBrands.map((b) => {
                const list = getSelectedBrandsList();
                const isChecked = list.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => handleBrandToggle(b)}
                    className={`w-full text-left text-xs py-1 px-2 rounded flex items-center justify-between transition-colors ${isChecked ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <span className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        readOnly
                        className="accent-primary rounded w-3 h-3 cursor-pointer"
                      />
                      {b}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories list */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Category</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`w-full text-left text-xs py-1 px-2 rounded flex items-center justify-between transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-muted-foreground'}`}
              >
                All Categories
                {!selectedCategory && <Check className="w-3.5 h-3.5" />}
              </button>
              {availableCategories.map((c) => {
                const list = getSelectedCategoriesList();
                const isChecked = list.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => handleCategoryToggle(c)}
                    className={`w-full text-left text-xs py-1 px-2 rounded flex items-center justify-between transition-colors ${isChecked ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <span className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        readOnly
                        className="accent-primary rounded w-3 h-3 cursor-pointer"
                      />
                      {c}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Price (INR)</h4>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }}
                className="w-1/2 text-xs bg-muted border border-border focus:border-primary/50 rounded px-2.5 py-1.5 outline-none"
              />
              <span className="text-muted-foreground text-xs">-</span>
              <input 
                type="number" 
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }}
                className="w-1/2 text-xs bg-muted border border-border focus:border-primary/50 rounded px-2.5 py-1.5 outline-none"
              />
            </div>
            
            {/* Quick Price Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {([
                { label: 'Under ₹500', min: 0, max: 500 },
                { label: '₹500 - ₹5K', min: 500, max: 5000 },
                { label: 'Over ₹5K', min: 5000, max: '' }
              ] as Array<{ label: string; min: number | ''; max: number | '' }>).map((p) => {
                const isActive = minPrice === p.min && (p.max === '' ? maxPrice === '' : maxPrice === p.max);
                return (
                  <button
                    key={p.label}
                    onClick={() => {
                      if (isActive) {
                        setMinPrice('');
                        setMaxPrice('');
                      } else {
                        setMinPrice(p.min);
                        setMaxPrice(p.max);
                      }
                      setPage(1);
                    }}
                    className={`text-[10px] py-1 px-2.5 rounded-full border transition-all ${
                      isActive 
                        ? 'bg-primary border-primary text-primary-foreground font-semibold' 
                        : 'border-border/60 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ==================== 2. MAIN CATALOG COLUMN ==================== */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Toolbar (Controls & Mobile trigger) */}
          <div className="bg-card border border-border p-4 rounded-lg text-xs font-semibold">
            {/* Mobile View: 2-column grid layout */}
            <div className="grid grid-cols-2 gap-3 sm:hidden w-full">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-border hover:border-primary rounded bg-muted text-foreground transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                Filters
              </button>
              
              {/* Mobile Custom Sort Dropdown */}
              <div className="relative w-full" ref={mobileSortDropdownRef}>
                <button
                  onClick={() => setIsMobileSortOpen(!isMobileSortOpen)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-border hover:border-primary rounded bg-muted text-foreground transition-colors text-center"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {sortBy === 'newest' && 'Newest'}
                    {sortBy === 'price_asc' && 'Price: Low-High'}
                    {sortBy === 'price_desc' && 'Price: High-Low'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
                </button>

                {isMobileSortOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-card border border-border rounded shadow-lg py-1 z-30 animate-fade-in">
                    <button
                      onClick={() => { setSortBy('newest'); setPage(1); setIsMobileSortOpen(false); }}
                      className={`w-full text-center px-4 py-2.5 text-xs transition-colors hover:bg-muted ${sortBy === 'newest' ? 'text-primary font-semibold border-b border-border/10' : 'text-foreground border-b border-border/10'}`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => { setSortBy('price_asc'); setPage(1); setIsMobileSortOpen(false); }}
                      className={`w-full text-center px-4 py-2.5 text-xs transition-colors hover:bg-muted ${sortBy === 'price_asc' ? 'text-primary font-semibold border-b border-border/10' : 'text-foreground border-b border-border/10'}`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => { setSortBy('price_desc'); setPage(1); setIsMobileSortOpen(false); }}
                      className={`w-full text-center px-4 py-2.5 text-xs transition-colors hover:bg-muted ${sortBy === 'price_desc' ? 'text-primary font-semibold' : 'text-foreground'}`}
                    >
                      Price: High to Low
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tablet & Desktop View: Flex Row layout */}
            <div className="hidden sm:flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-border hover:border-primary rounded transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Filters
                </button>
                <p className="text-muted-foreground uppercase tracking-widest">
                  {watches.length} {watches.length === 1 ? 'timepiece' : 'timepieces'} found
                </p>
              </div>

              {/* Tablet & Desktop Custom Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="bg-muted border border-border hover:border-primary/50 outline-none rounded py-1.5 px-3 flex items-center gap-2 transition-colors min-w-[160px] justify-between"
                >
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <ArrowUpDown className="w-3.5 h-3.5 text-primary" /> Sort:
                  </span>
                  <span className="text-foreground">
                    {sortBy === 'newest' && 'Newest Arrivals'}
                    {sortBy === 'price_asc' && 'Price: Low-High'}
                    {sortBy === 'price_desc' && 'Price: High-Low'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200" style={{ transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                
                {isSortOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-card border border-border rounded shadow-lg py-1 z-30 animate-fade-in">
                    <button
                      onClick={() => { setSortBy('newest'); setPage(1); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-muted ${sortBy === 'newest' ? 'text-primary font-semibold' : 'text-foreground'}`}
                    >
                      Newest Arrivals
                    </button>
                    <button
                      onClick={() => { setSortBy('price_asc'); setPage(1); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-muted ${sortBy === 'price_asc' ? 'text-primary font-semibold' : 'text-foreground'}`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => { setSortBy('price_desc'); setPage(1); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-muted ${sortBy === 'price_desc' ? 'text-primary font-semibold' : 'text-foreground'}`}
                    >
                      Price: High to Low
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Watch Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="space-y-3 animate-pulse bg-card p-3 rounded border border-border/40">
                  <div className="aspect-square bg-muted rounded" />
                  <div className="h-3.5 bg-muted rounded w-2/3" />
                  <div className="h-3.5 bg-muted rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : watches.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground font-luxury">No luxury timepieces match your active filters.</p>
              <button 
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {watches.map((watch) => {
                  const watchImg = watch.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=400';
                  const itemLink = typeof window !== 'undefined' ? `${window.location.origin}/watches/${watch.id}` : `https://stylishtick.com/watches/${watch.id}`;
                  const waMessage = `Hi Stylish Tick! I am interested in the ${watch.brand} ${watch.name} (Price: ₹${watch.price.toLocaleString()}). Is it available? Link: ${itemLink}`;
                  
                  return (
                    <Link 
                      key={watch.id}
                      href={`/watches/${watch.id}`}
                      className="group block space-y-3 luxury-card p-3 rounded-lg bg-card border border-border/20 shadow-xs hover:shadow-md transition-all duration-300 relative"
                    >
                      <div className="aspect-square w-full relative bg-muted rounded overflow-hidden">
                        <Image 
                          src={watchImg} 
                          alt={watch.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* WhatsApp Icon Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(`https://wa.me/919699986430?text=${encodeURIComponent(waMessage)}`, '_blank', 'noopener,noreferrer');
                          }}
                          className="absolute top-2 right-2 z-10 bg-[#25D366] hover:bg-[#20ba5a] text-white p-2 rounded-full shadow-md transition-transform duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                          title="Inquire on WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{watch.brand}</p>
                        <h3 className="font-medium text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">{watch.name}</h3>
                        <div className="flex justify-between items-center pt-1">
                          <span className="font-semibold text-primary text-xs">₹{watch.price.toLocaleString()}</span>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{watch.category}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-center gap-4 pt-8 border-t border-border/40">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-border hover:border-primary disabled:opacity-30 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground font-semibold">Page {page}</span>
                <button 
                  disabled={watches.length < limit}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-border hover:border-primary disabled:opacity-30 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ==================== 3. MOBILE FILTER SLIDE-OVER (MOBILE ONLY) ==================== */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-xs bg-card border-r border-border text-foreground flex flex-col h-full shadow-2xl animate-slide-in-left">
              
              <div className="flex justify-between items-center p-6 border-b border-border/60 flex-shrink-0">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Bespoke Filters
                </h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Close filters"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable Filters Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Mobile Search */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Search Title</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="w-full text-xs bg-muted border border-border rounded pl-3 pr-8 py-2 outline-none"
                    />
                    <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-muted-foreground" />
                  </div>
                </div>

                {/* Mobile Brands */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Brand</h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    <button
                      onClick={() => { setSelectedBrand(''); setPage(1); }}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded flex items-center justify-between transition-colors ${!selectedBrand ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      <span>All Brands</span>
                      {!selectedBrand && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {availableBrands.map((b) => {
                      const list = getSelectedBrandsList();
                      const isChecked = list.includes(b);
                      return (
                        <button
                          key={b}
                          onClick={() => handleBrandToggle(b)}
                          className={`w-full text-left text-xs py-1.5 px-2 rounded flex items-center justify-between transition-colors ${isChecked ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                          <span className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              readOnly
                              className="accent-primary rounded w-3 h-3 cursor-pointer"
                            />
                            {b}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Categories */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Category</h4>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    <button
                      onClick={() => { setSelectedCategory(''); setPage(1); }}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded flex items-center justify-between transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      <span>All Categories</span>
                      {!selectedCategory && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {availableCategories.map((c) => {
                      const list = getSelectedCategoriesList();
                      const isChecked = list.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => handleCategoryToggle(c)}
                          className={`w-full text-left text-xs py-1.5 px-2 rounded flex items-center justify-between transition-colors ${isChecked ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                          <span className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              readOnly
                              className="accent-primary rounded w-3 h-3 cursor-pointer"
                            />
                            {c}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Price */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Price (INR)</h4>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }}
                      className="w-1/2 text-xs bg-muted border border-border rounded px-2.5 py-1.5 outline-none focus:border-primary/50"
                    />
                    <span className="text-muted-foreground text-xs">-</span>
                    <input 
                      type="number" 
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }}
                      className="w-1/2 text-xs bg-muted border border-border rounded px-2.5 py-1.5 outline-none focus:border-primary/50"
                    />
                  </div>
                  
                  {/* Mobile Quick Price Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {([
                      { label: 'Under ₹500', min: 0, max: 500 },
                      { label: '₹500 - ₹5K', min: 500, max: 5000 },
                      { label: 'Over ₹5K', min: 5000, max: '' }
                    ] as Array<{ label: string; min: number | ''; max: number | '' }>).map((p) => {
                      const isActive = minPrice === p.min && (p.max === '' ? maxPrice === '' : maxPrice === p.max);
                      return (
                        <button
                          key={p.label}
                          onClick={() => {
                            if (isActive) {
                              setMinPrice('');
                              setMaxPrice('');
                            } else {
                              setMinPrice(p.min);
                              setMaxPrice(p.max);
                            }
                            setPage(1);
                          }}
                          className={`text-[10px] py-1 px-2.5 rounded-full border transition-all ${
                            isActive 
                              ? 'bg-primary border-primary text-primary-foreground font-semibold' 
                              : 'border-border/60 bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Fixed Footer */}
              <div className="p-6 border-t border-border flex-shrink-0 bg-card">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider text-center transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 text-center animate-pulse text-xs text-muted-foreground uppercase tracking-widest">
        Loading boutique catalog...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
