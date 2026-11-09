import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Clock, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low dark:bg-[#151515] border-t border-surface-container-high/60 dark:border-white/5 py-10 px-gutter mt-auto text-xs text-on-surface-variant dark:text-neutral-400">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2 text-on-surface dark:text-white font-bold font-sora text-base">
            <div className="w-7 h-7 rounded-lg bg-primary-container text-white flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <span>Token &amp; Bite</span>
          </div>
          <p className="text-xs text-on-surface-variant dark:text-neutral-400">
            Next-generation campus food-ordering &amp; real-time kitchen dispatch ecosystem for university students and canteen staff.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-tertiary dark:text-neutral-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>Block 4 Ground Floor • Central Dining Hall</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 w-full md:w-auto">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-on-surface dark:text-white uppercase tracking-wider text-[11px]">
              Campus Dining
            </span>
            <Link to="/menu" className="hover:text-primary transition-colors">
              Live Menu
            </Link>
            <Link to="/orders" className="hover:text-primary transition-colors">
              Token Tracking
            </Link>
            <Link to="/orders" className="hover:text-primary transition-colors">
              Order History
            </Link>
            <Link to="/notifications" className="hover:text-primary transition-colors">
              Announcements
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold text-on-surface dark:text-white uppercase tracking-wider text-[11px]">
              Service Hours
            </span>
            <span>Breakfast: 7–11 AM</span>
            <span>Lunch: 11 AM–4 PM</span>
            <span>Snacks: 4–7 PM</span>
            <span>Dinner: 7–9 PM</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-bold text-on-surface dark:text-white uppercase tracking-wider text-[11px]">
              Operations
            </span>
            <Link to="/kitchen" className="hover:text-primary transition-colors">
              Kitchen Display (KDS)
            </Link>
            <Link to="/staff" className="hover:text-primary transition-colors">
              Staff Counter POS
            </Link>
            <Link to="/admin" className="hover:text-primary transition-colors">
              Admin Analytics
            </Link>
            <Link to="/settings" className="hover:text-primary transition-colors">
              Multilingual (EN/HI/GU)
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto pt-8 mt-8 border-t border-surface-container-high/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-tertiary dark:text-neutral-500">
        <p>&copy; {new Date().getFullYear()} Token &amp; Bite. All campus rights reserved.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for campus dining
        </p>
      </div>
    </footer>
  );
};

