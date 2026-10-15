import React from 'react';
import { Song } from '../types';
import { PataphorLogo } from './Logo';
import { BookOpen, RefreshCw } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import compositionCover from '../../imgs/composition-cover.svg';
import linedPaper from '../../imgs/lined-paper.svg';

interface Page3CoverProps {
  song: Song;
  onOpenJournal: () => void;
  onChangeSong: () => void;
}

export const Page3Cover: React.FC<Page3CoverProps> = ({
  song,
  onOpenJournal,
  onChangeSong
}) => {
  const artworkSrc = song.artworkDataUrl || song.artworkUrl600 || song.artworkUrl100;

  return (
    <div className="cover-page-container">
      {/* Top Header Logo */}
      <header className="cover-header">
        <PataphorLogo
          style={{ width: 'clamp(220px, 26vw, 360px)', height: 'auto' }}
          title="Pataphor"
        />
      </header>

      {/* Main Composition Book Showcase matching Mockup 3 */}
      <main className="cover-main">
        <div
          className="composition-book-wrapper"
          onClick={onOpenJournal}
          title="Click to open journal"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onOpenJournal();
            }
          }}
        >
          {/* Peeking lined paper page edge on the right (as seen in Mockup 3) */}
          <div className="book-peeking-edge" aria-hidden="true">
            <img src={linedPaper} alt="" />
          </div>

          {/* Composition Book Cover */}
          <div className="composition-book-cover">
            <img
              src={compositionCover}
              alt="Composition Book Cover"
              className="cover-bg-image"
            />

            {/* The Label Area containing Album Art, Title, Artist */}
            <div className="composition-label-overlay">
              <div className="composition-artwork-box">
                <img
                  src={artworkSrc}
                  alt={`${song.trackName} artwork`}
                  crossOrigin="anonymous"
                  className="composition-album-art"
                />
              </div>

              <div className="composition-text-details">
                <span className="composition-song-title">
                  {song.trackName}
                </span>
                <span className="composition-song-artist">
                  by {song.artistName.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Player and Action Controls */}
        <div className="cover-controls">
          {song.previewUrl && (
            <div className="cover-audio-row">
              <AudioPlayer
                previewUrl={song.previewUrl}
                trackName={song.trackName}
                artistName={song.artistName}
              />
            </div>
          )}

          <div className="cover-button-row">
            <button
              type="button"
              className="btn-primary-orange"
              onClick={onOpenJournal}
            >
              <BookOpen size={18} />
              <span>Open Journal &amp; Write Thoughts</span>
            </button>

            <button
              type="button"
              className="btn-secondary-link"
              onClick={onChangeSong}
            >
              <RefreshCw size={14} />
              <span>Choose different song</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
