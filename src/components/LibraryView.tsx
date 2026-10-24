import React, { useState, useMemo } from 'react';
import { VocabularyWord, CEFRLevel } from '../types';
import { Search, Bookmark, Volume2, BookOpen, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';

interface LibraryViewProps {
  vocabulary: VocabularyWord[];
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onSelectAndPlay: (wordId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  vocabulary,
  bookmarks,
  onToggleBookmark,
  onSelectAndPlay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const filtered = useMemo(() => {
    return vocabulary.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        item.word.toLowerCase().includes(q) ||
        item.meaningAr.includes(q) ||
        item.definitionEn.toLowerCase().includes(q);
      const matchesLevel = selectedLevel === 'ALL' || item.level === selectedLevel;
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      return matchesSearch && matchesLevel && matchesCat;
    });
  }, [vocabulary, searchQuery, selectedLevel, selectedCategory]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleLevelChange = (lvl: CEFRLevel | 'ALL') => {
    setSelectedLevel(lvl);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 text-white min-h-[calc(100vh-73px)]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-1">
            مكتبة الكلمات الشاملة ({vocabulary.length.toLocaleString()} كلمة)
          </h2>
          <p className="text-slate-400 text-sm">
            جميع مستويات الإنجليزية من A1 حتى C2 مع المعاني والتعريفات و3 أمثلة حية لكل كلمة.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-semibold self-start md:self-auto">
          <WifiOff className="w-4 h-4" />
          <span>متاح بالكامل بدون إنترنت 100%</span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="ابحث عن أي كلمة، معنى بالعربية، أو في التعريف..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <select
            value={selectedLevel}
            onChange={e => handleLevelChange(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">كل المستويات (A1-C2)</option>
            <option value="A1">المستوى A1 (مبتدئ)</option>
            <option value="A2">المستوى A2 (أساسي)</option>
            <option value="B1">المستوى B1 (متوسط)</option>
            <option value="B2">المستوى B2 (فوق المتوسط)</option>
            <option value="C1">المستوى C1 (متقدم)</option>
            <option value="C2">المستوى C2 (احترافي)</option>
          </select>

          <select
            value={selectedCategory}
            onChange={e => handleCategoryChange(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">جميع التصنيفات</option>
            <option value="Daily Life">الحياة اليومية</option>
            <option value="Business & Career">العمل والأعمال</option>
            <option value="Academic & IELTS">أكاديمي و آيلتس</option>
            <option value="Travel & Hotel">السفر والفنادق</option>
            <option value="Emotions">المشاعر والشخصية</option>
            <option value="Technology & Science">التكنولوجيا والعلوم</option>
          </select>
        </div>
      </div>

      {/* Results Count & Quick Pagination Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-6 px-1">
        <span>عرض {paginatedItems.length} من أصل {filtered.length.toLocaleString()} كلمة</span>
        <span>الصفحة {currentPage} من {totalPages}</span>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedItems.map(item => {
          const isBookmarked = bookmarks.includes(item.id);
          return (
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
                    className={`p-2 rounded-xl transition ${
                      isBookmarked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="إضافة للمفضلة"
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

                <div className="mb-4 space-y-1">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.definitionEn}
                  </p>
                  <p className="text-[11px] text-slate-400 font-arabic line-clamp-1">
                    {item.definitionAr}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  3 أمثلة حية مع الترجمة
                </span>
                <button
                  onClick={() => onSelectAndPlay(item.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>استماع</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">لم يتم العثور على كلمات مطابقة لبحثك.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl disabled:opacity-40 hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <span className="text-xs font-semibold text-slate-300 px-4">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl disabled:opacity-40 hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold"
          >
            <span>التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
