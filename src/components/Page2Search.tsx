import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { searchSongs, prepareSongForJournal } from '../services/itunesApi';
import { PataphorLogo } from './Logo';
import { Search, X, Play, Pause, Plus, Loader2, Check } from 'lucide-react';

interface Page2SearchProps {
  onSelectSong: (song: Song) => void;
  selectedSong: Song | null;
}

export const Page2Search: React.FC<Page2SearchProps> = ({
  onSelectSong,
  selectedSong
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio preview state
  const [previewTrackId, setPreviewTrackId] = useState<string | number | null>(null);
  const [previewErrorId, setPreviewErrorId] = useState<string | number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchRequestRef = useRef(0);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      const requestId = ++searchRequestRef.current;
      try {
        const songs = await searchSongs(query);
        if (requestId !== searchRequestRef.current) return;
        setResults(songs);
        setHasSearched(true);
      } catch (err) {
        if (requestId !== searchRequestRef.current) return;
        console.error('Search failed:', err);
        setError('Unable to fetch songs right now. Try another query.');
      } finally {
        if (requestId === searchRequestRef.current) setIsLoading(false);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [query]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTogglePreview = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();

    if (!song.previewUrl) {
      setPreviewErrorId(song.trackId);
      return;
    }

    if (previewTrackId === song.trackId) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPreviewTrackId(null);
      setPreviewErrorId(null);
    } else {
      // Play new
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(song.previewUrl);
      audioRef.current = audio;
      audio.onended = () => setPreviewTrackId(null);
      audio.onerror = () => {
        setPreviewTrackId(null);
        setPreviewErrorId(song.trackId);
      };
      audio.play().catch(() => {
        setPreviewTrackId(null);
        setPreviewErrorId(song.trackId);
      });
      setPreviewTrackId(song.trackId);
    }
  };

  const handleSelect = async (song: Song) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPreviewTrackId(null);
    setPreviewErrorId(null);
    setIsLoading(true);
    try {
      const prepared = await prepareSongForJournal(song);
      onSelectSong(prepared);
    } catch {
      onSelectSong(song);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPreviewTrackId(null);
    setPreviewErrorId(null);
  };

  return (
    <div className="search-page-container">
      {/* Header Logo */}
      <header className="search-header">
        <PataphorLogo
          style={{ width: 'clamp(220px, 26vw, 360px)', height: 'auto' }}
          title="Pataphor"
        />
      </header>

      <main className="search-main">
        {/* Search Bar pill matching Mockup 2 */}
        <div className="search-bar-wrapper">
          <div className="search-input-box">
            <span className="search-icon-slot">
              <Search size={22} className="text-orange" />
            </span>

            <input
              type="text"
              className="search-input-field"
              placeholder="Search for a song, artist, or album..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              aria-label="Search music catalog for a song"
            />

            {isLoading && (
              <span className="search-loader-slot">
                <Loader2 size={18} className="spin text-orange" />
              </span>
            )}

            {query && !isLoading && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={handleClear}
                aria-label="Clear search input"
              >
                <X size={20} className="text-orange" />
              </button>
            )}
          </div>
        </div>

        {/* Results Container matching Mockup 2 dark card */}
        <div className="search-results-area">
          {results.length > 0 && (
            <div className="results-dropdown-list" role="listbox">
              {results.map((song) => {
                const isPlaying = previewTrackId === song.trackId;
                const isSelected = selectedSong?.trackId === song.trackId;

                return (
                  <div
                    key={song.trackId}
                    className={`song-card-dark ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(song)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {/* Album Artwork */}
                    <div className="song-artwork-thumb">
                      <img
                        src={song.artworkUrl100}
                        alt={`${song.trackName} artwork`}
                        loading="lazy"
                        crossOrigin="anonymous"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="song-meta">
                      <h4 className="song-title" title={song.trackName}>
                        {song.trackName}
                      </h4>

                      <div className="song-sub-row">
                        {song.previewUrl && previewErrorId !== song.trackId ? (
                          <button
                            type="button"
                            className={`btn-preview-tag ${isPlaying ? 'playing' : ''}`}
                            onClick={(e) => handleTogglePreview(e, song)}
                            title={isPlaying ? 'Pause preview' : 'Play 30s preview'}
                          >
                            {isPlaying ? (
                              <Pause size={12} className="play-icon" />
                            ) : (
                              <Play size={12} className="play-icon" />
                            )}
                            <span>Song • {song.artistName}</span>
                          </button>
                        ) : (
                          <span className="song-artist-text">
                            {previewErrorId === song.trackId ? 'Preview unavailable' : `Song • ${song.artistName}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Select / Plus Action Button */}
                    <div className="song-action-slot">
                      <button
                        type="button"
                        className="btn-song-select"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(song);
                        }}
                        aria-label={`Select ${song.trackName} to journal about`}
                      >
                        {isSelected ? (
                          <Check size={20} className="text-orange" />
                        ) : (
                          <Plus size={22} className="text-light" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty search state */}
          {hasSearched && results.length === 0 && !isLoading && (
            <div className="search-empty-state">
              <p className="empty-title">No songs found for &ldquo;{query}&rdquo;</p>
              <p className="empty-sub">Try searching with artist name or another song title.</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="search-error-state">
              <p>{error}</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
