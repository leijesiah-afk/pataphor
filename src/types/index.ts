export interface Song {
  trackId: number | string;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100: string;
  artworkUrl600?: string;
  previewUrl?: string;
  artworkDataUrl?: string; // Base64 data URL for CORS-safe canvas export
}

export type PageStep = 'landing' | 'search' | 'cover' | 'journal';

export interface JournalState {
  selectedSong: Song | null;
  journalEntry: string;
  journalDate: string; // Formatted date string, e.g. "10/08/2026" or "October 8, 2026"
  fontStyle?: 'caveat' | 'homemade-apple' | 'playpen' | 'times-new-roman' | 'helvetica';
}
