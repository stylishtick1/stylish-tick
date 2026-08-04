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
    <footer className="w-full bg-[#050505] text-[#E5E5E5] border-t border-[rgba(176,141,87,0.15)] font-sans mt-10 transition-colors duration-300">
      
      {/* Container wrapper */}
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 pt-[50px] pb-[30px]">
        
        {/* 1. MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
                <div className="space-y-3 lg:col-span-1 -mt-4">
          <div className="flex flex-col select-none">
  <span className="text-4xl lg:text-[40px] font-bold tracking-[0.15em] font-serif text-white">
    STYLISH TICK
  </span>

  <p className="mt-1 text-[15px] font-serif italic text-[#E5E5E5]">
    "Time is the ultimate luxury."
  </p>  
</div>
                       
            {/* Subtle Gold Divider */}
            <div className="w-12 border-t border-[rgba(176,141,87,0.3)] my-4"></div>

            {/* Contact Details */}
            <div className="space-y-3.5 text-[15px] text-[#9E9E9E]">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#B08D57] font-bold">
                  ☎ Luxury Concierge
                </span>
                <a href="tel:+919699986430" className="hover:text-[#B08D57] transition-colors mt-0.5">
                  +91 96999 86430
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#B08D57] font-bold">
                  💬 WhatsApp Support
                </span>
                <a 
                  href="https://wa.me/919699986430?text=Hi!%20I'm%20interested%20in%20a%20timepiece%20from%20Stylish%20Tick." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#B08D57] transition-colors mt-0.5"
                >
                  +91 96999 86430
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#B08D57] font-bold">
                  ✉ Email
                </span>
                <a href="mailto:stylishtick@gmail.com" className="hover:text-[#B08D57] transition-colors mt-0.5">
                  stylishtick@gmail.com
                </a>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#B08D57] font-bold">
                  📍 Flagship Boutique
                </span>
                <span className="mt-0.5 text-[#9E9E9E]">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Social Icons (Large 42px) */}
            <div className="flex space-x-3 pt-2">
              {[
                { 
                  icon: (
                    <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ), 
                  href: "#",
                  label: "Instagram"
                },
                { 
                  icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  ), 
                  href: "#",
                  label: "Facebook"
                },
                { 
                  icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ), 
                  href: "#",
                  label: "Twitter (X)"
                },
                { 
                  icon: (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ), 
                  href: "#",
                  label: "YouTube"
                }
              ].map((soc, idx) => (
                <a 
                  key={idx} 
                  href={soc.href} 
                  className="w-[42px] h-[42px] border border-[rgba(176,141,87,0.15)] hover:border-[#B08D57] text-[#E5E5E5] rounded-full transition-all duration-300 hover:scale-110 hover:shadow-[0_0_10px_rgba(176,141,87,0.25)] flex items-center justify-center hover:bg-[#B08D57]/5"
                  aria-label={soc.label}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          {/* COLUMN 2 – Collections / Popular Categories */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.25em] text-[#B08D57] select-none">
              Popular Categories
            </h3>
            <ul className="space-y-3 text-[15px] text-[#9E9E9E]">
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
                    className="hover:text-[#B08D57] transition-all duration-300 hover:translate-x-[4px] inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3 – Customer Service */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.25em] text-[#B08D57] select-none">
              Customer Service
            </h3>
            <ul className="space-y-3 text-[15px] text-[#9E9E9E]">
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
                    className="hover:text-[#B08D57] transition-all duration-300 hover:translate-x-[4px] inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 4 – The Stylish Tick Circle */}
          <div className="space-y-5">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.25em] text-[#B08D57] select-none">
              Join The Stylish Tick Circle
            </h3>
            <p className="text-[15px] text-[#9E9E9E] leading-relaxed">
              Receive early access to rare releases, collector editions, and private events.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col space-y-4 pt-1">
              <div className="relative border border-[rgba(176,141,87,0.15)] focus-within:border-[#B08D57] focus-within:shadow-[0_0_15px_rgba(176,141,87,0.15)] rounded bg-[#0a0a0a] transition-all duration-300 p-1 flex items-center">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-[15px] bg-transparent outline-none border-none py-2.5 pl-3 text-white placeholder-zinc-500"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-1000 bg-[#B08D57] hover:bg-[#9c7b49] text-black font-semibold uppercase tracking-[0.18em] text-[11px] py-3.5 rounded transition-all duration-300 hover:shadow-[0_0_20px_rgba(176,141,87,0.4)] flex items-center justify-center gap-2"
              >
                {subscribed ? 'Subscribed' : 'Join The Circle'}
              </button>
              
              <span className="text-[12px] text-[#9E9E9E] tracking-wider text-center block mt-2">
                5,000+ Collectors Worldwide
              </span>
            </form>
          </div>

        </div>

        {/* 2. STATISTICS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 py-8 border-t border-b border-[rgba(226, 136, 0, 0.28)] mt-8 items-center">
          {[
            {
              icon: (
                <svg className="w-10 h-10 text-[#B08D57]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg className="w-10 h-10 text-[#B08D57]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ),
              value: "50+",
              label: "Luxury Brands"
            },
            {
              icon: (
                <svg className="w-10 h-10 text-[#B08D57]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg className="w-10 h-10 text-[#B08D57]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
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
              className="flex items-center justify-start lg:justify-center gap-4 lg:border-r last:lg:border-r-0 border-[rgba(176,141,87,0.15)] px-4"
            >
              <div className="flex-shrink-0">
                {stat.icon}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[26px] lg:text-[28px] font-serif font-bold text-[#B08D57] leading-none tracking-wide">
                  {stat.value}
                </span>
                <span className="text-[10px] lg:text-[11px] uppercase tracking-[0.18em] text-[#9E9E9E] font-semibold mt-1">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 3. PAYMENT & TRUST SECTION */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8 border-t border-b border-[rgba(176,141,87,0.15)] py-[30px]">
          
          {/* Payment Badges */}
          <div className="flex items-center flex-wrap gap-3.5 justify-center">
            {[
              {
                name: "Visa",
                icon: (
                  <svg className="h-[15px] w-auto text-white" viewBox="0 0 120 38" fill="currentColor">
                    <path d="M15.558 29.8375L21.0375 5.1625H10.6385C7.058 5.1625 6.188 8.0325 6.188 8.0325L1.808 29.8375H11.854L13.864 19.605H26.115L27.245 29.8375H38.961L31.245 5.1625H20.628L15.558 29.8375ZM50.686 29.8375L57.306 5.1625H67.857L61.237 29.8375H50.686ZM84.475 14.78C84.475 24.39 74.52 24.51 74.52 29.56C74.52 34.61 86.375 33.7 90.287 30.52L91.71 22.16C91.71 22.16 87.503 24.26 80.983 24.26C74.464 24.26 64.624 20.84 64.624 11.53C64.624 2.22 75.908.16 80.297.16C84.685.16 94.61 2.22 94.61 11.83C94.61 21.14 84.475 19.93 84.475 14.78ZM119.98 29.8375L112.26 5.1625H101.65L92.072 29.8375H102.12L104.13 19.605H116.38L117.51 29.8375H119.98Z" />
                  </svg>
                )
              },
              {
                name: "Mastercard",
                icon: (
                  <svg className="h-7 w-auto" viewBox="0 0 32 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#EB001B" />
                    <circle cx="22" cy="10" r="10" fill="#F79E1B" />
                    <path d="M16 3.1c1.8 1.8 2.9 4.3 2.9 6.9s-1.1 5.1-2.9 6.9c-1.8-1.8-2.9-4.3-2.9-6.9s1.1-5.1 2.9-6.9z" fill="#FF5F00" />
                  </svg>
                )
              },
              {
                name: "American Express",
                icon: (
                  <svg className="h-[22px] w-auto text-[#0170B9]" viewBox="0 0 120 40" fill="currentColor">
                    <rect width="120" height="40" rx="3" fill="#0170B9" />
                    <path d="M13.6 28h-3l-1.5-3.3H4.4L2.9 28H0l4.5-9.3h3L12 28zm-5.7-5.5L6.4 19l-1.5 3.5h3zm14.1 5.5h-5.2V18.7h5.2v3.4h2.2v-3.4h5.2V28h-5.2v-3.4H22v3.4zm14.3-9.3v3.4h-5.2v1.5h4.6v3.4H26V18.7h10.3zm12.3 9.3l-2.4-3.5h-2.1V28h-5.2V18.7h7.2c2.6 0 4.2 1.4 4.2 3.1 0 1.2-.8 2.2-2 2.7l2.8 3.5h-4.5zm-4.5-5.9h2c.8 0 1.2-.4 1.2-1 0-.6-.4-1-1.2-1h-2v2zm13.1 5.9h-5.2V18.7h5.2V28zm14.3-9.3c0-2.4 1.8-3.4 4.2-3.4 2.4 0 4.2 1 4.2 3.4v2.5H83V28h-5.2V18.7zm5.2 2.5h2v-1.2c0-.5-.4-.9-1-.9s-1 .4-1 .9v1.2zm14.3 6.8V18.7h3.2l2.4 5.3 2.4-5.3h3.2v9.3h-4.2V23l-1.4 3h-1 l-1.4-3v5h-3.2z" fill="#FFF" />
                  </svg>
                )
              },
              {
                name: "PayPal",
                icon: (
                  <svg className="h-[18px] w-auto text-white" viewBox="0 0 120 32" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M76.2315 24.67C75.8559 27.1343 73.9727 27.1343 72.1505 27.1343H71.1141L71.8414 22.5332C71.8848 22.2553 72.1248 22.0508 72.4065 22.0508H72.8822C74.1224 22.0508 75.2934 22.0508 75.8975 22.7563C76.2589 23.1785 76.3679 23.8052 76.2315 24.67ZM75.4387 18.2401H68.5683C68.0979 18.2401 67.6984 18.5818 67.6249 19.0456L64.847 36.6499C64.7921 36.9969 65.0613 37.3112 65.4121 37.3112H68.9377C69.2663 37.3112 69.5462 37.0722 69.5976 36.7482L70.386 31.7567C70.4586 31.2929 70.859 30.9512 71.3285 30.9512H73.5023C78.0279 30.9512 80.6402 28.7631 81.3223 24.4248C81.6297 22.5288 81.3347 21.0382 80.4462 19.9945C79.4692 18.8474 77.7374 18.2401 75.4387 18.2401ZM27.2281 24.67C26.8525 27.1343 24.9693 27.1343 23.1471 27.1343H22.1107L22.838 22.5332C22.8814 22.2553 23.1214 22.0508 23.4031 22.0508H23.8788C25.119 22.0508 26.29 22.0508 26.8941 22.7563C27.2556 23.1785 27.3645 23.8052 27.2281 24.67ZM26.4353 18.2401H19.5649C19.0945 18.2401 18.695 18.5818 18.6215 19.0456L15.8436 36.6499C15.7887 36.9969 16.0571 37.3112 16.4087 37.3112H19.6898C20.1593 37.3112 20.5588 36.9695 20.6323 36.5065L21.3826 31.7567C21.4552 31.2929 21.8556 30.9512 22.3251 30.9512H24.4989C29.0245 30.9512 31.6368 28.7631 32.3189 24.4248C32.6263 22.5288 32.3313 21.0382 31.4428 19.9945C30.4658 18.8474 28.734 18.2401 26.4353 18.2401ZM42.3858 30.9899C42.0678 32.8683 40.5761 34.1296 38.6724 34.1296C37.7184 34.1296 36.954 33.8225 36.4632 33.2418C35.9769 32.6665 35.7935 31.8459 35.9477 30.9333C36.2435 29.0709 37.7601 27.7697 39.6344 27.7697C40.569 27.7697 41.3272 28.0795 41.8277 28.6655C42.3317 29.2559 42.5302 30.0809 42.3858 30.9899ZM46.9708 24.591H43.6808C43.3992 24.591 43.1591 24.7955 43.1148 25.0743L42.9704 25.9931L42.741 25.6603C42.0279 24.6273 40.4396 24.2812 38.854 24.2812C35.2195 24.2812 32.1147 27.0341 31.5106 30.8943C31.1961 32.8205 31.6426 34.6607 32.7357 35.9451C33.7393 37.1251 35.1717 37.6163 36.8787 37.6163C39.8089 37.6163 41.4335 35.7362 41.4335 35.7362L41.2865 36.6497C41.2316 36.9967 41.5 37.311 41.8525 37.311H44.8147C45.2851 37.311 45.6846 36.9702 45.7581 36.5063L47.5368 25.2523C47.5917 24.9053 47.3224 24.591 46.9708 24.591ZM91.3887 30.9899C91.0707 32.8683 89.579 34.1296 87.6754 34.1296C86.7213 34.1296 85.9569 33.8225 85.4661 33.2418C84.9789 32.6665 84.7965 31.8459 84.9506 30.9333C85.2465 29.0709 86.763 27.7697 88.6374 27.7697C89.5719 27.7697 90.3302 28.0795 90.8306 28.6655C91.3347 29.2559 91.5331 30.0809 91.3887 30.9899ZM95.9737 24.591H92.6838C92.4021 24.591 92.162 24.7955 92.1177 25.0743L91.9734 25.9931L91.743 25.6603C91.0308 24.6273 89.4426 24.2812 87.857 24.2812C84.2225 24.2812 81.1177 27.0341 80.5135 30.8943C80.1991 32.8205 80.6455 34.6607 81.7386 35.9451C82.7423 37.1251 84.1746 37.6163 85.8816 37.6163C88.8119 37.6163 90.4365 35.7362 90.4365 35.7362L90.2894 36.6497C90.2345 36.9967 90.5029 37.311 90.8555 37.311H93.8176C94.288 37.311 94.6875 36.9702 94.761 36.5063L96.5397 25.2523C96.5947 24.9053 96.3254 24.591 95.9737 24.591ZM64.4927 24.5911H61.186C60.8697 24.5911 60.5739 24.7478 60.3967 25.0098L55.8347 31.7229L53.9019 25.2718C53.7805 24.8682 53.4085 24.5911 52.9868 24.5911H49.7368C49.3444 24.5911 49.068 24.977 49.1947 25.3479L52.8354 36.0284L49.4108 40.857C49.1424 41.2359 49.4135 41.7599 49.8785 41.7599H53.1817C53.4944 41.7599 53.7876 41.6068 53.9665 41.3501L64.9631 25.4896C65.2262 25.1098 64.9551 24.5911 64.4927 24.5911ZM99.8516 18.7239L97.0321 36.6504C96.9771 36.9973 97.2455 37.3116 97.5972 37.3116H100.434C100.903 37.3116 101.303 36.9699 101.376 36.5061L104.157 18.9018C104.212 18.5548 103.943 18.2406 103.591 18.2406H100.418C100.135 18.2406 99.895 18.445 99.8516 18.7239Z" />
                  </svg>
                )
              },
              {
                name: "Apple Pay",
                icon: (
                  <svg className="h-[21px] w-auto text-white" viewBox="0 0 120 42" fill="currentColor">
                    <path d="M55.5533 12.9046C61.103 12.9046 64.9675 16.7301 64.9675 22.2997C64.9675 27.8892 61.0235 31.7345 55.4142 31.7345H49.2696V41.5062H44.8301V12.9046L55.5533 12.9046ZM49.2695 28.0081H54.3635C58.2288 28.0081 60.4286 25.9271 60.4286 22.3196C60.4286 18.7124 58.2288 16.6509 54.3834 16.6509H49.2695V28.0081Z" />
                    <path d="M66.1274 35.5799C66.1274 31.9326 68.9222 29.6929 73.8778 29.4154L79.5858 29.0786V27.4732C79.5858 25.1541 78.0198 23.7666 75.404 23.7666C72.9258 23.7666 71.3797 24.9556 71.0035 26.8191H66.9601C67.1979 23.0528 70.4086 20.278 75.5623 20.278C80.6165 20.278 83.8471 22.9538 83.8471 27.136V41.5062H79.7441V38.0772H79.6454C78.4365 40.3963 75.8001 41.8629 73.065 41.8629C68.9818 41.8629 66.1274 39.3258 66.1274 35.5799ZM79.5858 33.697V32.0518L74.452 32.3688C71.8951 32.5473 70.4484 33.6771 70.4484 35.461C70.4484 37.2842 71.9547 38.4736 74.254 38.4736C77.2468 38.4736 79.5858 36.4122 79.5858 33.697Z" />
                    <path d="M87.7206 49.177V45.7082C88.0372 45.7874 88.7506 45.7874 89.1077 45.7874C91.0896 45.7874 92.1601 44.9551 92.8139 42.8145C92.8139 42.7747 93.1908 41.5459 93.1908 41.5261L85.6592 20.6546H90.2967L95.5696 37.6214H95.6484L100.921 20.6546H105.44L97.6303 42.5962C95.8472 47.6508 93.7857 49.276 89.4648 49.276C89.1077 49.276 88.0372 49.2363 87.7206 49.177Z" />
                    <path d="M31.7358 15.6955C32.8058 14.3572 33.5319 12.5603 33.3404 10.724C31.7741 10.8019 29.8627 11.7573 28.7562 13.0967C27.7626 14.2436 26.8832 16.1158 27.1124 17.8751C28.8707 18.0276 30.6273 16.9962 31.7358 15.6955Z" />
                    <path d="M33.3204 18.2186C30.7671 18.0665 28.5961 19.6678 27.3767 19.6678C26.1567 19.6678 24.2894 18.2952 22.2698 18.3322C19.6412 18.3708 17.2022 19.8571 15.8682 22.2209C13.1246 26.9497 15.1442 33.9642 17.8122 37.8155C19.1079 39.7209 20.6694 41.8189 22.7269 41.7435C24.6709 41.6672 25.4328 40.4847 27.7958 40.4847C30.1571 40.4847 30.8435 41.7435 32.9013 41.7054C35.0353 41.6672 36.3695 39.799 37.6651 37.8918C39.1515 35.7198 39.7599 33.6225 39.7982 33.5073C39.7599 33.4692 35.6832 31.9053 35.6454 27.2158C35.6069 23.2892 38.8461 21.4215 38.9985 21.3057C37.1694 18.6003 34.3113 18.2952 33.3204 18.2186Z" />
                  </svg>
                )
              }
            ].map((pay) => (
              <div 
                key={pay.name}
                className="flex items-center justify-center h-12 w-20 border border-[rgba(176,141,87,0.15)] bg-black/60 rounded px-2 hover:border-[#B08D57]/45 hover:scale-105 hover:shadow-[0_0_10px_rgba(176,141,87,0.15)] transition-all duration-300 select-none"
                title={pay.name}
              >
                {pay.icon}
              </div>
            ))}
          </div>

          {/* Trust Assurances */}
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-8 lg:gap-10">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-[#B08D57] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <circle cx="12" cy="16" r="1.5" />
                    <path d="M12 17.5v2" />
                  </svg>
                ),
                title: "SSL Secured",
                desc: "Your information is safe and encrypted."
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-[#B08D57] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    <polygon points="12 5 13.1 7.2 15.5 7.6 13.8 9.3 14.2 11.7 12 10.6 9.8 11.7 10.2 9.3 8.5 7.6 10.9 7.2 12 5" />
                  </svg>
                ),
                title: "Authenticity Guaranteed",
                desc: "Every timepiece is 100% authentic and verified."
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-[#B08D57] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    <path d="M2 12h20" />
                    <rect x="13" y="13" width="9" height="9" rx="1" fill="#050505" stroke="#B08D57" strokeWidth="1.2" />
                    <path d="M13 17.5h9M17.5 13v9" />
                  </svg>
                ),
                title: "Worldwide Insured Shipping",
                desc: "Secure delivery with full insurance coverage."
              }
            ].map((trust, idx) => (
              <div key={idx} className="flex items-center gap-3.5 group">
                {trust.icon}
                <div className="flex flex-col text-left">
                  <span className="text-[11px] uppercase tracking-wider text-[#B08D57] font-bold select-none">
                    {trust.title}
                  </span>
                  <span className="text-[10px] text-[#9E9E9E] font-medium mt-0.5 max-w-[170px] leading-tight select-none">
                    {trust.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. BOTTOM BAR */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-[25px] pb-[25px] text-[12px] text-[#9E9E9E] border-t border-[rgba(176,141,87,0.15)] mt-8">
          
          {/* Left copyright */}
          <div className="w-full lg:w-1/4 text-center lg:text-left select-none">
            <p>© 2026 Stylish Tick Geneva</p>
          </div>
          
          {/* Center policies */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 lg:w-2/4">
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
          <div className="flex items-center justify-center lg:justify-end gap-4 w-full lg:w-1/4">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#A0A0A0]/80 text-center lg:text-right">
              Designed for Watch Collectors Worldwide
            </span>
            
            <button 
              onClick={scrollToTop}
              className="p-2 border border-[#B08D57]/30 hover:border-[#B08D57] text-[#B08D57] hover:bg-[#B08D57]/5 rounded-full transition-all duration-300 hover:scale-110 flex items-center justify-center"
              title="Back to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
