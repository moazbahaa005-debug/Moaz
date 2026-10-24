import React, { useState } from 'react';
import { VocabularyWord } from '../types';
import { BrainCircuit, RotateCw, CheckCircle, ArrowRight, ArrowLeft, Volume2, Sparkles } from 'lucide-react';

interface FlashcardsViewProps {
  vocabulary: VocabularyWord[];
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ vocabulary }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentItem = vocabulary[currentIndex] || vocabulary[0];

  const handleNext = (known: boolean) => {
    if (known) setScore(s => s + 1);
    setIsFlipped(false);
    if (currentIndex + 1 < vocabulary.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsFlipped(false);
    setShowResults(false);
  };

  if (!currentItem) return null;

  if (showResults) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-white">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">أحسنت! لقد أنهيت جلسة التدريب</h2>
          <p className="text-slate-400 text-sm mb-6">
            لقد أتقنت <span className="text-emerald-400 font-bold">{score}</span> من أصل <span className="text-white font-bold">{vocabulary.length}</span> كلمة.
          </p>
          <button
            onClick={handleReset}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg transition flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            <span>إعادة التدريب من جديد</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-white min-h-[calc(100vh-73px)] flex flex-col justify-center">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold">جلسة البطاقات التعليمية (Flashcards)</h2>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {currentIndex + 1} / {vocabulary.length}
        </span>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className={`relative w-full h-96 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl cursor-pointer transition-all duration-500 flex flex-col justify-between items-center text-center select-none ${
          isFlipped ? 'border-amber-500/50 bg-slate-900/90' : 'hover:border-slate-700'
        }`}
      >
        <div className="w-full flex items-center justify-between text-xs text-slate-400">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-semibold">{currentItem.level}</span>
          <span className="italic">{currentItem.pos}</span>
        </div>

        <div className="my-auto">
          {!isFlipped ? (
            <div>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-3">
                {currentItem.word}
              </h3>
              <p className="text-xs text-slate-400">اضغط على البطاقة لعرض المعنى والترجمة</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-3xl font-black text-amber-400 font-arabic">
                {currentItem.meaningAr}
              </h3>
              <p className="text-sm text-slate-200 max-w-md mx-auto">
                {currentItem.definitionEn}
              </p>
              <p className="text-xs text-slate-400 font-arabic">
                {currentItem.definitionAr}
              </p>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <RotateCw className="w-3.5 h-3.5" />
          <span>انقر للقلب</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => handleNext(false)}
          className="py-4 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-2xl font-semibold transition"
        >
          لم أكن أعرفها
        </button>
        <button
          onClick={() => handleNext(true)}
          className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-600/30 transition"
        >
          أعرفها تماماً ✓
        </button>
      </div>
    </div>
  );
};
