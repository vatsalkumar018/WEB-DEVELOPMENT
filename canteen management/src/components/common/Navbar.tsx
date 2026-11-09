import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrders } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';
import { Language } from '@/lib/i18n';
import { UserRole } from '@/types';
import {
  Sun,
  Moon,
  ShoppingBag,
  Bell,
  Utensils,
  ChevronDown,
  LayoutDashboard,
  Shield,
  ChefHat,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  currentSectionTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentSectionTitle }) => {
  const { user, role, switchRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { metrics, activeOrder } = useOrders();
  const { totalQuantity, setIsCartOpen } = useCart();
  const location = useLocation();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roleBadgeText = role === 'STUDENT' ? 'STD' : role === 'STAFF' ? 'STF' : 'ADM';
  const roleBadgeColor =
    role === 'STUDENT'
      ? 'bg-secondary text-on-secondary'
      : role === 'STAFF'
      ? 'bg-primary-container text-on-primary-container'
      : 'bg-error text-on-error';

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-surface-container-high/60 dark:border-white/10 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-colors">
      <div className="max-w-7xl mx-auto px-gutter py-2 flex flex-col justify-center gap-1.5">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Canteen Identity */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-sora font-extrabold text-lg shadow-sm transition-transform group-hover:scale-105">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm text-on-surface dark:text-white leading-none tracking-tight">
                  Token &amp; Bite
                </span>
                {currentSectionTitle && (
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300 font-label-sm text-label-sm">
                    {currentSectionTitle}
                  </span>
                )}
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant dark:text-neutral-400">
                Campus Block 4 Canteen
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-container-low dark:bg-[#1A1A1A] p-1 rounded-full border border-surface-container-high dark:border-white/5">
            <Link
              to="/student"
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                location.pathname === '/student' || location.pathname === '/'
                  ? 'bg-surface dark:bg-[#242424] text-primary dark:text-[#f08344] font-bold shadow-sm'
                  : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
              }`}
            >
              {t('navHome')}
            </Link>
            <Link
              to="/menu"
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                location.pathname === '/menu'
                  ? 'bg-surface dark:bg-[#242424] text-primary dark:text-[#f08344] font-bold shadow-sm'
                  : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
              }`}
            >
              {t('navMenu')}
            </Link>
            <Link
              to="/orders"
              className={`relative px-3 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                location.pathname.startsWith('/orders') || location.pathname.startsWith('/token')
                  ? 'bg-surface dark:bg-[#242424] text-primary dark:text-[#f08344] font-bold shadow-sm'
                  : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
              }`}
            >
              <span>{t('navOrders')}</span>
              {activeOrder && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold">
                  {activeOrder.tokenNumber}
                </span>
              )}
            </Link>
            <Link
              to="/kitchen"
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                location.pathname === '/kitchen'
                  ? 'bg-surface dark:bg-[#242424] text-primary dark:text-[#f08344] font-bold shadow-sm'
                  : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
              }`}
            >
              {t('navKitchen')}
            </Link>
            {role === 'STAFF' && (
              <Link
                to="/staff"
                className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                  location.pathname === '/staff'
                    ? 'bg-surface dark:bg-[#242424] text-primary dark:text-[#f08344] font-bold shadow-sm'
                    : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                {t('navStaff')}
              </Link>
            )}
            {role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-surface dark:bg-[#242424] text-primary dark:text-[#f08344] font-bold shadow-sm'
                    : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                {t('navAdmin')}
              </Link>
            )}
          </nav>

          {/* Controls: Language, Theme, Cart, Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Pill Group */}
            <div className="flex items-center bg-surface-container-high dark:bg-[#242424] p-0.5 rounded-full border border-surface-container-highest dark:border-white/5">
              {(['EN', 'HI', 'GU'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`min-w-[28px] h-7 px-1.5 rounded-full font-label-sm text-label-sm transition-all ${
                    language === lang
                      ? 'bg-surface dark:bg-[#1A1A1A] text-primary dark:text-[#f08344] font-bold shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                      : 'text-on-surface-variant dark:text-neutral-400 hover:text-on-surface dark:hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Dark Mode"
              className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface-variant dark:text-neutral-300 flex items-center justify-center hover:bg-surface-container-highest transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
              className="relative w-8 h-8 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface flex items-center justify-center hover:bg-surface-container-highest transition-colors"
            >
              <ShoppingBag className="w-4 h-4 dark:text-neutral-200" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-container text-on-primary-container font-numeric-data text-[10px] font-bold flex items-center justify-center shadow-sm animate-scale">
                  {totalQuantity}
                </span>
              )}
            </button>

            {/* Notifications Shortcut */}
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative w-8 h-8 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface flex items-center justify-center hover:bg-surface-container-highest transition-colors"
            >
              <Bell className="w-4 h-4 dark:text-neutral-200" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            </Link>

            {/* Profile & Fast Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-surface-container-high dark:hover:bg-[#242424] transition-colors"
              >
                <div className="relative flex items-center justify-center">
                  <img
                    alt={user?.name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 dark:ring-primary/40"
                    src={
                      user?.avatarUrl ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuAveiXhp6GBrQ9td0xJfD0cDCW6rB8lwWEaOpnJ02qC4nN_bA0OPf1mGfbUn5rCzEAiZlmEO3x-oNFeKCIpTuBPUdHDbHjIHbsAVtoIiwxDyHN1Xn_bV7o61FnKq7JIwnXuU_GpD5Rwx9Tom9IBja_SCr-ApwQzEGsjXn5fxu4OJm00R2P496fprVcFGbY_vKNKA3T2Bm-ZaAAwjiEcIZEUvuO3gu35q7TIBlxKlhBB'
                    }
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 px-1 rounded-full font-label-sm text-[9px] uppercase tracking-wider leading-tight shadow-sm font-bold ${roleBadgeColor}`}
                  >
                    {roleBadgeText}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant dark:text-neutral-400 hidden sm:block" />
              </button>

              {/* Role Switcher Menu Dropdown */}
              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-container-lowest dark:bg-[#1A1A1A] p-2 shadow-2xl border border-surface-container-high dark:border-white/10 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-surface-container-high dark:border-white/5">
                    <p className="font-label-md text-label-md font-bold text-on-surface dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant dark:text-neutral-400 truncate">
                      {user?.studentId || user?.email}
                    </p>
                    {role === 'STUDENT' && (
                      <p className="font-numeric-data text-xs font-semibold text-secondary dark:text-emerald-400 mt-1">
                        Wallet: ₹{user?.walletBalance.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <span className="px-3 py-1 font-label-sm text-[10px] text-tertiary dark:text-neutral-400 uppercase tracking-wider block font-bold">
                      Switch Role View
                    </span>
                    <button
                      type="button"
                      onClick={() => switchRole('STUDENT')}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg font-label-sm text-label-sm text-left transition-colors ${
                        role === 'STUDENT'
                          ? 'bg-secondary/15 text-secondary dark:text-emerald-400 font-bold'
                          : 'text-on-surface dark:text-neutral-200 hover:bg-surface-container dark:hover:bg-[#242424]'
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Student View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => switchRole('STAFF')}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg font-label-sm text-label-sm text-left transition-colors ${
                        role === 'STAFF'
                          ? 'bg-primary/15 text-primary dark:text-[#f08344] font-bold'
                          : 'text-on-surface dark:text-neutral-200 hover:bg-surface-container dark:hover:bg-[#242424]'
                      }`}
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Kitchen Staff View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => switchRole('ADMIN')}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg font-label-sm text-label-sm text-left transition-colors ${
                        role === 'ADMIN'
                          ? 'bg-error/15 text-error font-bold'
                          : 'text-on-surface dark:text-neutral-200 hover:bg-surface-container dark:hover:bg-[#242424]'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Manager View</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-surface-container-high dark:border-white/5">
                    <Link
                      to="/profile"
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg font-label-sm text-label-sm text-on-surface dark:text-neutral-200 hover:bg-surface-container dark:hover:bg-[#242424]"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Profile &amp; Settings</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Operational Status Strip (Matching Stitch) */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/70 dark:bg-emerald-950/60 border border-secondary/20">
            <span
              className={`w-2 h-2 rounded-full ${
                metrics.rushMode ? 'bg-error animate-ping' : 'bg-secondary dark:bg-emerald-400 animate-pulse'
              }`}
            />
            <span className="font-label-sm text-label-sm text-on-secondary-container dark:text-emerald-200 font-semibold">
              {metrics.rushMode ? 'High Rush (Paused)' : t('canteenStatusOpen')}
            </span>
          </div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-tertiary dark:text-neutral-400">
            <span>{t('fastLaneActive')}</span>
            <span className="text-surface-container-highest dark:text-neutral-700">•</span>
            <span className="font-numeric-data text-primary dark:text-[#f08344] font-semibold">
              Counter 1 &amp; 2
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

