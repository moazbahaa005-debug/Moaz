import React, { useState, useEffect } from 'react';
import { VocabularyWord, AppView } from './types';
import { INITIAL_VOCABULARY } from './data/vocabulary';
import { Navbar } from './components/Navbar';
import { ListeningPlayer } from './components/ListeningPlayer';
import { LibraryView } from './components/LibraryView';
import { FlashcardsView } from './components/FlashcardsView';
import { BookmarksView } from './components/BookmarksView';
import { OfflineIndicator } from './components/OfflineIndicator';

import { BottomNav } from './components/BottomNav';

export default function App() {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sama3_vocabulary_v10k');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length >= 1000) {
            return parsed;
          }
        } catch (e) { /* fallback */ }
      }
    }
    return INITIAL_VOCABULARY;
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sama3_bookmarks');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [];
  });

  const [currentView, setCurrentView] = useState<AppView>('player');
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [sleepMode, setSleepMode] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sama3_vocabulary_v10k', JSON.stringify(vocabulary.slice(0, 5000)));
    } catch (e) {
      console.warn('Storage quota reached, running from memory');
    }
  }, [vocabulary]);

  useEffect(() => {
    localStorage.setItem('sama3_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleToggleBookmark = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleSelectAndPlay = (wordId: string) => {
    setSelectedWordId(wordId);
    setCurrentView('player');
  };

  return (
    <div className={`min-h-screen font-sans ${sleepMode ? 'bg-black text-slate-300' : 'bg-slate-950 text-white'} pb-16 md:pb-0`}>
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        bookmarksCount={bookmarks.length}
        totalWordsCount={vocabulary.length}
        sleepMode={sleepMode}
        onToggleSleepMode={() => setSleepMode(!sleepMode)}
      />

      <main>
        {currentView === 'player' && (
          <ListeningPlayer
            vocabulary={vocabulary}
            bookmarks={bookmarks}
            initialWordId={selectedWordId}
            onToggleBookmark={handleToggleBookmark}
            sleepMode={sleepMode}
            onToggleSleepMode={() => setSleepMode(!sleepMode)}
          />
        )}

        {currentView === 'library' && (
          <LibraryView
            vocabulary={vocabulary}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onSelectAndPlay={handleSelectAndPlay}
          />
        )}

        {currentView === 'flashcards' && (
          <FlashcardsView vocabulary={vocabulary} />
        )}

        {currentView === 'bookmarks' && (
          <BookmarksView
            vocabulary={vocabulary}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onSelectAndPlay={handleSelectAndPlay}
          />
        )}
      </main>

      <BottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        bookmarksCount={bookmarks.length}
      />

      <OfflineIndicator />
    </div>
  );
}
