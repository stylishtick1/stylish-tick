'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light font-luxury tracking-widest text-foreground uppercase">Boutique Inquiries</h1>
        <div className="h-0.5 w-16 bg-primary mx-auto" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest pt-2">Connect with our dedicated concierge desk</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Contact Info */}
        <div className="lg:col-span-4 bg-card border border-border p-6 rounded-lg space-y-6 text-xs text-muted-foreground">
          <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider border-b border-border pb-3">Contact Details</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Mail className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Email Inquiry</h4>
                <a href="mailto:stylishtick@gmail.com" className="hover:text-primary transition-colors">
                  stylishtick@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex gap-3 items-start">
              <Phone className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Phone Consultation</h4>
                <a href="tel:+919699986430" className="hover:text-primary transition-colors">
                  +91 96999 86430
                </a>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">Mon-Sat: 10 AM - 7 PM IST</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5 fill-current text-[#25D366] flex-shrink-0"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <div>
                <h4 className="font-semibold text-foreground">WhatsApp Support</h4>
                <a 
                  href="https://wa.me/919699986430?text=Hi!%20I'm%20interested%20in%20a%20timepiece%20from%20Stylish%20Tick." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors"
                >
                  Start Chat (+91 96999 86430)
                </a>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Boutique Showroom</h4>
                <p>Coming Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-8 bg-card border border-border p-6 rounded-lg space-y-4">
          <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider border-b border-border pb-3">Send a Secure Message</h3>
          
          {sent && (
            <div className="p-4 bg-primary/10 border border-primary text-primary rounded flex items-center gap-2.5 text-xs">
              <CheckCircle2 className="w-5 h-5" />
              <span>Your message has been sent successfully. Our concierge will contact you shortly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2.5 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2.5 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Subject</label>
              <input 
                type="text" 
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-muted border border-border focus:border-primary/50 rounded px-3.5 py-2.5 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Message</label>
              <textarea 
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-muted border border-border focus:border-primary/50 rounded p-3.5 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || sent}
              className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-primary-foreground font-semibold rounded uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors shadow-lg"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Submit Inquiry
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
