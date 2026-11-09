import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Language } from '@/lib/i18n';
import { playChime } from '@/lib/sound';
import { Globe, Moon, Sun, Volume2, ArrowLeft, Check, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  return (
    <div className="flex flex-col w-full pb-32 max-w-xl mx-auto px-gutter pt-space-sm gap-space-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-surface-container-high dark:bg-[#242424] text-on-surface dark:text-white flex items-center justify-center hover:bg-surface-container-highest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface dark:text-white">
            App Settings &amp; Preferences
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant dark:text-neutral-400">
            Language, themes &amp; notification chimes
          </p>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="p-space-md rounded-3xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-headline-sm text-base font-bold text-on-surface dark:text-white">
            Display Language
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'EN' as Language, label: 'English', native: 'English' },
            { key: 'HI' as Language, label: 'Hindi', native: 'हिन्दी' },
            { key: 'GU' as Language, label: 'Gujarati', native: 'ગુજરાતી' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setLanguage(item.key)}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${
                language === item.key
                  ? 'bg-primary-container text-on-primary-container border-primary-container font-bold shadow-md'
                  : 'bg-surface-container-low dark:bg-[#242424] border-surface-container-high dark:border-white/5 text-on-surface dark:text-neutral-300'
              }`}
            >
              <span className="font-sora text-sm">{item.native}</span>
              <span className="text-[11px] opacity-80">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Preferences */}
      <div className="p-space-md rounded-3xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-amber-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface dark:text-white">
                Appearance Mode
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-neutral-400">
                Warm daylight or volcanic obsidian night theme
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-surface-container dark:bg-[#242424] text-xs font-bold text-on-surface dark:text-white hover:bg-surface-container-high transition-colors"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>

      {/* Audio & Haptic Chimes */}
      <div className="p-space-md rounded-3xl bg-surface-container-lowest dark:bg-[#1A1A1A] border border-surface-container-high/80 dark:border-white/5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-secondary" />
            <div>
              <h2 className="font-headline-sm text-base font-bold text-on-surface dark:text-white">
                Order Ready Audio Chimes
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-neutral-400">
                Play pleasant audio alert when kitchen calls your token
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playChime('orderReady');
            }}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
              soundEnabled ? 'bg-secondary' : 'bg-surface-container-highest dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

