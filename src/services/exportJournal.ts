import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';

export interface ExportResult {
  dataUrl: string;
  filename: string;
}

const EXPORT_WIDTH = 1200;
const EXPORT_HEIGHT = 900;

const exportLayoutStyles = `
  #journal-export-target.journal-export-mode {
    width: ${EXPORT_WIDTH}px !important;
    height: ${EXPORT_HEIGHT}px !important;
    max-width: none !important;
    min-width: ${EXPORT_WIDTH}px !important;
    display: flex !important;
    flex-direction: row !important;
    aspect-ratio: 4 / 3 !important;
    overflow: hidden !important;
    border-radius: 0 !important;
  }
  #journal-export-target.journal-export-mode .spread-page {
    width: 50% !important;
    height: 100% !important;
    min-height: ${EXPORT_HEIGHT}px !important;
    flex: 0 0 50% !important;
    aspect-ratio: auto !important;
  }
  #journal-export-target.journal-export-mode .spread-page-left {
    order: 1 !important;
  }
  #journal-export-target.journal-export-mode .spread-page-right {
    order: 2 !important;
    container-type: size !important;
  }
  #journal-export-target.journal-export-mode .paper-handwriting-input,
  #journal-export-target.journal-export-mode .paper-handwriting-export-layer {
    font-size: 3.6cqh !important;
    line-height: 3.23cqh !important;
    padding-top: .35cqh !important;
    text-align: center !important;
  }
  #journal-export-target.journal-export-mode .spread-cover-overlay {
    left: 21% !important;
    width: 58% !important;
    height: 30% !important;
    top: 24% !important;
  }
  #journal-export-target.journal-export-mode .spread-artwork-box {
    width: 18% !important;
  }
  #journal-export-target.journal-export-mode .paper-content-area {
    top: 12.76% !important;
    padding-top: 0 !important;
    padding-left: 8% !important;
    padding-right: 8% !important;
  }
`;

function createExportTarget(element: HTMLElement): HTMLElement {
  const target = element.cloneNode(true) as HTMLElement;
  target.classList.add('journal-export-mode');
  Object.assign(target.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${EXPORT_WIDTH}px`,
    height: `${EXPORT_HEIGHT}px`,
    maxWidth: 'none',
    minWidth: `${EXPORT_WIDTH}px`,
    aspectRatio: '4 / 3',
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden'
  });

  const textarea = target.querySelector('.paper-handwriting-input') as HTMLElement | null;
  const exportText = target.querySelector('.paper-handwriting-export-layer') as HTMLElement | null;
  if (textarea) textarea.style.display = 'none';
  if (exportText) {
    exportText.style.opacity = '1';
    exportText.style.position = 'absolute';
  }

  target.querySelectorAll<HTMLElement>('.spread-page').forEach(page => {
    page.style.width = '50%';
    page.style.height = '100%';
    page.style.minHeight = `${EXPORT_HEIGHT}px`;
    page.style.flex = '0 0 50%';
  });

  const sourceCanvas = element.querySelector('.paper-ink-canvas') as HTMLCanvasElement | null;
  const targetCanvas = target.querySelector('.paper-ink-canvas') as HTMLCanvasElement | null;
  if (sourceCanvas && targetCanvas) {
    targetCanvas.width = sourceCanvas.width;
    targetCanvas.height = sourceCanvas.height;
    targetCanvas.getContext('2d')?.drawImage(sourceCanvas, 0, 0);
  }

  const style = document.createElement('style');
  style.textContent = exportLayoutStyles;
  target.prepend(style);
  document.body.appendChild(target);
  return target;
}

/**
 * High-fidelity client-side rendering of the journal composition into a PNG image.
 * Uses html2canvas with CORS support and fallback to html-to-image.
 */
export async function renderJournalToPng(
  element: HTMLElement,
  songTitle: string
): Promise<ExportResult> {
  // Ensure all fonts are ready
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if font readiness check fails
    }
  }

  const cleanTitle = songTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'song';
  const filename = `pataphor-journal-${cleanTitle}.png`;
  const exportTarget = createExportTarget(element);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvas = await (html2canvas as any)(exportTarget, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      windowWidth: EXPORT_WIDTH,
      windowHeight: EXPORT_HEIGHT,
      onclone: (clonedDoc: Document) => {
        const target = clonedDoc.getElementById('journal-export-target');
        if (target) {
          const exportStyle = clonedDoc.createElement('style');
          exportStyle.textContent = exportLayoutStyles;
          clonedDoc.head.appendChild(exportStyle);
          const textarea = target.querySelector('.paper-handwriting-input') as HTMLElement | null;
          const exportText = target.querySelector('.paper-handwriting-export-layer') as HTMLElement | null;
          if (textarea) textarea.style.display = 'none';
          if (exportText) {
            exportText.style.opacity = '1';
            exportText.style.position = 'absolute';
          }
        }
      }
    });
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    exportTarget.remove();
    return { dataUrl, filename };
  } catch (canvasErr) {
    console.warn('html2canvas failed, falling back to html-to-image:', canvasErr);
  }

  try {
    const dataUrl = await toPng(exportTarget, {
      pixelRatio: 3,
      cacheBust: true,
      skipFonts: false,
      backgroundColor: '#f7f1e8',
      quality: 1,
      filter: (node) => {
        if ((node as HTMLElement)?.classList?.contains('export-hidden')) {
          return false;
        }
        return true;
      }
    });

    return { dataUrl, filename };
  } catch (toPngErr) {
    console.error('All rendering methods failed:', toPngErr);
    throw new Error('Failed to generate journal image.');
  } finally {
    exportTarget.remove();
  }
}

/**
 * Triggers browser download for a data URL
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 300);
}
