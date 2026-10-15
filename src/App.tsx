import { useState, useEffect } from 'react';
import { Song, PageStep } from './types';
import { Page1Landing } from './components/Page1Landing';
import { Page2Search } from './components/Page2Search';
import { Page3Cover } from './components/Page3Cover';
import { Page4Journal } from './components/Page4Journal';
import { NavigationHeader } from './components/NavigationHeader';
import { FEATURED_SAMPLE_SONGS } from './services/itunesApi';

const STORAGE_KEY = 'pataphor_journal_state_v1';

function getDefaultDate(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function App() {
  const [currentStep, setCurrentStep] = useState<PageStep>('landing');
  const [selectedSong, setSelectedSong] = useState<Song | null>(FEATURED_SAMPLE_SONGS[0]);
  const [journalEntry, setJournalEntry] = useState<string>('');
  const [journalInk, setJournalInk] = useState<string>('');
  const [journalDate, setJournalDate] = useState<string>(getDefaultDate());

  // Load saved state from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedSong) setSelectedSong(parsed.selectedSong);
        if (typeof parsed.journalEntry === 'string') setJournalEntry(parsed.journalEntry);
        if (typeof parsed.journalInk === 'string') setJournalInk(parsed.journalInk);
        if (parsed.journalDate) setJournalDate(parsed.journalDate);
        if (parsed.currentStep) setCurrentStep(parsed.currentStep);
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedSong,
          journalEntry,
          journalInk,
          journalDate,
          currentStep
        })
      );
    } catch (e) {
      console.warn('Could not write to localStorage:', e);
    }
  }, [selectedSong, journalEntry, journalInk, journalDate, currentStep]);

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setCurrentStep('cover');
  };

  const handleStartNew = () => {
    setCurrentStep('search');
  };

  return (
    <div className="pataphor-app-root">
      {/* Show navigation header for all steps except landing (to match Mockup 1 pure minimalist feel) */}
      {currentStep !== 'landing' && (
        <NavigationHeader
          currentStep={currentStep}
          onNavigate={(step) => setCurrentStep(step)}
        />
      )}

      {/* Pages Switcher */}
      <div className="page-view-wrapper">
        {currentStep === 'landing' && (
          <Page1Landing onStart={handleStartNew} />
        )}

        {currentStep === 'search' && (
          <Page2Search
            selectedSong={selectedSong}
            onSelectSong={handleSelectSong}
          />
        )}

        {currentStep === 'cover' && selectedSong && (
          <Page3Cover
            song={selectedSong}
            onOpenJournal={() => setCurrentStep('journal')}
            onChangeSong={() => setCurrentStep('search')}
          />
        )}

        {currentStep === 'journal' && selectedSong && (
          <Page4Journal
            song={selectedSong}
            journalEntry={journalEntry}
            onEntryChange={setJournalEntry}
            journalInk={journalInk}
            onInkChange={setJournalInk}
            journalDate={journalDate}
            onDateChange={setJournalDate}
            onBackToCover={() => setCurrentStep('cover')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
