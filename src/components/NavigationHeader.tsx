import React from 'react';
import { PageStep } from '../types';
import { ArrowLeft } from 'lucide-react';

interface NavigationHeaderProps {
  currentStep: PageStep;
  onNavigate: (step: PageStep) => void;
  showBack?: boolean;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentStep,
  onNavigate,
  showBack = true
}) => {
  const getPreviousStep = (): PageStep | null => {
    switch (currentStep) {
      case 'search':
        return 'landing';
      case 'cover':
        return 'search';
      case 'journal':
        return 'cover';
      default:
        return null;
    }
  };

  const prevStep = getPreviousStep();
  const pageLabel = {
    landing: 'intro',
    search: 'catalog / 01',
    cover: 'selection / 02',
    journal: 'journal / 03'
  }[currentStep];

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          {showBack && prevStep && (
            <button
              type="button"
              className="btn-back"
              onClick={() => onNavigate(prevStep)}
              aria-label="Go back to previous page"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}
        </div>

        <div className="header-right">
          <span className="current-page-mark" aria-label={`Current page: ${pageLabel}`}>
            {pageLabel}
          </span>
        </div>
      </div>
    </header>
  );
};
