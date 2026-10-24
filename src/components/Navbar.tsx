import React from 'react';
import { AppView } from '../types';
import { Headphones, BookOpen, BrainCircuit, Bookmark, Moon } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  bookmarksCount: number;
  totalWordsCount: number;
  sleepMode: boolean;
  onToggleSleepMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  bookmarksCount,
  totalWordsCount,
  sleepMode,
  onToggleSleepMode,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40">
      {/* Zone 1: Single text element Brand Wordmark */}
      <div 
        onClick={() => onViewChange('player')}
        className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span>سماع</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              +{totalWordsCount.toLocaleString()} كلمة
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">الاستماع السهل للغة الإنجليزية (A1 - C2)</p>
        </div>
      </div>

      {/* Zone 2: Nav Links */}
      <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
        <button
          onClick={() => onViewChange('player')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap shrink-0 ${
            currentView === 'player'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>مشغل الاستماع</span>
        </button>

        <button
          onClick={() => onViewChange('library')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap shrink-0 ${
            currentView === 'library'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>مكتبة الكلمات ({totalWordsCount.toLocaleString()})</span>
        </button>

        <button
          onClick={() => onViewChange('flashcards')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap shrink-0 ${
            currentView === 'flashcards'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>تدريب واختبار</span>
        </button>

        <button
          onClick={() => onViewChange('bookmarks')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap shrink-0 ${
            currentView === 'bookmarks'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>المفضلة ({bookmarksCount})</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action & Utilities */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSleepMode}
          className={`p-2.5 rounded-xl border transition ${
            sleepMode
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
          }`}
          title="وضع السكون / النوم الهادئ"
        >
          <Moon className="w-4 h-4" />
        </button>
        <PWAInstallButton />
      </div>
    </header>
  );
};
