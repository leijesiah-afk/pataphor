import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types';
import { PataphorLogo } from './Logo';
import { renderJournalToPng, downloadDataUrl } from '../services/exportJournal';
import { Download, Loader2, Check, Type, Eye, X, Pen, Eraser } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { motion } from 'motion/react';
import orangeFabricCover from '../../imgs/orange-fabric-cover.svg';

interface Page4JournalProps {
  song: Song;
  journalEntry: string;
  onEntryChange: (text: string) => void;
  journalInk: string;
  onInkChange: (ink: string) => void;
  journalDate: string;
  onDateChange: (date: string) => void;
  onBackToCover: () => void;
}

export const Page4Journal: React.FC<Page4JournalProps> = ({
  song,
  journalEntry,
  onEntryChange,
  journalInk,
  onInkChange,
  journalDate,
  onDateChange
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [fontChoice, setFontChoice] = useState<'caveat' | 'homemade-apple' | 'playpen' | 'times-new-roman' | 'helvetica'>('caveat');
  const [useLongDate, setUseLongDate] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(Boolean(journalInk));
  const [exportedImage, setExportedImage] = useState<{ url: string; filename: string } | null>(null);

  // Reference to the journal spread element for PNG capture
  const journalSpreadRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const canvasInitializedRef = useRef(false);

  const artworkSrc = song.artworkDataUrl || song.artworkUrl600 || song.artworkUrl100;

  useEffect(() => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const previousInk = canvasInitializedRef.current ? canvas.toDataURL() : journalInk;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      canvasInitializedRef.current = true;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.scale(ratio, ratio);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#351e28';
      context.lineWidth = 2.2;
      if (previousInk) {
        const image = new Image();
        image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height);
        image.src = previousInk;
      }
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [journalInk]);

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handleInkStart = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(event);
    const canvas = inkCanvasRef.current;
    if (!point || !canvas) return;
    canvas.setPointerCapture(event.pointerId);
    const context = canvas.getContext('2d');
    if (!context) return;
    isDrawingRef.current = true;
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const handleInkMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const point = getCanvasPoint(event);
    const context = inkCanvasRef.current?.getContext('2d');
    if (!point || !context) return;
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const handleInkEnd = () => {
    if (!isDrawingRef.current || !inkCanvasRef.current) return;
    isDrawingRef.current = false;
    onInkChange(inkCanvasRef.current.toDataURL('image/png'));
  };

  const clearInk = () => {
    const canvas = inkCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    onInkChange('');
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 440)}px`;
    }
  }, [journalEntry]);

  // Handle PNG export
  const handleDownloadImage = async () => {
    if (!journalSpreadRef.current || isDownloading) return;

    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const result = await renderJournalToPng(journalSpreadRef.current, song.trackName);
      
      // Trigger native download
      downloadDataUrl(result.dataUrl, result.filename);

      setExportedImage({
        url: result.dataUrl,
        filename: result.filename
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to generate journal image:', err);
      alert('Unable to generate image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getFontFamily = () => {
    switch (fontChoice) {
      case 'homemade-apple':
        return "'Homemade Apple', cursive";
      case 'playpen':
        return "'Playpen Sans', cursive";
      case 'times-new-roman':
        return "'Times New Roman', Times, serif";
      case 'helvetica':
        return "Helvetica, Arial, sans-serif";
      case 'caveat':
      default:
        return "'Caveat', cursive";
    }
  };

  return (
    <div className="journal-page-container">
      {/* Top Header Logo */}
      <header className="journal-header">
        <PataphorLogo
          style={{ width: 'clamp(220px, 26vw, 360px)', height: 'auto' }}
          title="Pataphor"
        />
      </header>

      {song.previewUrl && (
        <section className="journal-listen-deck" aria-label="Listen while writing">
          <div className="journal-listen-heading">
            <span className="journal-listen-kicker">side a / writing soundtrack</span>
            <span className="journal-listen-title">Listen While Writing</span>
          </div>
          <AudioPlayer
            previewUrl={song.previewUrl}
            trackName={song.trackName}
            artistName={song.artistName}
          />
          <span className="journal-listen-note">tap the record to play · loops while you write</span>
        </section>
      )}

      {/* Main Workspace */}
      <main className="journal-main-layout">
        {/* The Open Notebook Spread (Side-by-side Left Cover & Right Lined Page) */}
        <div className="spread-capture-outer">
          <div
            ref={journalSpreadRef}
            className="journal-notebook-spread"
            id="journal-export-target"
          >
            {/* LEFT HALF: Composition Book Cover (matching Mockup 4 left side) */}
            <div className="spread-page spread-page-left">
              <img
                src={orangeFabricCover}
                alt="Orange fabric notebook cover"
                className="spread-cover-image"
              />

              <div className="spread-fabric-logo-strip">
                <PataphorLogo transparentBackground title="Pataphor" />
              </div>
              <div className="spread-fabric-artwork">
                  <img
                    src={artworkSrc}
                    alt={`${song.trackName} album art`}
                    crossOrigin="anonymous"
                    className="spread-fabric-art"
                  />
              </div>
              <div className="spread-fabric-title-strip">{song.trackName}</div>
              <div className="spread-fabric-artist-strip">by {song.artistName}</div>
            </div>

            {/* RIGHT HALF: Lined Pad Paper (matching Mockup 4 right side) */}
            <div className="spread-page spread-page-right">
              {/* Watermark Logo at Top Right of Pad Paper (Mockup 4) */}
              <div className="paper-watermark-logo" aria-hidden="true">
                <PataphorLogo
                  transparentBackground={true}
                  style={{ width: '130px', height: 'auto', opacity: 0.85 }}
                />
              </div>

              <div className="export-only-field-note" aria-hidden="true">
                <span>FIELD NOTE</span>
                <span>NO. 001 / PATAPHOR</span>
              </div>

              {/* Paper Content: Date line & Ruled Entry */}
              <div className="paper-content-area">
                {/* Date Line Header */}
                <div className="paper-date-row">
                  <span className="paper-date-text" title="Local Date">
                    {journalDate}
                  </span>
                </div>

                {/* Journal Writing / Freehand Body */}
                <div className="paper-ruled-body">
                  <textarea
                    ref={textareaRef}
                    className="paper-handwriting-input"
                    style={{
                      fontFamily: getFontFamily(),
                      display: isDrawingMode ? 'none' : 'block'
                    }}
                    value={journalEntry}
                    onChange={(e) => onEntryChange(e.target.value)}
                    aria-label="Journal entry text"
                    spellCheck={false}
                  />
                  <canvas
                    ref={inkCanvasRef}
                    className={`paper-ink-canvas ${isDrawingMode ? 'active' : ''}`}
                    onPointerDown={handleInkStart}
                    onPointerMove={handleInkMove}
                    onPointerUp={handleInkEnd}
                    onPointerCancel={handleInkEnd}
                    aria-label="Freehand journal drawing"
                  />

                  {/* Clean export layer rendered during canvas snapshot */}
                  <div
                    className="paper-handwriting-export-layer"
                    style={{
                      fontFamily: getFontFamily(),
                      opacity: isDrawingMode ? '0' : undefined
                    }}
                    aria-hidden="true"
                  >
                    {journalEntry}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Download Button (Mockup 4 side button) */}
        <aside className="journal-sidebar-actions">
          {/* Prominent Download Button matching Mockup 4 */}
          <div className="download-btn-card">
            <motion.button
              type="button"
              id="btn-download-journal"
              className={`btn-download-journal ${isDownloading ? 'loading' : ''} ${downloadSuccess ? 'success' : ''}`}
              onClick={handleDownloadImage}
              disabled={isDownloading}
              title="Download your finished journal as a high-resolution PNG image"
              whileHover={!isDownloading ? { y: -4, scale: 1.015 } : undefined}
              whileTap={!isDownloading ? { scale: 0.97 } : undefined}
              transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            >
              <div className="download-icon-box">
                {isDownloading ? (
                  <Loader2 size={32} className="spin" />
                ) : downloadSuccess ? (
                  <Check size={32} />
                ) : (
                  <Download size={32} strokeWidth={2.2} />
                )}
              </div>
              <span className="download-label">
                {isDownloading ? 'Rendering...' : downloadSuccess ? 'Downloaded!' : 'Download Image'}
              </span>
            </motion.button>
            <p className="download-hint">
              Saves a high-res PNG containing both the cover and journal pages.
            </p>

            {exportedImage && (
              <button
                type="button"
                className="btn-preview-export"
                onClick={() => {
                  window.open(exportedImage.url, '_blank');
                }}
              >
                <Eye size={14} />
                <span>View Fullscreen Image</span>
              </button>
            )}
          </div>

          {/* Writing Tools / Options Card */}
          <div className="journal-options-card">
            <div className="options-section writing-mode-section">
              <span className="options-title">Writing Mode</span>
              <div className="font-choice-group">
                <button
                  type="button"
                  className={`btn-pill-choice ${!isDrawingMode ? 'active' : ''}`}
                  onClick={() => setIsDrawingMode(false)}
                >
                  <Type size={13} /> Type
                </button>
                <button
                  type="button"
                  className={`btn-pill-choice ${isDrawingMode ? 'active' : ''}`}
                  onClick={() => setIsDrawingMode(true)}
                >
                  <Pen size={13} /> Pen
                </button>
                <button
                  type="button"
                  className="btn-pill-choice"
                  onClick={clearInk}
                  disabled={!journalInk}
                  title="Clear pen marks"
                >
                  <Eraser size={13} /> Clear
                </button>
              </div>
            </div>
            <div className="options-section">
              <span className="options-title">
                <Type size={14} style={{ verticalAlign: '-2px', marginRight: '5px' }} />
                Handwriting Style
              </span>
              <div className="font-choice-group">
                <button
                  type="button"
                  className={`btn-pill-choice ${fontChoice === 'caveat' ? 'active' : ''}`}
                  onClick={() => setFontChoice('caveat')}
                  style={{ fontFamily: "'Caveat', cursive", fontSize: '1.15rem' }}
                >
                  Caveat
                </button>
                <button
                  type="button"
                  className={`btn-pill-choice ${fontChoice === 'homemade-apple' ? 'active' : ''}`}
                  onClick={() => setFontChoice('homemade-apple')}
                  style={{ fontFamily: "'Homemade Apple', cursive", fontSize: '0.85rem' }}
                >
                  Script
                </button>
                <button
                  type="button"
                  className={`btn-pill-choice ${fontChoice === 'playpen' ? 'active' : ''}`}
                  onClick={() => setFontChoice('playpen')}
                  style={{ fontFamily: "'Playpen Sans', cursive", fontSize: '0.9rem' }}
                >
                  Casual
                </button>
                <button
                  type="button"
                  className={`btn-pill-choice ${fontChoice === 'times-new-roman' ? 'active' : ''}`}
                  onClick={() => setFontChoice('times-new-roman')}
                  style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '0.9rem' }}
                >
                  Times
                </button>
                <button
                  type="button"
                  className={`btn-pill-choice ${fontChoice === 'helvetica' ? 'active' : ''}`}
                  onClick={() => setFontChoice('helvetica')}
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '0.82rem' }}
                >
                  Helvetica
                </button>
              </div>
            </div>

            <div className="options-section">
              <span className="options-title">Date Format</span>
              <div className="font-choice-group">
                <button
                  type="button"
                  className={`btn-pill-choice ${!useLongDate ? 'active' : ''}`}
                  onClick={() => {
                    setUseLongDate(false);
                    const now = new Date();
                    const mm = String(now.getMonth() + 1).padStart(2, '0');
                    const dd = String(now.getDate()).padStart(2, '0');
                    const yyyy = now.getFullYear();
                    onDateChange(`${mm}/${dd}/${yyyy}`);
                  }}
                >
                  Numeric
                </button>
                <button
                  type="button"
                  className={`btn-pill-choice ${useLongDate ? 'active' : ''}`}
                  onClick={() => {
                    setUseLongDate(true);
                    const now = new Date();
                    const longDate = now.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    onDateChange(longDate);
                  }}
                >
                  Editorial
                </button>
              </div>
            </div>

          </div>
        </aside>
      </main>

      {/* Export Preview Modal */}
      {exportedImage && (
        <div className="export-modal-backdrop" onClick={() => setExportedImage(null)}>
          <div className="export-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <div className="export-modal-title">
                <Check size={18} className="text-orange" />
                <span>Journal Image Downloaded</span>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setExportedImage(null)}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="export-modal-preview">
              <img src={exportedImage.url} alt="Exported Journal Composition" />
            </div>

            <div className="export-modal-actions">
              <button
                type="button"
                className="btn-primary-orange"
                onClick={() => downloadDataUrl(exportedImage.url, exportedImage.filename)}
              >
                <Download size={16} />
                <span>Download Again</span>
              </button>
              <button
                type="button"
                className="btn-secondary-link"
                onClick={() => setExportedImage(null)}
              >
                Continue Writing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
