import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Utensils, User, Mail, Phone, Lock, Hash, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await register({
        name,
        studentId,
        email,
        phone,
        password,
      });
      navigate('/student');
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-gutter py-12">
      <div className="w-full max-w-md bg-surface-container-lowest dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 shadow-xl border border-surface-container-high/80 dark:border-white/10 flex flex-col gap-5">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-sora font-extrabold text-2xl shadow-md mb-2">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-headline-sm text-2xl font-bold text-on-surface dark:text-white">
            Create Student Account
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400 mt-0.5">
            Get instant ₹150 welcome credit to try campus dining
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-sm">
          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-xs font-semibold text-on-surface-variant dark:text-neutral-300">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Riya Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-xs font-semibold text-on-surface-variant dark:text-neutral-300">
              Student ID / Roll Number
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="CS-2024-88 or 22BCS108"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

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
                placeholder="riya.sharma@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-xs font-semibold text-on-surface-variant dark:text-neutral-300">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-[#242424] text-on-surface dark:text-white border border-surface-container-high dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-sm text-xs font-semibold text-on-surface-variant dark:text-neutral-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create secure password"
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
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-on-surface-variant dark:text-neutral-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-primary dark:text-[#f08344] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

