import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Utensils, Mail, Lock, AlertCircle, Loader2, ArrowRight, ShieldCheck, ChefHat, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string>('riya.sharma@campus.edu');
  const [password, setPassword] = useState<string>('password123');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'STUDENT' | 'STAFF' | 'ADMIN') => {
    setIsLoading(true);
    try {
      await switchRole(role);
      if (role === 'STAFF') navigate('/kitchen');
      else if (role === 'ADMIN') navigate('/admin');
      else navigate('/student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-gutter py-12">
      <div className="w-full max-w-md bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-container-high/80 dark:border-white/10 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-sora font-extrabold text-2xl shadow-md mb-3">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-headline-sm text-2xl font-bold text-on-surface dark:text-white">
            Welcome to Token &amp; Bite
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400 mt-1">
            Sign in to access your digital meal orders, student wallet &amp; tracking
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Demo Fast Login Switchers */}
        <div className="p-3 rounded-2xl bg-surface-container-low dark:bg-[#242424] border border-surface-container-high dark:border-white/5 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-tertiary dark:text-neutral-400 uppercase tracking-wider text-center">
            Instant Demo Sign-in
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('STUDENT')}
              className="py-2 px-1 rounded-xl bg-surface-container dark:bg-[#1f1f1f] hover:bg-secondary/20 hover:text-secondary text-xs font-semibold text-on-surface dark:text-white flex flex-col items-center gap-1 transition-all"
            >
              <User className="w-3.5 h-3.5 text-secondary" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('STAFF')}
              className="py-2 px-1 rounded-xl bg-surface-container dark:bg-[#1f1f1f] hover:bg-primary/20 hover:text-primary text-xs font-semibold text-on-surface dark:text-white flex flex-col items-center gap-1 transition-all"
            >
              <ChefHat className="w-3.5 h-3.5 text-primary" />
              <span>Kitchen Staff</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="py-2 px-1 rounded-xl bg-surface-container dark:bg-[#1f1f1f] hover:bg-error/20 hover:text-error text-xs font-semibold text-on-surface dark:text-white flex flex-col items-center gap-1 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-error" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
          <div className="flex flex-col gap-1.5">
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
                placeholder="rollno@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label-sm text-xs font-semibold text-on-surface-variant dark:text-neutral-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary dark:text-[#f08344] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-primary-container text-on-primary-container font-label-lg font-bold shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Canteen</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-on-surface-variant dark:text-neutral-400">
          New campus resident?{' '}
          <Link
            to="/register"
            className="font-bold text-primary dark:text-[#f08344] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

