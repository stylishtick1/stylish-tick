'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import api from '../../services/api';

interface Watch {
  id: number;
  name: string;
  brand: string;
  price: number;
  category: string;
  images: Array<{ image_url: string }>;
}

export default function HomePage() {
  const [featuredWatches, setFeaturedWatches] = useState<Watch[]>([]);
  const [trendingWatches, setTrendingWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHomeData() {
      try {
        const [featuredRes, allRes] = await Promise.all([
          api.get('/watches?featured=true&limit=4'),
          api.get('/watches/trending')
        ]);
        setFeaturedWatches(featuredRes.data);
        setTrendingWatches(allRes.data);
      } catch (err) {
        console.error('Error fetching homepage watches:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHomeData();
  }, []);

  const brands = [
    { name: 'Rolex', logo: 'R', image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=300' },
    { name: 'Omega', logo: 'Ω', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300' },
    { name: 'Tommy Hilfiger', logo: 'H', image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=300' },
    { name: 'Titan', logo: 'T', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=300' },
    { name: 'Fossil', logo: 'F', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=300' }
  ];

  return (
    <div className="space-y-24 pb-20">

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex items-center bg-black overflow-hidden py-20 md:py-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600"
            alt="Luxury Watch Background"
            fill
            priority
            sizes="100vw"
            className="w-full h-full object-cover opacity-45 sm:opacity-50 scale-105 animate-[pulse_10s_infinite]"
          />
          {/* Overlay gradient: darker on mobile for perfect readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/75 to-black/95 md:bg-gradient-to-r md:from-black/90 md:via-black/50 md:to-transparent" />
        </div>

        <div className="container mx-auto px-4 z-10 text-white space-y-6 max-w-4xl text-center md:text-left flex flex-col items-center md:items-start">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary font-semibold">
            Define Your Legacy
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight leading-tight md:leading-none font-luxury">
            Timeless Luxury, <br className="hidden sm:inline" />
            <span className="font-semibold gold-text-gradient block sm:inline mt-1 sm:mt-0">Pure Precision.</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-300 font-light max-w-xl leading-relaxed">
            Discover our curated collection of heritage Swiss calibres and modern masterpieces. Crafted for those who appreciate the finer details of time.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/shop"
              className="w-full sm:w-auto text-center px-8 py-3.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider transition-all duration-300 shadow-lg"
            >
              Explore Collection
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto text-center px-8 py-3.5 border border-white/30 hover:border-white text-white hover:bg-white/10 font-semibold rounded text-xs uppercase tracking-wider transition-all duration-300"
            >
              Our Heritage
            </Link>
          </div>
        </div>
      </section>

      {/* 1.5 STATISTICS BANNER */}
      <section className="w-full bg-card border-y border-border/30 py-8 lg:py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 items-center">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="6" />
                    <path d="M12 2v4" />
                    <path d="M12 18v4" />
                    <path d="M4.93 10.17a8 8 0 0 1 14.14 0" />
                    <path d="M19.07 13.83a8 8 0 0 1-14.14 0" />
                    <polyline points="12 9 12 12 13.5 13.5" />
                  </svg>
                ),
                value: "15,000+",
                label: "Watches Sold"
              },
              {
                icon: (
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ),
                value: "50+",
                label: "Luxury Brands"
              },
              {
                icon: (
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                ),
                value: "25",
                label: "Countries Served"
              },
              {
                icon: (
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 11 11 13 15 9" />
                  </svg>
                ),
                value: "100%",
                label: "Authenticity Guarantee"
              }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="flex flex-col sm:flex-row items-center sm:items-start justify-center text-center sm:text-left gap-3 md:gap-4 md:border-r last:md:border-r-0 border-border/20 px-2"
              >
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-serif font-bold text-primary leading-none tracking-wide">
                    {stat.value}
                  </span>
                  <span className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mt-1.5">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. POPULAR BRANDS */}
      <section className="container mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-light tracking-wider font-luxury">Preeminent Brands</h2>
          <div className="h-0.5 w-16 bg-primary mx-auto" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest pt-2">Craftsmanship from legendary makers</p>
        </div>

        <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 pb-4 md:pb-0 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {brands.map((b) => (
            <Link
              key={b.name}
              href={`/shop?brand=${b.name}`}
              className="group relative h-44 md:h-48 w-[140px] min-w-[140px] md:w-auto md:min-w-0 snap-align-start rounded-lg overflow-hidden border border-border/40 bg-card flex flex-col justify-end p-4 transition-all duration-300 hover:border-primary"
            >
              <div className="absolute inset-0 z-0 opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                <Image src={b.image} alt={b.name} fill sizes="(max-width: 640px) 50vw, 20vw" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <div className="z-20 text-white space-y-1">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-serif text-sm font-semibold text-primary">
                  {b.logo}
                </div>
                <h3 className="font-semibold text-sm tracking-wide">{b.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 2.5 CURATED COLLECTIONS */}
      <section className="container mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-light tracking-wider font-luxury">Explore Curated Collections</h2>
          <div className="h-0.5 w-16 bg-primary mx-auto" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest pt-2">Shop by Category</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {[
            {
              title: "Gentlemen’s Horology",
              tagline: "Timeless precision for men.",
              link: "/shop?category=Male Watches",
              image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=600",
              span: "md:col-span-3",
              height: "h-[380px]"
            },
            {
              title: "Ladies' Elegance",
              tagline: "Grace and sophistication.",
              link: "/shop?category=Female Watches",
              image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600",
              span: "md:col-span-3",
              height: "h-[380px]"
            },
            {
              title: "Haute Horlogerie",
              tagline: "Masterpiece complications for collectors.",
              link: "/shop?category=Premium Watches",
              image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=600",
              span: "md:col-span-2",
              height: "h-[320px]"
            },
            {
              title: "Bespoke Cordwainers",
              tagline: "Crafted steps of distinction.",
              link: "/shop?category=Premium Shoes",
              image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=600",
              span: "md:col-span-2",
              height: "h-[320px]"
            },
            {
              title: "Contemporary Elite",
              tagline: "Modern luxury in motion.",
              link: "/shop?category=Shoes",
              image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600",
              span: "md:col-span-2",
              height: "h-[320px]"
            }
          ].map((c) => (
            <Link
              key={c.title}
              href={c.link}
              className={`group relative ${c.span} ${c.height} rounded-lg overflow-hidden border border-border/40 flex flex-col justify-end p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/60`}
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0 transition-transform duration-700 ease-out group-hover:scale-105">
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* Dynamic Premium Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 transition-opacity duration-500 opacity-90 group-hover:opacity-100" />

              {/* Gold Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Card Content */}
              <div className="z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 space-y-2">
                <h3 className="text-xl md:text-2xl font-light tracking-wide text-white group-hover:text-primary transition-colors font-luxury">
                  {c.title}
                </h3>
                <p className="text-xs text-gray-300 font-light opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  {c.tagline}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-primary font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Discover Collection <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="container mx-auto px-4 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-light tracking-wider font-luxury">The Masterpiece Selection</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Handpicked models with exceptional value</p>
          </div>
          <Link href="/shop?featured=true" className="text-xs text-primary hover:text-primary-hover font-semibold uppercase tracking-wider flex items-center gap-1">
            View All Featured <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="space-y-4 animate-pulse">
                <div className="aspect-square bg-muted rounded-lg" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredWatches.map((watch) => {
              const watchImg = watch.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=400';
              return (
                <Link
                  key={watch.id}
                  href={`/watches/${watch.id}`}
                  className="group block space-y-4 luxury-card p-4 rounded-lg bg-card"
                >
                  <div className="aspect-square w-full relative bg-muted rounded overflow-hidden">
                    <Image
                      src={watchImg}
                      alt={watch.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-wider rounded">
                      Featured
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{watch.brand}</p>
                    <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{watch.name}</h3>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-semibold text-primary text-sm">₹{watch.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{watch.category}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. LUXURY MARKETING BANNER */}
      <section className="container mx-auto relative py-24 bg-card border-y border-border overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 lg:opacity-100 hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1200"
            alt="Luxury detail watch"
            fill
            sizes="50vw"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 lg:grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Exquisite Artistry</span>
            <h2 className="text-3xl md:text-5xl font-light font-luxury tracking-wider text-foreground">
              Every detail matters. <br />
              <span className="font-semibold italic">Every second counts.</span>
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
              Our watches undergo rigorous quality testing, ensuring water-resistance, robust magnetic field shielding, and impeccable timing precision. Backed by our comprehensive 2-year boutique warranty.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Authenticity Guaranteed</h4>
                  <p className="text-muted-foreground text-[10px]">100% Inspected & Verified</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Bespoke Shipping</h4>
                  <p className="text-muted-foreground text-[10px]">Fully Insured & Free</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs uppercase font-semibold text-primary hover:text-primary-hover tracking-wider"
              >
                Shop the Complete Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRENDING WATCHES */}
      <section className="container mx-auto px-4 space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-light tracking-wider font-luxury">The Trending Edit</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Most coveted watch designs and footwear acquisitions this season</p>
          </div>
          <Link href="/shop" className="text-xs text-primary hover:text-primary-hover font-semibold uppercase tracking-wider flex items-center gap-1">
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="space-y-4 animate-pulse">
                <div className="aspect-square bg-muted rounded-lg" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingWatches.map((watch) => {
              const watchImg = watch.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=400';
              return (
                <Link
                  key={watch.id}
                  href={`/watches/${watch.id}`}
                  className="group block space-y-4 luxury-card p-4 rounded-lg bg-card"
                >
                  <div className="aspect-square w-full relative bg-muted rounded overflow-hidden">
                    <Image
                      src={watchImg}
                      alt={watch.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{watch.brand}</p>
                    <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{watch.name}</h3>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-semibold text-primary text-sm">₹{watch.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{watch.category}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
