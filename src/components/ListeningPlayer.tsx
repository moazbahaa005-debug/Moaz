import React, { useState, useEffect, useRef } from 'react';
import { VocabularyWord, PlayerSettings, CEFRLevel } from '../types';
import { 
  Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, Moon, Sun, 
  Timer, Bookmark, CheckCircle2, Sliders, Globe, Layers, ListMusic, WifiOff
} from 'lucide-react';

interface ListeningPlayerProps {
  vocabulary: VocabularyWord[];
  bookmarks: string[];
  initialWordId?: string | null;
  onToggleBookmark: (id: string) => void;
  sleepMode: boolean;
  onToggleSleepMode: () => void;
}

export const ListeningPlayer: React.FC<ListeningPlayerProps> = ({
  vocabulary,
  bookmarks,
  initialWordId,
  onToggleBookmark,
  sleepMode,
  onToggleSleepMode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string>('word');
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    if (initialWordId) {
      const idx = vocabulary.findIndex(w => w.id === initialWordId);
      if (idx !== -1) {
        setSelectedLevel('ALL');
        setSelectedCategory('ALL');
        setCurrentIndex(idx);
        setIsPlaying(true);
      }
    }
  }, [initialWordId, vocabulary]);
  
  const [settings, setSettings] = useState<PlayerSettings>({
    rate: 0.9,
    pitch: 1.0,
    voiceName: '',
    repeatMode: 'playlist',
    autoAdvance: true,
    bilingualVoice: true,
    sleepTimerMinutes: null,
    sleepMode: false,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);

  // Filtered vocabulary list
  const filteredVocab = vocabulary.filter(item => {
    const matchLevel = selectedLevel === 'ALL' || item.level === selectedLevel;
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchLevel && matchCat;
  });

  const currentItem = filteredVocab[currentIndex] || vocabulary[0];

  // Speech synthesis reference
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceQueueRef = useRef<{ text: string; lang: string; segment: string }[]>([]);
  const queueIndexRef = useRef(0);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const wakeLockRef = useRef<any>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Background audio keepalive for mobile screen lock
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      audio.loop = true;
      bgAudioRef.current = audio;
    }
  }, []);

  // Sync background audio element with isPlaying state
  useEffect(() => {
    if (!bgAudioRef.current) return;
    if (isPlaying) {
      bgAudioRef.current.play().catch(() => {});
    } else {
      bgAudioRef.current.pause();
    }
  }, [isPlaying]);

  // Screen Wake Lock API
  useEffect(() => {
    if (isPlaying && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLockRef.current = lock;
      }).catch(() => {});
    } else if (!isPlaying && wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [isPlaying]);

  // Media Session API for lock screen and Bluetooth headphone controls
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && currentItem) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentItem.word,
        artist: `${currentItem.meaningAr} • ${currentItem.level}`,
        album: 'سماع (Sama3) English Listening',
        artwork: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      });

      try {
        navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
        navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
        navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
        navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
      } catch (e) {
        // Fallback for unsupported action handlers
      }
    }
  }, [currentItem, isPlaying]);

  // Handle sequential audio playback of current item
  const speakCurrentItem = () => {
    if (!synthRef.current || !currentItem) return;
    synthRef.current.cancel();
    isCancelledRef.current = false;

    const utterances: { text: string; lang: string; segment: string }[] = [];

    // 1. English Word
    utterances.push({ text: currentItem.word, lang: 'en-US', segment: 'word' });
    
    if (settings.bilingualVoice) {
      // 2. Arabic Meaning
      utterances.push({ text: currentItem.meaningAr, lang: 'ar-SA', segment: 'meaning' });
    }

    // 3. English Definition
    utterances.push({ text: currentItem.definitionEn, lang: 'en-US', segment: 'definition' });

    // 4. Examples (up to 3)
    currentItem.examples.forEach((ex, idx) => {
      const segKey = `ex${idx}`;
      utterances.push({ text: ex.en, lang: 'en-US', segment: segKey });
      if (settings.bilingualVoice) {
        utterances.push({ text: ex.ar, lang: 'ar-SA', segment: segKey });
      }
    });

    utteranceQueueRef.current = utterances;
    queueIndexRef.current = 0;

    playNextInQueue();
  };

  const playNextInQueue = () => {
    if (!synthRef.current || isCancelledRef.current || !isPlaying) return;

    const queue = utteranceQueueRef.current;
    const index = queueIndexRef.current;

    if (index >= queue.length) {
      if (settings.autoAdvance) {
        setTimeout(() => {
          if (!isPlaying || isCancelledRef.current) return;
          setCurrentIndex(prev => {
            const next = prev + 1;
            if (next >= filteredVocab.length) {
              if (settings.repeatMode === 'playlist') {
                return 0;
              } else {
                setIsPlaying(false);
                return prev;
              }
            }
            return next;
          });
        }, 900);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    const item = queue[index];
    setActiveSegment(item.segment);

    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.lang = item.lang;

    const voices = synthRef.current.getVoices();
    if (item.lang.startsWith('ar')) {
      const arVoice = voices.find(v => v.lang.includes('ar') || v.lang.includes('AR'));
      if (arVoice) utterance.voice = arVoice;
    } else {
      const enVoice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onend = () => {
      if (isCancelledRef.current) return;
      queueIndexRef.current += 1;
      playNextInQueue();
    };

    utterance.onerror = () => {
      // Gracefully advance queue on speech interruption or error
      if (isCancelledRef.current) return;
      queueIndexRef.current += 1;
      playNextInQueue();
    };

    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    if (isPlaying) {
      speakCurrentItem();
    } else {
      if (synthRef.current) synthRef.current.cancel();
    }
    return () => {
      isCancelledRef.current = true;
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [currentIndex, isPlaying, settings.bilingualVoice, settings.rate]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (synthRef.current) synthRef.current.cancel();
    setCurrentIndex(prev => (prev + 1) % filteredVocab.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (synthRef.current) synthRef.current.cancel();
    setCurrentIndex(prev => (prev - 1 + filteredVocab.length) % filteredVocab.length);
    setIsPlaying(true);
  };

  const setSleepTimer = (minutes: number | null) => {
    if (minutes === null) {
      setTimeLeftSeconds(null);
    } else {
      setTimeLeftSeconds(minutes * 60);
    }
    setShowTimerModal(false);
  };

  if (!currentItem) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <h2 className="text-xl font-bold text-white mb-2">لا توجد كلمات في هذا التصنيف</h2>
        <p className="text-slate-400 mb-6 text-sm">جرب اختيار مستوى آخر أو جميع المستويات.</p>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(currentItem.id);

  return (
    <div className={`min-h-[calc(100vh-73px)] transition-colors duration-500 flex flex-col justify-between p-4 md:p-8 ${
      sleepMode ? 'bg-black text-slate-300' : 'bg-slate-950 text-white'
    }`}>
      {/* Top Bar Filters & Offline Badge */}
      <div className="max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-900/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-semibold pl-1">المستوى:</span>
          {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => { setSelectedLevel(lvl); setCurrentIndex(0); }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                selectedLevel === lvl
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentIndex(0); }}
            className="bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">جميع التصنيفات</option>
            <option value="Daily Life">الحياة اليومية</option>
            <option value="Business & Career">العمل والأعمال</option>
            <option value="Academic & IELTS">أكاديمي و آيلتس</option>
            <option value="Travel & Hotel">السفر والفنادق</option>
            <option value="Emotions">المشاعر والشخصية</option>
            <option value="Technology & Science">التكنولوجيا والعلوم</option>
          </select>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <WifiOff className="w-3.5 h-3.5" />
            <span>يعمل بدون إنترنت</span>
          </div>
        </div>
      </div>

      {/* Main Effortless Listening Card & Live Synchronized Transcript */}
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-center my-auto">
        <div className={`relative rounded-3xl p-6 md:p-10 border transition-all duration-500 shadow-2xl ${
          sleepMode 
            ? 'bg-slate-950/80 border-slate-900 shadow-black' 
            : 'bg-slate-900/80 backdrop-blur-xl border-slate-800/80 shadow-blue-950/20'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {currentItem.level}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">{currentItem.category}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-400 italic">{currentItem.pos}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleBookmark(currentItem.id)}
                className={`p-2 rounded-xl transition ${
                  isBookmarked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="حفظ في المفضلة"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
              <span className="text-xs font-mono text-slate-400">
                {currentIndex + 1} / {filteredVocab.length}
              </span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className={`transition-all duration-300 ${activeSegment === 'word' ? 'scale-105' : ''}`}>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-3">
                {currentItem.word}
              </h2>
            </div>
            
            <div className={`transition-all duration-300 ${activeSegment === 'meaning' ? 'scale-105 text-amber-300' : 'text-amber-400'}`}>
              <p className="text-2xl md:text-3xl font-bold font-arabic">
                {currentItem.meaningAr}
              </p>
            </div>
          </div>

          <div className={`mb-8 p-4 rounded-2xl transition-all duration-300 border ${
            activeSegment === 'definition' 
              ? 'bg-blue-950/40 border-blue-500/50 shadow-lg shadow-blue-500/10' 
              : 'bg-slate-800/40 border-slate-800'
          }`}>
            <p className="text-sm md:text-base text-slate-200 font-medium mb-1">
              {currentItem.definitionEn}
            </p>
            <p className="text-xs md:text-sm text-slate-400 font-arabic">
              {currentItem.definitionAr}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
              أمثلة الاستخدام (3 أمثلة حية):
            </h4>
            {currentItem.examples.map((ex, idx) => {
              const segKey = `ex${idx}`;
              const isActive = activeSegment === segKey;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl transition-all duration-300 border ${
                    isActive
                      ? 'bg-indigo-950/50 border-indigo-500/60 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/20 border-slate-800/60'
                  }`}
                >
                  <p className="text-sm text-slate-200 font-medium mb-1 flex items-start gap-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 mt-0.5">{idx + 1}</span>
                    <span>{ex.en}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-arabic pr-6">
                    {ex.ar}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="max-w-3xl mx-auto w-full mt-6 bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTimerModal(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                timeLeftSeconds !== null
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
              title="مؤقت النوم"
            >
              <Timer className="w-4 h-4" />
              <span>{timeLeftSeconds !== null ? `${Math.ceil(timeLeftSeconds / 60)}د` : 'مؤقت'}</span>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 rounded-xl transition"
              title="إعدادات الصوت"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-3 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl border border-slate-700 transition"
              title="الكلمة السابقة"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className={`p-4 rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center ${
                isPlaying 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40'
              }`}
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل الاستماع المستمر'}
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleNext}
              className="p-3 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl border border-slate-700 transition"
              title="الكلمة التالية"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSettings(s => ({ ...s, rate: s.rate === 1.0 ? 0.75 : s.rate === 0.75 ? 1.25 : 1.0 }))}
              className="px-3 py-2 bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 rounded-xl hover:bg-slate-700 transition"
              title="سرعة النطق"
            >
              {settings.rate}x
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl">
              <span className="text-slate-300 font-medium">الترجمة الصوتية (عربي + إنجليزي):</span>
              <input
                type="checkbox"
                checked={settings.bilingualVoice}
                onChange={e => setSettings(s => ({ ...s, bilingualVoice: e.target.checked }))}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl">
              <span className="text-slate-300 font-medium">التشغيل التلقائي المستمر:</span>
              <input
                type="checkbox"
                checked={settings.autoAdvance}
                onChange={e => setSettings(s => ({ ...s, autoAdvance: e.target.checked }))}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {showTimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
            <h3 className="text-lg font-bold text-amber-400 mb-2">مؤقت النوم (Sleep Timer)</h3>
            <p className="text-xs text-slate-400 mb-5">حدد وقتاً لإيقاف التشغيل تلقائياً لكي تستمتع بالاستماع وأنت نائم:</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => setSleepTimer(15)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition">15 دقيقة</button>
              <button onClick={() => setSleepTimer(30)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition">30 دقيقة</button>
              <button onClick={() => setSleepTimer(60)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition">60 دقيقة</button>
              <button onClick={() => setSleepTimer(null)} className="p-3 bg-red-950/40 text-red-300 border border-red-500/30 hover:bg-red-900/40 rounded-xl font-semibold transition">إلغاء المؤقت</button>
            </div>
            <button onClick={() => setShowTimerModal(false)} className="w-full py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
};
