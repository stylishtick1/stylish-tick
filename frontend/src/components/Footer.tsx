'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#050505] text-[#E5E5E5] border-t border-[rgba(176,141,87,0.12)] font-sans mt-10 transition-colors duration-300">
      
      {/* Container wrapper */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 pb-6">
        
        {/* 1. MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* COLUMN 1: Brand & Contact Info */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex flex-col select-none">
              <span className="text-2xl lg:text-[28px] font-bold tracking-[0.2em] font-serif text-white">
                STYLISH TICK
              </span>
              <p className="mt-1 text-xs font-serif italic text-[#B08D57]/80">
                "Time is the ultimate luxury."
              </p>  
            </div>
            
            {/* Subtle Gold Divider */}
            <div className="w-10 border-t border-[rgba(176,141,87,0.25)]"></div>

            {/* Contact Details */}
            <div className="space-y-2 text-sm text-[#9E9E9E]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#B08D57] font-bold min-w-[70px]">Concierge:</span>
                <a href="tel:+919699986430" className="hover:text-[#B08D57] transition-colors">
                  +91 96999 86430
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#B08D57] font-bold min-w-[70px]">WhatsApp:</span>
                <a 
                  href="https://wa.me/919699986430?text=Hi!%20I'm%20interested%20in%20a%20timepiece%20from%20Stylish%20Tick." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#B08D57] transition-colors"
                >
                  +91 96999 86430
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#B08D57] font-bold min-w-[70px]">Email:</span>
                <a href="mailto:stylishtick@gmail.com" className="hover:text-[#B08D57] transition-colors">
                  stylishtick@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#B08D57] font-bold min-w-[70px]">Boutique:</span>
                <span className="text-[#9E9E9E] italic text-xs">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2 – Collections / Popular Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B08D57] select-none">
              Popular Categories
            </h3>
            <ul className="space-y-2 text-[14px] text-[#9E9E9E]">
              {[
                { label: 'Luxury Watches', href: '/shop?category=Luxury' },
                { label: 'New Arrivals', href: '/shop?sort=newest' },
                { label: 'Best Sellers', href: '/shop?featured=true' },
                { label: 'Limited Editions', href: '/shop?featured=true' },
                { label: 'Vintage Collection', href: '/shop?category=Vintage' }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#B08D57] transition-all duration-300 hover:translate-x-[2px] inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 – Customer Service */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B08D57] select-none">
              Customer Service
            </h3>
            <ul className="space-y-2 text-[14px] text-[#9E9E9E]">
              {[
                { label: 'Contact Us', href: '/contact' },
                { label: 'Track Order', href: '/profile' },
                { label: 'Shipping Information', href: '/faq#shipping' },
                { label: 'Returns & Refunds', href: '/faq#returns' },
                { label: 'Warranty Policy', href: '/faq#warranty' },
                { label: 'FAQ', href: '/faq' }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="hover:text-[#B08D57] transition-all duration-300 hover:translate-x-[2px] inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 – The Stylish Tick Circle */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B08D57] select-none">
              The Stylish Tick Circle
            </h3>
            <p className="text-[14px] text-[#9E9E9E] leading-relaxed">
              Receive early access to rare releases, collector editions, and private events.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-2.5 pt-1">
              <div className="flex border border-[rgba(176,141,87,0.15)] focus-within:border-[#B08D57] rounded bg-[#0a0a0a] transition-all duration-300 p-0.5">
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-transparent outline-none py-2 px-2.5 text-white placeholder-zinc-600"
                />
                <button 
                  type="submit" 
                  className="bg-[#B08D57] hover:bg-[#9c7b49] text-black font-bold uppercase tracking-wider text-[10px] px-3.5 rounded transition-all duration-300 shrink-0"
                >
                  {subscribed ? 'Joined' : 'Join'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* 3. BOTTOM BAR */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-5 pb-2 text-[11px] text-[#8C8C8C] border-t border-[rgba(176,141,87,0.08)]">
          
          {/* Left copyright */}
          <div className="w-full lg:w-1/4 text-center lg:text-left select-none">
            <p>© 2026 Stylish Tick Geneva</p>
          </div>
          
          {/* Center policies */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 lg:w-2/4">
            {[
              { label: "Privacy Policy", href: "#" },
              { label: "Terms of Service", href: "#" },
              { label: "Shipping & Returns", href: "#" },
              { label: "Accessibility", href: "#" },
              { label: "Sitemap", href: "#" }
            ].map((link) => (
              <a 
                key={link.label}
                href={link.href} 
                className="hover:text-[#B08D57] transition-all duration-300 relative pb-0.5 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#B08D57] transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Right Designed & Top trigger */}
          <div className="flex items-center justify-center lg:justify-end gap-3.5 w-full lg:w-1/4">
            {/* Instagram Icon */}
            <a 
              href="https://www.instagram.com/the_stylish_tick?igsh=dXJ6MTE4ODBscWYx" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_12px_rgba(238,42,123,0.4)] flex items-center justify-center"
              title="Follow us on Instagram"
              aria-label="Instagram"
            >
              <svg className="w-6.5 h-6.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            
            <button 
              onClick={scrollToTop}
              className="p-1.5 border border-[#B08D57]/20 hover:border-[#B08D57] text-[#B08D57] hover:bg-[#B08D57]/5 rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center"
              title="Back to Top"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
