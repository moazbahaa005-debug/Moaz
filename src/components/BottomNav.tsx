import React from 'react';
import { AppView } from '../types';
import { Headphones, BookOpen, BrainCircuit, Bookmark } from 'lucide-react';

interface BottomNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  bookmarksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onViewChange,
  bookmarksCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-3 py-2 flex items-center justify-around text-slate-400 select-none pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <button
        onClick={() => onViewChange('player')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
          currentView === 'player'
            ? 'text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Headphones className="w-5 h-5" />
        <span className="text-[11px]">الاستماع</span>
      </button>

      <button
        onClick={() => onViewChange('library')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
          currentView === 'library'
            ? 'text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[11px]">الكلمات</span>
      </button>

      <button
        onClick={() => onViewChange('flashcards')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
          currentView === 'flashcards'
            ? 'text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BrainCircuit className="w-5 h-5" />
        <span className="text-[11px]">تدريب</span>
      </button>

      <button
        onClick={() => onViewChange('bookmarks')}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition relative ${
          currentView === 'bookmarks'
            ? 'text-blue-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Bookmark className="w-5 h-5" />
        <span className="text-[11px]">المفضلة</span>
        {bookmarksCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-amber-500 text-slate-950 font-black rounded-full text-[9px] flex items-center justify-center">
            {bookmarksCount > 9 ? '9+' : bookmarksCount}
          </span>
        )}
      </button>
    </nav>
  );
};
