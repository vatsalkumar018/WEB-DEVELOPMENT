import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert, ArrowLeft, ArrowRight } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { role, switchRole } = useAuth();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-gutter py-12">
      <div className="w-full max-w-md bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-8 shadow-xl border border-error/30 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-headline-sm text-2xl font-bold text-on-surface dark:text-white">
          Access Restricted
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant dark:text-neutral-400">
          This portal section requires administrative or kitchen operations privileges. Your current role is <strong>{role}</strong>.
        </p>

        <div className="p-3 w-full rounded-2xl bg-surface-container-low dark:bg-[#242424] border border-surface-container-high dark:border-white/5 flex flex-col gap-2">
          <span className="text-xs font-bold text-tertiary dark:text-neutral-400 uppercase tracking-wider">
            Switch Demo Role to Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchRole('STAFF')}
              className="py-2 px-3 rounded-xl bg-surface-container dark:bg-[#1f1f1f] text-xs font-bold text-primary dark:text-[#f08344] hover:bg-primary-container hover:text-white transition-colors"
            >
              Switch to Staff
            </button>
            <button
              type="button"
              onClick={() => switchRole('ADMIN')}
              className="py-2 px-3 rounded-xl bg-surface-container dark:bg-[#1f1f1f] text-xs font-bold text-error hover:bg-error hover:text-white transition-colors"
            >
              Switch to Admin
            </button>
          </div>
        </div>

        <Link
          to="/student"
          className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-primary dark:text-[#f08344] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Student Home</span>
        </Link>
      </div>
    </div>
  );
};

