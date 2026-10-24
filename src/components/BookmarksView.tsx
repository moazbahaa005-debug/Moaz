import React from 'react';
import { VocabularyWord } from '../types';
import { Bookmark, Volume2, BookOpen } from 'lucide-react';

interface BookmarksViewProps {
  vocabulary: VocabularyWord[];
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onSelectAndPlay: (wordId: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  vocabulary,
  bookmarks,
  onToggleBookmark,
  onSelectAndPlay,
}) => {
  const bookmarkedItems = vocabulary.filter(item => bookmarks.includes(item.id));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-white min-h-[calc(100vh-73px)]">
      <div className="mb-8 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-1">الكلمات المفضلة والمحفوظة</h2>
        <p className="text-slate-400 text-sm">راجع كلماتك المحفوظة للاستماع إليها وتثبيتها في الذاكرة.</p>
      </div>

      {bookmarkedItems.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">ليس لديك أي كلمات محفوظة في المفضلة بعد.</p>
          <p className="text-xs mt-1">اضغط على أيقونة الإشارة المرجعية بجانب أي كلمة لحفظها هنا.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarkedItems.map(item => (
            <div
              key={item.id}
              className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                      {item.level}
                    </span>
                    <span className="text-slate-400">{item.category}</span>
                  </div>
                  <button
                    onClick={() => onToggleBookmark(item.id)}
                    className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-black text-white mb-1 group-hover:text-blue-400 transition">
                    {item.word}
                  </h3>
                  <p className="text-lg font-bold text-amber-400 font-arabic">
                    {item.meaningAr}
                  </p>
                </div>

                <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
                  {item.definitionEn}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.examples.length} أمثلة توضيحية
                </span>
                <button
                  onClick={() => onSelectAndPlay(item.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-xl text-xs font-semibold transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>استماع</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
