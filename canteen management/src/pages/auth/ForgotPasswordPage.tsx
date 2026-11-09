import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-gutter py-12">
      <div className="w-full max-w-md bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-container-high/80 dark:border-white/10 flex flex-col gap-5">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tertiary dark:text-neutral-400 hover:text-on-surface"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-sora font-extrabold text-2xl shadow-md mb-2">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-headline-sm text-2xl font-bold text-on-surface dark:text-white">
            Reset Password
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400 mt-1">
            Enter your campus registered email to receive a password reset link
          </p>
        </div>

        {isSent ? (
          <div className="p-6 text-center bg-surface-container-low dark:bg-[#242424] rounded-2xl border border-surface-container-high dark:border-white/5 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-secondary dark:text-emerald-400 mb-2" />
            <h3 className="font-headline-sm text-base font-bold text-on-surface dark:text-white">
              Reset Link Dispatched
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-300 mt-1">
              If an account matches <strong>{email}</strong>, you will receive instructions in your inbox shortly.
            </p>
            <Link
              to="/login"
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-xs font-semibold text-on-surface-variant dark:text-neutral-300">
                Campus Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg font-bold shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>Send Reset Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

