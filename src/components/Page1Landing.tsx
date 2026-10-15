import React from 'react';
import { PataphorLogo } from './Logo';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Page1LandingProps {
  onStart: () => void;
}

export const Page1Landing: React.FC<Page1LandingProps> = ({ onStart }) => {
  return (
    <div className="landing-page-container">
      <header className="landing-header">
        <PataphorLogo
          style={{ width: 'clamp(220px, 28vw, 380px)', height: 'auto' }}
          title="Pataphor"
        />
        <span className="landing-issue-mark">listening room / 001</span>
      </header>

      <main className="landing-content">
        <div className="definition-block">
          <h1 className="definition-line line-1">pataphor (n.) a</h1>
          <h2 className="definition-line line-2">metaphor carried beyond</h2>
          <h2 className="definition-line line-3">comparison, into a</h2>
          <h2 className="definition-line line-4">world of its own.</h2>
        </div>

        <div className="landing-narrative">
          <p className="narrative-lead">
            A quiet place for songs, memories, and the worlds they open.
          </p>
          <p className="narrative-sub">for everything a song makes you feel</p>
        </div>

        <div className="landing-actions">
          <motion.button
            type="button"
            className="btn-primary-orange"
            onClick={onStart}
            autoFocus
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 18 }}
          >
            <span>Begin Journal</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </main>

      <footer className="landing-footer">
        <span>pataphor / music journal</span>
        <span>keep what remains</span>
      </footer>
    </div>
  );
};
