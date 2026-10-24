export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ExampleSentence {
  en: string;
  ar: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  level: CEFRLevel;
  category: string;
  pos: string; // part of speech: noun, verb, idiom, etc.
  meaningAr: string;
  definitionEn: string;
  definitionAr: string;
  examples: ExampleSentence[];
}

export type AppView = 'player' | 'library' | 'flashcards' | 'bookmarks';

export interface PlayerSettings {
  rate: number;
  pitch: number;
  voiceName: string;
  repeatMode: 'off' | 'word' | 'playlist';
  autoAdvance: boolean;
  bilingualVoice: boolean; // read English then Arabic translation
  sleepTimerMinutes: number | null;
  sleepMode: boolean; // dimmed night UI
}
