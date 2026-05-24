"use client";

import { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AuthModal from '@/component/AuthModal';

const navItems = ['الرئيسية', 'منتجاتنا', 'الفئات', 'العروض', 'من نحن'];

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (item: string) => {
    const sectionMap: Record<string, string> = {
      'الرئيسية': 'hero',
      'منتجاتنا': 'products',
      'الفئات': 'categories',
      'العروض': 'offers',
      'من نحن': 'footer',
    };
    const id = sectionMap[item];
    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleSearch = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <div className="flex items-center shrink-0">
          <h1 className="text-3xl font-bold text-pink font-tajawal tracking-tight cursor-pointer" onClick={() => scrollToSection('الرئيسية')}>
            SKYNOVA
          </h1>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => scrollToSection(item)}
              className="text-gray-dark hover:text-pink font-medium transition-colors relative group font-tajawal"
            >
              {item}
              <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-pink transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ابحثي عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-10 pr-4 pl-12 border border-gray-200 rounded-full focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink text-sm font-tajawal"
            />
            <button
              onClick={handleSearch}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-pink text-white p-2 rounded-full hover:bg-pink-dark transition-colors"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isLoggedIn) {
                router.push('/account');
              } else {
                setAuthModalOpen(true);
              }
            }}
            className="p-2 hover:text-pink hover:scale-110 transition-all"
          >
            <User size={22} />
          </button>
          <button className="p-2 hover:text-pink hover:scale-110 transition-all hidden sm:block">
            <Heart size={22} />
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:text-pink hover:scale-110 transition-all relative"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-pink-dark text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="py-3 px-4 text-right hover:bg-pink-50 hover:text-pink rounded-xl transition-colors font-tajawal font-medium"
              >
                {item}
              </button>
            ))}
          </nav>
          {/* Mobile Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحثي عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-10 pr-4 pl-12 border border-gray-200 rounded-full focus:outline-none focus:border-pink text-sm font-tajawal"
              />
              <button
                onClick={handleSearch}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-pink text-white p-2 rounded-full"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
