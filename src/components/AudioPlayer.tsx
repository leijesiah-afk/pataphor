import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  previewUrl?: string;
  trackName: string;
  artistName: string;
  autoPlay?: boolean;
  compact?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  previewUrl,
  trackName,
  artistName,
  compact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Stop playback if previewUrl changes
    setIsPlaying(false);
    setProgress(0);
    setError(null);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [previewUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewUrl) return;

    if (!audioRef.current) {
      const audio = new Audio(previewUrl);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          setDuration(audio.duration);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audio.onerror = () => {
        setError('Preview unavailable');
        setIsPlaying(false);
      };
      audio.preload = 'metadata';
    } else if (audioRef.current.src !== previewUrl) {
      audioRef.current.src = previewUrl;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setError(null);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setError('Preview unavailable');
          setIsPlaying(false);
        });
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!previewUrl) {
    return (
      <div className="audio-player-unavailable">
        <span className="text-muted">Preview unavailable</span>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        className={`audio-btn-compact ${isPlaying ? 'is-playing' : ''}`}
        onClick={togglePlay}
        title={isPlaying ? 'Pause 30s preview' : 'Play 30s preview'}
        aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        <span>Song • {artistName}</span>
      </button>
    );
  }

  return (
    <div className={`audio-player-bar ${isPlaying ? 'is-playing' : ''}`}>
      <button
        type="button"
        className="audio-play-toggle"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause audio preview' : 'Play audio preview'}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <div className="audio-info">
        <div className="audio-labels">
          <span className="audio-track-title">{trackName}</span>
          <span className="audio-artist"> — {artistName}</span>
          <span className="audio-preview-tag">30s Preview</span>
        </div>
        <div className="audio-progress-track" onClick={(e) => {
          if (!audioRef.current || !duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPos = (e.clientX - rect.left) / rect.width;
          audioRef.current.currentTime = clickPos * duration;
          setProgress(clickPos * 100);
        }}>
          <div className="audio-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="audio-status">
        {error ? (
          <span className="audio-error" title="This provider preview is no longer available">
            <AlertCircle size={14} /> {error}
          </span>
        ) : (
          <Volume2 size={16} className={isPlaying ? 'pulse-icon' : 'text-muted'} />
        )}
      </div>
    </div>
  );
};
