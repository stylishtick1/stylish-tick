'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search, MessageSquare, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({
    '0-0': true, // Keep the first FAQ open by default
  });

  const faqCategories = useMemo<FAQCategory[]>(() => [
    {
      id: "authenticity",
      name: "Authenticity & Quality",
      icon: <ShieldCheck className="w-4 h-4" />,
      items: [
        {
          q: "Are all your watches authentic?",
          a: "Yes, 100%. Every single timepiece sold on Stylish Tick goes through a strict verification check by our certified watchmakers. We inspect serial numbers, casing, and movement parts. We include a Certificate of Authenticity with every order."
        },
        {
          q: "Do watches come with original boxes and papers?",
          a: "Whenever possible, yes! In the product description for each watch, we clearly state whether it includes the original manufacturer box, instruction booklet, and warranty documents."
        },
        {
          q: "What condition are the watches in?",
          a: "We specify the exact condition of every watch (e.g., Brand New, Pre-Owned - Excellent, Vintage). All pre-owned and vintage timepieces are professionally cleaned, serviced, and tested for timing accuracy before they are listed."
        }
      ]
    },
    {
      id: "shipping",
      name: "Shipping & Delivery",
      icon: <Truck className="w-4 h-4" />,
      items: [
        {
          q: "How much does shipping cost?",
          a: "Shipping is 100% free, worldwide. There are no hidden handling fees or surprise charges at checkout."
        },
        {
          q: "Is my watch safe during transit?",
          a: "Yes. Every watch we ship is fully insured. We use premium couriers (such as FedEx or DHL Express) and require a signature upon delivery. All watches are packaged in discreet outer boxes for maximum safety."
        },
        {
          q: "How long does delivery take?",
          a: "We pack and ship all orders within 24 hours of payment. Delivery typically takes 3 to 7 business days depending on your country."
        }
      ]
    },
    {
      id: "returns",
      name: "Returns & Refunds",
      icon: <RefreshCw className="w-4 h-4" />,
      items: [
        {
          q: "Can I return a watch if I change my mind?",
          a: "Absolutely. We offer a hassle-free 14-day return window. If you aren't completely satisfied with your purchase, you can return it in its original, unworn condition with all tags, boxes, and certificates intact for a full refund."
        },
        {
          q: "How do I start a return?",
          a: "Simply contact our support team or email us at support@stylishtick.com. We will send you a pre-paid, fully insured return label and clear instructions on how to package and drop off the box."
        }
      ]
    },
    {
      id: "warranty",
      name: "Warranty & Payments",
      icon: <CreditCard className="w-4 h-4" />,
      items: [
        {
          q: "What does the 2-year warranty cover?",
          a: "Our warranty covers the watch's internal movement and timekeeping accuracy. If your watch stops working or starts losing time due to mechanical issues, we will repair it free of charge. It does not cover wear-and-tear, scratches, or cosmetic damage."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, UPI, and bank transfers."
        }
      ]
    }
  ], []);

  const toggleFAQ = (catIdx: number, itemIdx: number) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter categories and questions based on search term and category selection
  const filteredData = useMemo(() => {
    return faqCategories.map((category, catIdx) => {
      // If we filtered by category and this isn't it, skip items
      if (activeCategory !== 'all' && category.id !== activeCategory) {
        return { ...category, items: [] };
      }

      // Filter items by search term
      const matchedItems = category.items.filter(item => 
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        ...category,
        items: matchedItems
      };
    }).filter(category => category.items.length > 0);
  }, [faqCategories, activeCategory, searchTerm]);

  const hasResults = filteredData.length > 0;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <HelpCircle className="w-10 h-10 text-primary mx-auto stroke-[1.5]" />
        <h1 className="text-3xl font-light font-luxury tracking-widest text-foreground uppercase">Frequently Asked Questions</h1>
        <div className="h-0.5 w-16 bg-primary mx-auto" />
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Find quick and simple answers to common questions about authentication, shipping, returns, and warranty.
        </p>
      </div>

      {/* Interactive Controls */}
      <div className="space-y-6">
        
        {/* Search Input */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search questions or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-xs md:text-sm outline-none transition-all shadow-sm placeholder:text-muted-foreground/60 text-foreground"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-border/40 pb-4">
          <button
            onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeCategory === 'all' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/55'
            }`}
          >
            All Questions
          </button>
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => { setActiveCategory(category.id); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === category.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/55'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Accordions */}
      <div className="space-y-8">
        {hasResults ? (
          filteredData.map((category, catIdx) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-luxury tracking-wide border-b border-border/40 pb-1.5">
                {category.icon}
                <h3 className="text-sm font-semibold uppercase tracking-wider">{category.name}</h3>
              </div>

              <div className="space-y-3">
                {category.items.map((item, itemIdx) => {
                  const key = `${catIdx}-${itemIdx}`;
                  const isOpen = !!openStates[key];
                  return (
                    <div 
                      key={itemIdx} 
                      className="bg-card border border-border rounded-xl text-xs md:text-sm overflow-hidden transition-all duration-300 hover:border-primary/50"
                    >
                      <button
                        onClick={() => toggleFAQ(catIdx, itemIdx)}
                        className="w-full flex justify-between items-center p-5 font-semibold text-foreground text-left hover:bg-muted/30 transition-colors focus:outline-none"
                      >
                        <span className="pr-4">{item.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4.5 h-4.5 text-primary flex-shrink-0" />
                        )}
                      </button>
                      
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-muted-foreground leading-relaxed border-t border-border/10 animate-fade-in text-[11px] md:text-xs">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 space-y-4 bg-muted/30 rounded-2xl border border-dashed border-border max-w-md mx-auto">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">No questions found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search terms or select another category.</p>
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Direct Contact Banner */}
      <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
        <h4 className="font-luxury text-lg text-foreground">Still have questions?</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          If you couldn't find the answer you were looking for, our friendly support team is always ready to assist you.
        </p>
        <div className="pt-2">
          <Link 
            href="/contact" 
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider transition-all duration-300 shadow-sm inline-block"
          >
            Contact Customer Support
          </Link>
        </div>
      </div>

    </div>
  );
}

