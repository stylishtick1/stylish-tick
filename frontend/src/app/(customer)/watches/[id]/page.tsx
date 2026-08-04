'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Star, Heart, Shield, Award, Sparkles, Plus, Minus, Send, Check, AlertCircle } from 'lucide-react';
import api from '../../../../services/api';
import { useAuthStore } from '../../../../store/authStore';
import { useCartStore } from '../../../../store/cartStore';
import { useWishlistStore } from '../../../../store/wishlistStore';
import { ImageGallery } from '../../../../components/ImageGallery';
import { SpecCard } from '../../../../components/SpecCard';
import { TrustBadge } from '../../../../components/TrustBadge';
import { Clock, Droplet, BadgeCheck, Globe, Battery, Eye, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
interface WatchDetail {
  id: string;
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
  images: Array<{ id: number; image_url: string; image_type: string; display_order: number }>;
  reviews: Array<{ id: number; rating: number; comment: string; created_at: string; user_name: string }>;
  average_rating: number;
  variants?: Array<{
    id: string;
    name: string;
    brand: string;
    price: number;
    strap_material?: string;
    images: Array<{ image_url: string }>;
  }>;
}

interface WatchListItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  images: Array<{ image_url: string }>;
}

export default function WatchDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const isLoggedIn = !!token && !!user;
  
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);

  // States
  const [watch, setWatch] = useState<WatchDetail | null>(null);
  const [relatedWatches, setRelatedWatches] = useState<WatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  
  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch watch details
  async function fetchWatchDetails() {
    try {
      const res = await api.get(`/watches/${id}`);
      setWatch(res.data);
      setError(null);
      
      // Fetch related watches
      const relatedRes = await api.get(`/watches?category=${encodeURIComponent(res.data.category)}&limit=4`);
      // Filter out the current watch
      const filtered = relatedRes.data.filter((w: WatchListItem) => w.id !== id);
      setRelatedWatches(filtered);
    } catch (err: any) {
      setError('Failed to load timepiece details. It may not exist.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchWatchDetails();
      setActiveImageIdx(0);
      setQuantity(1);
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!watch) return;
    setAddingToCart(true);
    try {
      await addItem(watch, quantity, isLoggedIn);
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 3000);
    } catch (err) {
      alert('Failed to add item to collection.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!watch) return;
    try {
      await addItem(watch, quantity, isLoggedIn);
      router.push('/checkout');
    } catch (err) {
      alert('Unable to process request.');
    }
  };
  const handleWhatsAppInquiry = () => {
    if (!watch) return;
    // Replace with your actual WhatsApp business number (include country code, e.g. 91 for India)
    const whatsappNumber = "919699986430"; 
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = `Hi Stylish Tick, I am interested in inquiring about this timepiece:\n\n*Name:* ${watch.name}\n*Brand:* ${watch.brand}\n*Price:* ₹${watch.price.toLocaleString()}\n*Link:* ${pageUrl}\n\nIs this timepiece currently available?`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setReviewError(null);
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${id}`, {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      // Reload details to show new review
      fetchWatchDetails();
    } catch (err: any) {
      setReviewError(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-2/3" />
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-24 bg-muted rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !watch) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-muted-foreground font-luxury">{error || 'Timepiece not found.'}</p>
        <Link href="/shop" className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const galleryImages = watch.images.length > 0 
    ? watch.images 
    : [{ id: 0, image_url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600', image_type: 'Front View', display_order: 0 }];

  const currentGalleryImg = galleryImages[activeImageIdx]?.image_url;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": watch.name,
    "image": galleryImages[0]?.image_url,
    "description": watch.description,
    "brand": {
      "@type": "Brand",
      "name": watch.brand
    },
    "offers": {
      "@type": "Offer",
      "price": watch.price,
      "priceCurrency": "INR",
      "availability": watch.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    ...(watch.reviews.length > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": watch.average_rating,
        "reviewCount": watch.reviews.length
      }
    } : {})
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 1. PRODUCT METADATA & ACTIONS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full relative bg-card border border-border rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src={currentGalleryImg} 
              alt={watch.name}
              className="w-full h-full object-cover transition-all duration-300 hover:scale-110"
            />
            {watch.stock === 0 && (
              <span className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">
                Out Of Stock
              </span>
            )}
          </div>
          
          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 bg-card border rounded overflow-hidden flex-shrink-0 transition-colors ${activeImageIdx === idx ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                >
                  <img src={img.image_url} alt={img.image_type} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Controls */}
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary font-semibold uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-full">
                {watch.brand}
              </span>
              {watch.featured && (
                <span className="text-xs text-accent-foreground font-semibold uppercase tracking-wider bg-accent px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Featured Edition
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-light font-luxury tracking-wide text-foreground mt-2">{watch.name}</h1>
            
            {/* Rating summary */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="flex text-primary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.round(watch.average_rating) ? 'fill-primary' : 'text-muted'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({watch.reviews.length} {watch.reviews.length === 1 ? 'Review' : 'Reviews'})
              </span>
            </div>
          </div>

          <div className="text-2xl font-semibold text-primary">
            ₹{watch.price.toLocaleString()}
          </div>

          {/* Color/Strap Variants Selector */}
          {watch.variants && watch.variants.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Available Dial & Strap Options:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {/* Active watch mini option */}
                <div className="border border-primary rounded p-1 bg-primary/5 flex items-center gap-2 cursor-default">
                  <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={watch.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=100'} 
                      alt={watch.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="text-[9px] pr-1">
                    <p className="font-semibold text-foreground line-clamp-1">{watch.strap_material || 'Default'}</p>
                    <p className="text-primary font-bold">₹{watch.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Sibling variants */}
                {watch.variants.map((v) => {
                  const vImg = v.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=100';
                  return (
                    <Link
                      key={v.id}
                      href={`/watches/${v.id}`}
                      className="border border-border/80 hover:border-primary/50 hover:bg-muted/10 rounded p-1 flex items-center gap-2 transition-all"
                    >
                      <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                        <img src={vImg} alt={v.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[9px] pr-1">
                        <p className="font-semibold text-muted-foreground line-clamp-1">{v.strap_material || 'Variant'}</p>
                        <p className="text-muted-foreground font-semibold">₹{v.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {watch.description}
          </p>

          {/* Specs icons summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 border-y border-border/60 py-4 text-[11px] sm:text-xs">
            <div className="text-center space-y-1">
              <span className="text-muted-foreground uppercase text-[9px] tracking-wider font-semibold">Movement</span>
              <p className="font-semibold text-foreground">{watch.movement_type || 'N/A'}</p>
            </div>
            <div className="text-center space-y-1 border-x border-border/40">
              <span className="text-muted-foreground uppercase text-[9px] tracking-wider font-semibold">Water Resist</span>
              <p className="font-semibold text-foreground">{watch.water_resistance || 'N/A'}</p>
            </div>
            <div className="text-center space-y-1">
              <span className="text-muted-foreground uppercase text-[9px] tracking-wider font-semibold">Warranty</span>
              <p className="font-semibold text-foreground">{watch.warranty_years} Years</p>
            </div>
          </div>

          {/* Controls */}
          {watch.stock > 0 ? (
            <div className="space-y-4 pt-2">
              {watch.stock <= 2 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-2 animate-pulse w-fit">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Hurry! Only {watch.stock} timepiece{watch.stock > 1 ? 's' : ''} left in stock</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</span>
                <div className="flex items-center border border-border rounded bg-muted/30">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-semibold">{quantity}</span>
                  <button 
                    onClick={() => quantity < watch.stock && setQuantity(quantity + 1)}
                    disabled={quantity >= watch.stock}
                    className="p-2 hover:bg-muted text-muted-foreground disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">({watch.stock} units available)</span>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="flex gap-3 w-full sm:flex-1">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 py-3.5 bg-card border border-primary hover:bg-primary/5 text-primary font-semibold rounded text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    {addingToCart ? (
                      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : actionSuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    {actionSuccess ? 'Added' : 'Add to Collection'}
                  </button>
                  
                  {isLoggedIn && (
                    <button
                      onClick={() => toggleWishlist(watch, isLoggedIn)}
                      className={`p-3.5 border rounded transition-colors flex items-center justify-center ${isInWishlist(watch.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50 text-muted-foreground'}`}
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(watch.id) ? 'fill-primary' : ''}`} />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={handleBuyNow}
                  className="w-full sm:flex-1 py-3.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs uppercase tracking-widest transition-colors shadow-lg text-center"
                >
                  Buy Timepiece
                </button>
              </div>

              {/* WhatsApp Inquiry CTA */}
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold rounded text-xs uppercase tracking-widest transition-colors shadow-md text-center flex items-center justify-center gap-2 mt-3"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.067 5.448 5.513.002 12.224 0c3.25.002 6.305 1.268 8.604 3.567 2.3 2.3 3.561 5.357 3.559 8.611-.004 6.776-5.451 12.22-12.219 12.221h-.003c-2.013-.002-3.993-.493-5.779-1.428L0 24zm6.59-4.846c1.6.95 2.72 1.488 4.28 1.488h.01c5.54-.002 10.05-4.51 10.054-10.05.002-2.684-1.038-5.207-2.93-7.098C16.02 1.597 13.5 1.558 10.82 1.558 5.28 1.56 2.76 6.07 2.76 11.61c-.002 1.63.43 3.22 1.25 4.63l-1.03 3.75 3.87-.99zM15.76 13.43c-.28-.14-1.68-.83-1.94-.93-.26-.1-.45-.15-.64.15-.19.29-.73.93-.9 1.12-.17.19-.34.22-.62.08-.28-.14-1.2-.44-2.28-1.4-.84-.75-1.41-1.68-1.57-1.96-.17-.28-.02-.43.12-.57.13-.13.28-.33.43-.49.14-.17.19-.28.28-.47.1-.19.05-.36-.02-.5-.08-.14-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49-.17-.01-.36-.01-.56-.01-.19 0-.5.07-.77.36-.26.29-1.02 1-1.02 2.43 0 1.44 1.05 2.82 1.2 3 .15.19 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.71.22 1.35.19 1.86.11.57-.08 1.68-.69 1.92-1.36.24-.67.24-1.25.17-1.36-.07-.11-.26-.18-.54-.32z"/>
                </svg>
                Inquire on WhatsApp
              </button>
            </div>
          ) : (
            <div className="p-4 bg-muted border border-border text-muted-foreground text-center rounded text-sm font-semibold">
              Currently Unavailable (Sold Out)
            </div>
          )}

          {/* Boutique Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/40 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span>100% Genuine Certified Timepieces</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary flex-shrink-0" />
              <span>Complimentary Concierge Shipping</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SPECIFICATIONS TABLE */}
      <section className="bg-card border border-border p-6 md:p-8 rounded-lg space-y-6">
        <h2 className="text-xl font-light font-luxury uppercase tracking-wider text-foreground">
          Technical Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-xs">
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Brand</span>
            <span className="font-semibold">{watch.brand}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Strap Material</span>
            <span className="font-semibold">{watch.strap_material || 'Genuine Leather'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Category</span>
            <span className="font-semibold">{watch.category}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Water Resistance</span>
            <span className="font-semibold">{watch.water_resistance || '50 Meters'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Movement</span>
            <span className="font-semibold">{watch.movement_type || 'Swiss Automatic'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/50">
            <span className="text-muted-foreground">Boutique Warranty</span>
            <span className="font-semibold">{watch.warranty_years} Years</span>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT REVIEWS & REVIEWS SUBMISSION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Review list */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-light font-luxury uppercase tracking-wider text-foreground">
            Boutique Reviews
          </h2>
          
          {watch.reviews.length === 0 ? (
            <div className="p-8 bg-card border border-border text-center text-muted-foreground text-xs rounded">
              No reviews have been written for this watch yet. Be the first to review!
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {watch.reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-card border border-border/50 rounded space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-xs">{rev.user_name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-primary">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-primary' : 'text-muted'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write review form */}
        <div className="bg-card border border-border p-6 rounded-lg space-y-4 h-fit">
          <h3 className="font-semibold text-sm uppercase tracking-wider">Leave a Review</h3>
          {isLoggedIn ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              
              {/* Star selector */}
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold uppercase text-[9px] tracking-wider">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-primary hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-primary' : 'text-muted-foreground/30'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text area */}
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold uppercase text-[9px] tracking-wider">Comments</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience with this timepiece..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-muted border border-border focus:border-primary/50 rounded p-3 outline-none resize-none"
                />
              </div>

              {reviewSuccess && (
                <p className="text-[10px] text-primary font-medium">Review submitted successfully!</p>
              )}
              {reviewError && (
                <p className="text-[10px] text-destructive font-medium">{reviewError}</p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-primary-foreground font-semibold uppercase tracking-widest rounded flex items-center justify-center gap-1.5 transition-colors shadow"
              >
                {submittingReview ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Post Review
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-center text-xs p-4 bg-muted/50 rounded">
              <p className="text-muted-foreground">You must be logged in to leave reviews.</p>
              <Link href="/login" className="block w-full py-2 border border-primary text-primary hover:bg-primary/10 rounded font-semibold uppercase tracking-wider">
                Log In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. RELATED PRODUCTS */}
      {relatedWatches.length > 0 && (
        <section className="space-y-8 pt-6 border-t border-border/50">
          <h2 className="text-xl font-light font-luxury uppercase tracking-wider text-foreground text-center">
            Complementary Timepieces
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedWatches.map((watch) => {
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
                    <img 
                      src={watchImg} 
                      alt={watch.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* WhatsApp Icon Button */}
                    <a
                      href={`https://wa.me/919699986430?text=${encodeURIComponent(waMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="absolute top-2 right-2 z-10 bg-[#25D366] hover:bg-[#20ba5a] text-white p-2 rounded-full shadow-md transition-transform duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
                      title="Inquire on WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
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
        </section>
      )}

    </div>
  );
}
