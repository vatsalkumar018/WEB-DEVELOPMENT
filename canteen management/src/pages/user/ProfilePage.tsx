import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import {
  User,
  Wallet,
  Building,
  Mail,
  Phone,
  Shield,
  Plus,
  LogOut,
  ChevronRight,
  Settings,
  History,
  CheckCircle2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, role, switchRole, topUpWallet, logout } = useAuth();
  const navigate = useNavigate();

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(200);
  const [isTopUpSuccess, setIsTopUpSuccess] = useState(false);

  const handleTopUp = async () => {
    await topUpWallet(topUpAmount);
    setIsTopUpSuccess(true);
    setTimeout(() => {
      setIsTopUpSuccess(false);
      setIsTopUpOpen(false);
    }, 1200);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col w-full pb-32 max-w-xl mx-auto px-gutter pt-space-sm gap-space-md">
      {/* Profile Card Header */}
      <div className="p-space-md rounded-3xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex items-center gap-4">
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20 dark:ring-primary/40 shadow-md"
          />
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-secondary text-white font-label-sm text-[10px] font-bold uppercase tracking-wider shadow">
            {role === 'STUDENT' ? 'STD' : role === 'STAFF' ? 'STAFF' : 'ADMIN'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-headline-sm text-xl font-bold text-on-surface dark:text-white truncate">
            {user.name}
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400 truncate">
            ID: {user.studentId || user.email}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-tertiary dark:text-neutral-400">
            <Building className="w-3.5 h-3.5 text-primary" />
            <span>{user.block || 'Campus Block 4'}</span>
          </div>
        </div>
      </div>

      {/* Campus Wallet Card */}
      {role === 'STUDENT' && (
        <div className="p-space-md rounded-3xl bg-gradient-to-br from-primary-fixed/40 to-primary-fixed/10 dark:from-[#2a1b14] dark:to-[#1a1512] border border-primary/20 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-label-md font-bold text-on-surface dark:text-white">
                Campus Meal Wallet
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTopUpOpen(true)}
              className="px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-bold shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Balance</span>
            </button>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="font-sora text-3xl font-black text-primary dark:text-[#f08344]">
              {formatCurrency(user.walletBalance)}
            </span>
            <span className="text-xs text-secondary dark:text-emerald-400 font-semibold">
              ● Instant Deduction Active
            </span>
          </div>
        </div>
      )}

      {/* Quick Menu Shortcuts */}
      <div className="bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl border border-surface-container-high/80 dark:border-white/5 shadow-sm overflow-hidden flex flex-col divide-y divide-surface-container-high/60 dark:divide-white/5">
        <Link
          to="/orders"
          className="p-4 flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-[#242424] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container dark:bg-[#242424] flex items-center justify-center text-primary">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="font-label-md text-sm font-bold text-on-surface dark:text-white block">
                Order History &amp; Slips
              </span>
              <span className="text-xs text-on-surface-variant dark:text-neutral-400">
                View previous meal receipts &amp; reorder
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-tertiary" />
        </Link>

        <Link
          to="/settings"
          className="p-4 flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-[#242424] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container dark:bg-[#242424] flex items-center justify-center text-secondary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <span className="font-label-md text-sm font-bold text-on-surface dark:text-white block">
                Preferences &amp; Language
              </span>
              <span className="text-xs text-on-surface-variant dark:text-neutral-400">
                English, Hindi, Gujarati &amp; sound alerts
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-tertiary" />
        </Link>
      </div>

      {/* Role Switcher Drawer (Pair Programming & Demo Ease) */}
      <div className="p-space-md rounded-3xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-3">
        <span className="font-label-sm text-xs font-bold text-tertiary dark:text-neutral-400 uppercase tracking-wider">
          Demo Role Switching
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => switchRole('STUDENT')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
              role === 'STUDENT'
                ? 'bg-secondary text-white border-secondary shadow-sm'
                : 'bg-surface-container-low dark:bg-[#242424] border-surface-container-high dark:border-white/5 text-on-surface dark:text-neutral-300'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => switchRole('STAFF')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
              role === 'STAFF'
                ? 'bg-primary-container text-white border-primary-container shadow-sm'
                : 'bg-surface-container-low dark:bg-[#242424] border-surface-container-high dark:border-white/5 text-on-surface dark:text-neutral-300'
            }`}
          >
            Kitchen Staff
          </button>
          <button
            type="button"
            onClick={() => switchRole('ADMIN')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
              role === 'ADMIN'
                ? 'bg-error text-white border-error shadow-sm'
                : 'bg-surface-container-low dark:bg-[#242424] border-surface-container-high dark:border-white/5 text-on-surface dark:text-neutral-300'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-3.5 rounded-2xl bg-surface-container-low dark:bg-[#242424] border border-surface-container-high dark:border-white/10 text-error font-label-md font-bold hover:bg-error-container hover:text-on-error-container transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>

      {/* Top Up Balance Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsTopUpOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-6 shadow-2xl z-10 border border-surface-container-high dark:border-white/10 text-center">
            {isTopUpSuccess ? (
              <div className="flex flex-col items-center justify-center py-6">
                <CheckCircle2 className="w-12 h-12 text-secondary dark:text-emerald-400 mb-2 animate-bounce" />
                <h3 className="font-headline-sm text-lg font-bold text-on-surface dark:text-white">
                  Balance Added!
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-neutral-300 mt-1">
                  ₹{topUpAmount} credited to your meal wallet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h3 className="font-headline-sm text-lg font-bold text-on-surface dark:text-white">
                  Recharge Canteen Wallet
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-neutral-400">
                  Select an amount to top up via student banking link.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-3 rounded-2xl font-numeric-data text-sm font-bold transition-all border ${
                        topUpAmount === amt
                          ? 'bg-primary-container text-white border-primary-container shadow-md'
                          : 'bg-surface-container dark:bg-[#242424] text-on-surface dark:text-neutral-200 border-surface-container-high dark:border-white/5'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleTopUp}
                  className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-bold shadow-md hover:brightness-105 active:scale-95 transition-all mt-2"
                >
                  Pay ₹{topUpAmount} via UPI
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

