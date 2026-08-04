import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Truck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-20">
      
      {/* 1. Header Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-primary font-bold">About Stylish Tick</span>
        <h1 className="text-3xl md:text-5xl font-light font-luxury tracking-wider text-foreground leading-tight">
          Watch collecting, <br />
          <span className="font-semibold gold-text-gradient">made simple.</span>
        </h1>
        <div className="h-0.5 w-16 bg-primary mx-auto my-3" />
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          We believe finding your dream watch should be exciting, safe, and completely transparent. Whether you're buying your very first timepiece or adding to a collection, we are here to guide you every step of the way.
        </p>
      </div>

      {/* 2. Main Narrative & Image Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-light font-luxury tracking-wide text-foreground">
            Why we started Stylish Tick
          </h2>
          <div className="space-y-4 text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
            <p>
              Buying premium watches online is often stressful. It's easy to worry about counterfeits, hidden service fees, and whether the watch is in good working order.
            </p>
            <p>
              We built Stylish Tick to solve this. We select only the best watches, authenticate them rigorously, and back them with a solid warranty. We handle the hard details so you can shop with 100% confidence.
            </p>
          </div>
          
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Certified watchmakers inspecting every piece</span>
            </div>
          </div>
        </div>
        
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-muted shadow-lg group">
          <img 
            src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800" 
            alt="Luxury Watch detail"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      </section>

      {/* 3. Core Promises */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-3xl font-light font-luxury tracking-widest uppercase">Our Three Promises</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">How we protect and serve you</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-card border border-border hover:border-primary p-8 rounded-xl space-y-4 luxury-card transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">100% Genuine</h3>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Every watch is fully inspected and verified by our certified watchmakers. We guarantee authenticity or a full refund.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border hover:border-primary p-8 rounded-xl space-y-4 luxury-card transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Sparkles className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">2-Year Warranty</h3>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              We stand by our quality. All watches include a 2-year warranty covering timing accuracy and inner movements.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border hover:border-primary p-8 rounded-xl space-y-4 luxury-card transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Truck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-semibold text-foreground text-sm tracking-wide uppercase">Free Insured Shipping</h3>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              No surprise delivery costs. We pack securely and ship fully insured to your door for free, with signature required.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Simple Process */}
      <section className="bg-muted/40 border border-border rounded-2xl p-8 md:p-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-light font-luxury tracking-widest uppercase">How it works</h2>
          <p className="text-xs text-muted-foreground">Getting your dream timepiece is just three simple steps away</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <div className="space-y-2 relative text-center md:text-left">
            <div className="text-4xl font-light font-luxury text-primary/30">01</div>
            <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">Choose your watch</h4>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Browse our curated collection of verified models. Use filters to find your preferred brand, style, and size.
            </p>
          </div>

          <div className="space-y-2 relative text-center md:text-left">
            <div className="text-4xl font-light font-luxury text-primary/30">02</div>
            <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">Expert Inspection</h4>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Before the watch ships, our team runs a final check on authenticity, accuracy, and water resistance.
            </p>
          </div>

          <div className="space-y-2 relative text-center md:text-left">
            <div className="text-4xl font-light font-luxury text-primary/30">03</div>
            <h4 className="font-semibold text-sm text-foreground uppercase tracking-wider">Insured Delivery</h4>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Receive your package securely. Open the boutique box, put on your watch, and wear it with confidence.
            </p>
          </div>

        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="text-center bg-card border border-border rounded-2xl p-8 md:p-12 space-y-6 max-w-3xl mx-auto shadow-md">
        <h3 className="text-xl md:text-2xl font-light font-luxury tracking-wide text-foreground">
          Ready to find your perfect timepiece?
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Browse our collections now. All watches are authenticated, guaranteed, and ready to ship.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link 
            href="/shop" 
            className="px-8 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded text-xs uppercase tracking-wider transition-all duration-300 shadow-md inline-flex items-center gap-2"
          >
            Explore the Shop <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/contact" 
            className="px-8 py-3 border border-border hover:border-foreground text-foreground hover:bg-muted font-semibold rounded text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center"
          >
            Ask a Question
          </Link>
        </div>
      </section>

    </div>
  );
}

