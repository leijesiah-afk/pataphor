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
    display: block !important;
    aspect-ratio: 4 / 3 !important;
    overflow: hidden !important;
    border-radius: 0 !important;
  }
  #journal-export-target.journal-export-mode .spread-page {
    position: absolute !important;
    top: 0 !important;
    width: ${EXPORT_WIDTH / 2}px !important;
    height: ${EXPORT_HEIGHT}px !important;
    min-height: ${EXPORT_HEIGHT}px !important;
    min-width: 0 !important;
    flex: none !important;
    aspect-ratio: auto !important;
    overflow: hidden !important;
  }
  #journal-export-target.journal-export-mode .spread-cover-image {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    min-width: 0 !important;
    min-height: 0 !important;
    max-width: none !important;
    object-fit: fill !important;
    display: block !important;
  }
  #journal-export-target.journal-export-mode .spread-page-left {
    left: 0 !important;
    order: 1 !important;
  }
  #journal-export-target.journal-export-mode .spread-page-right {
    left: ${EXPORT_WIDTH / 2}px !important;
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
    left: 7% !important;
    width: 86% !important;
    height: 32% !important;
    top: 20% !important;
    display: grid !important;
    grid-template-columns: 22% minmax(0, 1fr) !important;
    align-items: center !important;
    gap: 6% !important;
    padding: 4% 5% !important;
    background: #faf8f5 !important;
    border: 1px solid rgba(25, 18, 12, .86) !important;
    box-shadow: 6px 6px 0 rgba(25, 18, 12, .16) !important;
    overflow: visible !important;
  }
  #journal-export-target.journal-export-mode .spread-fabric-logo-strip {
    top: 8% !important;
    height: 10% !important;
    border: 1px solid rgba(36, 27, 27, .72) !important;
  }
  #journal-export-target.journal-export-mode .spread-fabric-logo-strip svg {
    width: 58% !important;
    height: auto !important;
    max-height: 100% !important;
    object-fit: contain !important;
  }
  #journal-export-target.journal-export-mode .spread-fabric-artwork {
    top: 24% !important;
    left: 20% !important;
    width: 60% !important;
    transform: rotate(-3deg) !important;
    box-shadow: 14px 16px 0 rgba(53, 30, 40, .45) !important;
  }
  #journal-export-target.journal-export-mode .spread-fabric-title-strip,
  #journal-export-target.journal-export-mode .spread-fabric-artist-strip {
    display: inline-block !important;
    box-sizing: border-box !important;
    z-index: 5 !important;
    width: auto !important;
    max-width: none !important;
    min-height: 0 !important;
    padding: 6px 10px !important;
    color: #241b1b !important;
    background: #faf8f5 !important;
    border: 1px solid rgba(36, 27, 27, .72) !important;
    box-shadow: 5px 6px 0 rgba(53, 30, 40, .28) !important;
    font-family: Georgia, "Times New Roman", serif !important;
    font-weight: 400 !important;
    line-height: 1.08 !important;
    overflow: hidden !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    white-space: normal !important;
    transform-origin: left center !important;
  }
  #journal-export-target.journal-export-mode .spread-fabric-title-strip {
    top: 80% !important;
    left: 8% !important;
    transform: rotate(-7deg) !important;
    font-size: 17px !important;
  }
  #journal-export-target.journal-export-mode .spread-fabric-artist-strip {
    top: 89% !important;
    left: 19% !important;
    transform: rotate(5deg) !important;
    font-size: 14px !important;
  }
  #journal-export-target.journal-export-mode .spread-artwork-box {
    width: 100% !important;
    height: auto !important;
  }
  #journal-export-target.journal-export-mode .spread-cover-meta {
    min-width: 0 !important;
    gap: 7px !important;
    overflow: visible !important;
  }
  #journal-export-target.journal-export-mode .spread-song-title {
    font-family: "Cormorant Garamond", Georgia, serif !important;
    font-size: 34px !important;
    font-weight: 600 !important;
    line-height: 1.04 !important;
    letter-spacing: -.02em !important;
    overflow: visible !important;
    white-space: normal !important;
  }
  #journal-export-target.journal-export-mode .spread-song-artist {
    font-family: "Times New Roman", Times, serif !important;
    font-size: 22px !important;
    line-height: 1.1 !important;
    overflow: visible !important;
    white-space: normal !important;
  }
  #journal-export-target.journal-export-mode .spread-cover-overlay:before {
    content: "COMPOSITION BOOK / FIELD NOTE 001" !important;
    position: absolute !important;
    top: 9% !important;
    right: 5% !important;
    color: rgba(137, 49, 1, .62) !important;
    font-family: "Times New Roman", Times, serif !important;
    font-size: 10px !important;
    letter-spacing: 2px !important;
    line-height: 1 !important;
    text-transform: uppercase !important;
  }
  #journal-export-target.journal-export-mode .paper-content-area {
    top: 12.76% !important;
    padding-top: 0 !important;
    padding-left: 8% !important;
    padding-right: 8% !important;
  }
`;

async function rasterizeCoverImage(source: HTMLImageElement): Promise<string | null> {
  if (!source.currentSrc && !source.src) return null;

  try {
    const response = await fetch(source.currentSrc || source.src);
    if (!response.ok) return null;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Cover image could not be loaded.'));
    });

    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_WIDTH / 2;
    canvas.height = EXPORT_HEIGHT;
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(objectUrl);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.warn('Could not rasterize composition cover for export:', error);
    return null;
  }
}

async function createExportTarget(element: HTMLElement): Promise<HTMLElement> {
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
    display: 'block',
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
    page.style.position = 'absolute';
    page.style.top = '0';
    page.style.width = `${EXPORT_WIDTH / 2}px`;
    page.style.height = '100%';
    page.style.minHeight = `${EXPORT_HEIGHT}px`;
    page.style.minWidth = '0';
    page.style.flex = 'none';
    page.style.overflow = 'hidden';
  });

  const leftPage = target.querySelector('.spread-page-left') as HTMLElement | null;
  const rightPage = target.querySelector('.spread-page-right') as HTMLElement | null;
  if (leftPage) leftPage.style.left = '0';
  if (rightPage) rightPage.style.left = `${EXPORT_WIDTH / 2}px`;

  const coverImage = target.querySelector('.spread-cover-image') as HTMLImageElement | null;
  if (coverImage) {
    const sourceCover = element.querySelector('.spread-cover-image') as HTMLImageElement | null;
    const rasterizedCover = sourceCover ? await rasterizeCoverImage(sourceCover) : null;
    if (rasterizedCover) {
      coverImage.src = rasterizedCover;
      coverImage.removeAttribute('crossorigin');
    }
    coverImage.style.width = `${EXPORT_WIDTH / 2}px`;
    coverImage.style.height = `${EXPORT_HEIGHT}px`;
    coverImage.style.position = 'absolute';
    coverImage.style.inset = '0';
    coverImage.style.maxWidth = 'none';
    coverImage.style.objectFit = 'fill';
    coverImage.style.display = 'block';
  }

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
  const filename = `pataphor-field-note-${cleanTitle}.png`;
  const exportTarget = await createExportTarget(element);

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
