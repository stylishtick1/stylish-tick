'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User as UserIcon, Menu, X, Sun, Moon, LogOut, Heart, LayoutDashboard, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import CartDrawer from './CartDrawer';
import api from '../services/api';

export default function Header() {
  const router = useRouter();
  const { user, token, isAdmin, logout } = useAuthStore();
  const { getCartCount } = useCartStore();
  
  const [isThemeDark, setIsThemeDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchInputVisible, setIsSearchInputVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Listen for Escape key to close search suggestions and collapse input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSuggestionsOpen(false);
        setIsSearchInputVisible(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    setIsSuggestionsOpen(true);
    try {
      const res = await api.get(`/watches/suggest?q=${encodeURIComponent(val)}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error('Error fetching search suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSuggestionsOpen(false);
      setIsSearchInputVisible(false);
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchClick();
    }
  };

  const handleSuggestionClick = (watchId: number) => {
    router.push(`/watches/${watchId}`);
    setIsSuggestionsOpen(false);
    setIsSearchInputVisible(false);
    setSearchQuery('');
  };

  const handleSeeAllClick = () => {
    handleSearchClick();
  };

  // Sync theme with system / localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsThemeDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsThemeDark(false);
    }
  }, []);

  // Scroll detection for compact header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (isThemeDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsThemeDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsThemeDark(true);
    }
  };



  const handleLogoutClick = () => {
    logout();
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  return (
    <>
      <header 
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          isScrolled 
            ? 'border-border/80 bg-background/90 shadow-sm backdrop-blur-md h-16' 
            : 'border-border bg-background/50 backdrop-blur-sm h-20'
        }`}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between md:gap-2 lg:gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col justify-center select-none group">
            <span className="text-2xl font-bold tracking-[0.1em] font-luxury gold-text-gradient transition-all duration-300 group-hover:opacity-90">
              STYLISH TICK
            </span>
            <span className="text-[7px] text-muted-foreground tracking-[0.25em] font-mono -mt-1 uppercase text-center">
              Haute Horlogerie
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center md:space-x-4 lg:space-x-8 md:text-[10px] lg:text-xs font-semibold uppercase md:tracking-wider lg:tracking-widest text-muted-foreground">
            {[
              { name: 'Home', href: '/' },
              { name: 'Shop', href: '/shop' },
              { name: 'About', href: '/about' },
              { name: 'FAQ', href: '/faq' },
              { name: 'Contact', href: '/contact' }
            ].map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="relative py-2 hover:text-foreground transition-colors whitespace-nowrap after:absolute after:bottom-1 after:left-0 after:h-[1px] after:w-full after:origin-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Icons & Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            
            {/* Sleek Collapsible Search Bar with Live Suggestions */}
            {!isAdmin && (
              <div className="relative search-container flex items-center">
                {isSearchInputVisible ? (
                  <div className="flex items-center border border-border/80 rounded-full px-3 py-1.5 bg-muted/45 text-xs w-44 sm:w-48 lg:w-64 transition-all duration-300 animate-fade-in">
                    <input
                      type="text"
                      placeholder="Search timepieces..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDownInput}
                      onFocus={() => setIsSuggestionsOpen(true)}
                      autoFocus
                      className="bg-transparent outline-none w-full text-foreground py-0.5"
                    />
                    <X 
                      className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground mr-1.5 flex-shrink-0" 
                      onClick={() => {
                        setIsSearchInputVisible(false);
                        setSearchQuery('');
                        setSuggestions([]);
                      }} 
                    />
                    <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 cursor-pointer hover:text-primary" onClick={handleSearchClick} />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchInputVisible(true)}
                    className="p-2.5 text-muted-foreground hover:text-primary rounded-full hover:bg-muted/50 transition-all duration-300 hover:scale-105"
                    aria-label="Open Search"
                    title="Search timepieces"
                  >
                    <Search className="w-4.5 h-4.5" />
                  </button>
                )}

                {/* Suggestions Dropdown */}
                {isSuggestionsOpen && (searchQuery.trim().length > 0 || suggestions.length > 0) && (
                  <div className="absolute right-0 top-full mt-3.5 w-72 md:w-80 bg-card border border-border rounded-lg shadow-xl py-2 z-50 text-xs text-foreground max-h-96 overflow-y-auto animate-fade-in">
                    {loadingSuggestions ? (
                      <div className="px-4 py-3 text-center text-muted-foreground animate-pulse font-sans">
                        Searching inventory...
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-4 py-3 text-center text-muted-foreground font-sans">
                        No timepieces found
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="px-3 py-1 text-[9px] uppercase tracking-wider text-muted-foreground border-b border-border/40 mb-1 font-bold">
                          Matching Watches
                        </div>
                        {suggestions.map((watch) => {
                          const imgUrl = watch.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=100';
                          return (
                            <div
                              key={watch.id}
                              onClick={() => handleSuggestionClick(watch.id)}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer transition-colors"
                            >
                              <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0 relative">
                                <Image src={imgUrl} alt={watch.name} fill sizes="32px" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{watch.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{watch.brand}</p>
                              </div>
                              <div className="font-mono text-primary font-semibold text-[10px] flex-shrink-0">
                                ₹{watch.price.toLocaleString()}
                              </div>
                            </div>
                          );
                        })}
                        <div 
                          onClick={handleSeeAllClick}
                          className="border-t border-border/40 mt-1 pt-1.5 text-center text-primary font-semibold hover:underline cursor-pointer py-1 text-[10px] uppercase tracking-wider"
                        >
                          See all results for "{searchQuery}"
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-muted-foreground hover:text-primary rounded-full hover:bg-muted/50 transition-all duration-300 group"
              aria-label="Toggle Theme"
            >
              {isThemeDark ? (
                <Sun className="w-4.5 h-4.5 transition-transform duration-500 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4.5 h-4.5 transition-transform duration-500 group-hover:-rotate-12" />
              )}
            </button>

            {/* Wishlist Link (Users only) */}
            {token && !isAdmin && (
              <Link 
                href="/wishlist" 
                className="p-2.5 text-muted-foreground hover:text-primary rounded-full hover:bg-muted/50 transition-all duration-300 hidden sm:inline-block hover:scale-105"
                title="Wishlist"
              >
                <Heart className="w-4.5 h-4.5" />
              </Link>
            )}

            {/* Shopping Cart Icon (Users only or guest) */}
            {!isAdmin && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 text-muted-foreground hover:text-primary rounded-full hover:bg-muted/50 transition-all duration-300 relative hover:scale-105"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {getCartCount() > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full animate-pulse">
                    {getCartCount()}
                  </span>
                )}
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              {token ? (
                <>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`p-2.5 flex items-center gap-1 text-muted-foreground hover:text-primary rounded-full hover:bg-muted/50 transition-all duration-300 focus:outline-none ${isProfileDropdownOpen ? 'text-primary bg-muted/30' : ''}`}
                  >
                    <UserIcon className="w-4.5 h-4.5" />
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-lg shadow-xl py-2 z-50 text-xs text-foreground animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-border/50 text-[10px] text-muted-foreground">
                        Signed in as <br />
                        <span className="font-semibold text-foreground break-all">{user?.email || 'Admin'}</span>
                      </div>
                      
                      {isAdmin ? (
                        <Link 
                          href="/admin" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 hover:bg-muted text-foreground transition-colors font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-primary" />
                          Admin Panel
                        </Link>
                      ) : (
                        <>
                          <Link 
                            href="/profile" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-muted text-foreground transition-colors font-medium"
                          >
                            <UserIcon className="w-4 h-4 text-primary" />
                            My Profile
                          </Link>
                          <Link 
                            href="/wishlist" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-muted text-foreground transition-colors font-medium sm:hidden"
                          >
                            <Heart className="w-4 h-4 text-primary" />
                            My Wishlist
                          </Link>
                        </>
                      )}
                      
                      <button 
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted text-destructive hover:text-destructive transition-colors border-t border-border/50 mt-1 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="hidden md:flex items-center md:space-x-1 lg:space-x-2 pl-1">
                  <Link 
                    href="/login" 
                    className="md:px-2.5 md:py-1.5 lg:px-4 lg:py-2 md:text-[10px] lg:text-xs font-semibold uppercase md:tracking-wider lg:tracking-widest hover:text-primary transition-colors duration-300 whitespace-nowrap"
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/register" 
                    className="md:px-3 md:py-1.5 lg:px-4 lg:py-2 bg-primary hover:bg-primary-hover text-primary-foreground md:text-[10px] lg:text-xs font-semibold uppercase md:tracking-wider lg:tracking-widest rounded transition-colors duration-300 shadow-sm whitespace-nowrap"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 md:hidden text-muted-foreground hover:text-primary rounded-full hover:bg-muted/50 transition-all duration-300"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>
        </div>
      </header>



      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Dropdown Content */}
          <div className="relative w-full bg-card border-b border-border flex flex-col p-6 pb-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-down">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-[0.1em] font-luxury gold-text-gradient">STYLISH TICK</span>
                <span className="text-[6px] text-muted-foreground tracking-[0.25em] font-mono -mt-1 uppercase">Geneva</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Navigation links */}
            <nav className="flex flex-col space-y-2 text-xs font-semibold uppercase tracking-widest">
              {[
                { name: 'Home', href: '/' },
                { name: 'Shop Collection', href: '/shop' },
                { name: 'Our Heritage', href: '/about' },
                { name: 'FAQ & Support', href: '/faq' },
                { name: 'Direct Inquiry', href: '/contact' }
              ].map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-primary transition-colors py-2 border-b border-border/10 flex items-center justify-center text-center"
                >
                  <span>{link.name}</span>
                </Link>
              ))}
            </nav>

            <div className="space-y-6 border-t border-border pt-4 text-xs">
              {token ? (
                <div className="space-y-4">
                  <div className="text-[10px] text-muted-foreground text-center">
                    Signed in as <br />
                    <span className="font-semibold text-foreground break-all">{user?.email || 'Admin'}</span>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {isAdmin ? (
                      <Link 
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-center text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-300 shadow-sm"
                      >
                        Admin Panel
                      </Link>
                    ) : (
                      <Link 
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-center text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-300 shadow-sm"
                      >
                        Profile
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        handleLogoutClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 border border-border hover:border-destructive text-destructive hover:bg-destructive/10 text-center text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-300"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-center text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-300 shadow-sm"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground text-center text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-300 shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
              
              <div className="text-center text-[8px] uppercase tracking-widest text-muted-foreground border-t border-border/40 pt-4">
                © Stylish Tick Haute Horlogerie
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
