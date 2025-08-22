
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {useGrid} from './context/GridContext';

interface CellImage {
  [key: string]: string;
}

const GridBoard = () => {
  const {
    cellImages,
    isDownloading,
    getCellStyle,
    startDrag,
    handleCellActivate,
    downloadImage,
  } = useGrid();

  // Responsive breakpoint check for desktop
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    // Treat >=1024px as PC/desktop
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      setIsDesktop(matches);
    };
    // Initialize
    setIsDesktop(mq.matches);
    // Subscribe
    if (mq.addEventListener) {
      mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    } else {
      // Safari fallback
      // @ts-ignore
      mq.addListener(handler);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
      } else {
        // @ts-ignore
        mq.removeListener(handler);
      }
    };
  }, []);

  // Unique component-scoped ID helpers
  const COMP_ID = 'grid-33';
  const cid = (section: string, row: number, col: number) => `${COMP_ID}:${section}:${row}-${col}`;

  const handleCellClick = (cellKey: string) => handleCellActivate(cellKey);

  // Canvas helpers and renderer for this 8x10 layout
  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ) => {
    const sRatio = img.width / img.height;
    const dRatio = dw / dh;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (sRatio > dRatio) {
      sh = img.height;
      sw = sh * dRatio;
      sx = (img.width - sw) / 2;
    } else {
      sw = img.width;
      sh = sw / dRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  };

  const buildAndDownload = async () => {
    if (!Object.keys(cellImages).length) {
      toast.error('Please upload at least one image before downloading.');
      return;
    }
    await downloadImage('template-33.png', {
      cols: 8,
      rows: 10,
      // Target physical size for print within requested ranges
      targetWidthIn: 9.5,
      targetHeightIn: 13.5,
      dpi: 300,
      desiredGapPx: 2,
      draw: async ({ drawKey }) => {
        // Top row r=0, cols 0..7
        await Promise.all(Array.from({ length: 8 }, (_, c) => drawKey(cid('top', 0, c), 0, c)));

        // Middle rows r=1..8
        for (let i = 0; i < 8; i++) {
          const r = 1 + i;
          await drawKey(cid('left', i + 1, 0), r, 0);
          if (i === 0) {
            // Center spans 6 cols by 8 rows starting at row 1, col 1
            await drawKey(cid('center', 0, 0), 1, 1, 8, 6);
          }
          await drawKey(cid('right', i + 1, 7), r, 7);
        }

        // Bottom row r=9, cols 0..7
        await Promise.all(Array.from({ length: 8 }, (_, c) => drawKey(cid('bottom', 9, c), 9, c)));
      },
    });
    toast.success('Template downloaded!');
  };

  const handleDownload = buildAndDownload;

  // Listen to a global download trigger from the parent preview container
  useEffect(() => {
    const onDownload = () => {
      handleDownload();
    };
    window.addEventListener('grid-template-download', onDownload);
    return () => window.removeEventListener('grid-template-download', onDownload);
  }, [handleDownload]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 md:p-6">

      <div
        className="grid grid-cols-8 bg-white rounded-xl shadow-2xl p-1 md:p-3"
        style={{
          gap: 'var(--gap)',
          // 7 gaps across 8 cols/rows
          // cell = min(fit width, fit height)
          // ratio keeps cells slightly taller than wide
          // pad approximates container padding on mobile
          ['--gap' as any]: '2px',
          ['--pad' as any]: '8px',
          ['--cell' as any]: isDesktop
            ? 'min(calc((35vw - (var(--pad)*2) - (7 * var(--gap))) / 8), calc((100vh - (var(--pad)*2) - (7 * var(--gap))) / 8))'
            : 'min(calc((100vw - (var(--pad)*2) - (7 * var(--gap))) / 8), calc((100vh - (var(--pad)*2) - (7 * var(--gap))) / 8))',
          ['--ratio' as any]: '1.2',
          ['--row' as any]: 'calc(var(--cell) * var(--ratio))',
          gridAutoRows: 'var(--row)',
          gridTemplateColumns: 'repeat(8, var(--cell))'
        } as React.CSSProperties}
      >
        
         {/* Top extension - 1 cells centered (non-intrusive full-row) */}
         {/* <div className="col-span-8 flex justify-center gap-1">
          {Array.from({ length: 5 }, (_, colIndex) => {
            const cellKey = cid('topExt', -1, colIndex + 2);
            return (
              <div
                key={cellKey}
                className="w-12 h-20 sm:w-16 sm:h-20 md:w-20 md:h-[6.0rem] grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                style={getCellStyle(cellKey)}
                onClick={() => handleCellClick(cellKey)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellClick(cellKey);
                  }
                }}
              >
                {!cellImages[cellKey] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div> */}

        {/* Top row - 9 cells */}
        {Array.from({ length: 8 }, (_, colIndex) => {
          const cellKey = cid('top', 0, colIndex);
          return (
            <div
              key={cellKey}
              className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={{ ...(getCellStyle(cellKey) as any) }}
              onClick={() => handleCellClick(cellKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(cellKey);
                }
              }}
            >
              {!cellImages[cellKey] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>
          );
        })}

        {/* Middle rows with left border, center cell, and right border */}
        {Array.from({ length: 6 }, (_, rowIndex) => (
          <React.Fragment key={`middle-row-${rowIndex}`}>
            {/* Left border cell */}
            <div
              className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={{ ...(getCellStyle(cid('left', rowIndex + 1, 0)) as any) }}
              onClick={() => handleCellClick(cid('left', rowIndex + 1, 0))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(cid('left', rowIndex + 1, 0));
                }
              }}
            >
              {!cellImages[cid('left', rowIndex + 1, 0)] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>

            {/* Center cell - only render once and span 5 columns */}
            {rowIndex === 0 && (
              <div
                className="col-span-6 row-span-6 grid-cell active:animate-grid-pulse flex items-center justify-center text-white font-bold text-lg relative overflow-hidden"
                style={getCellStyle(cid('center', 0, 0))}
                onClick={() => handleCellClick(cid('center', 0, 0))}
                role="button"
                tabIndex={0}
              >
                {!cellImages[cid('center', 0, 0)] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span>CENTER</span>
                  </div>
                )}
              </div>
            )}

            {/* Right border cell */}
            <div
              className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={{ ...(getCellStyle(cid('right', rowIndex + 1, 7)) as any) }}
              onClick={() => handleCellClick(cid('right', rowIndex + 1, 7))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(cid('right', rowIndex + 1, 7));
                }
              }}
            >
              {!cellImages[cid('right', rowIndex + 1, 7)] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>
          </React.Fragment>
        ))}

        {/* Bottom row - 9 cells */}
        {Array.from({ length: 8 }, (_, colIndex) => {
          const cellKey = cid('bottom', 9, colIndex);
          return (
            <div
              key={cellKey}
              className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={{ ...(getCellStyle(cellKey) as any) }}
              onClick={() => handleCellClick(cellKey)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(cellKey);
                }
              }}
            >
              {!cellImages[cellKey] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom extension - centered on all sizes, same size as grid cells */}
        <div className="col-span-8">
          <div
            className="grid"
            style={{
              display: 'grid',
              gap: 'var(--gap)',
              gridAutoFlow: 'column',
              gridAutoColumns: 'var(--cell)',
              gridAutoRows: 'var(--row)',
              justifyContent: 'center',
            } as React.CSSProperties}
          >
            {Array.from({ length: 6 }, (_, colIndex) => {
              const key = cid('bottom-extension', -1, colIndex + 2);
              return (
                <div
                  key={key}
                  className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                  style={{ ...(getCellStyle(key) as any) }}
                  onMouseDown={(e) => startDrag(e, key)}
                  onTouchStart={(e) => startDrag(e, key)}
                  onClick={() => handleCellActivate(key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCellActivate(key);
                    }
                  }}
                >
                  {!cellImages[key] && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom extension - 4 cells centered */}
        {/* <div className="col-span-6 flex justify-center gap-1">
          {Array.from({ length: 6 }, (_, colIndex) => {
            const key = cid('bottom-extension', -1, colIndex + 2);
            return (
              <div
                key={key}
                className="grid-cell w-full active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                style={getCellStyle(key)}
                onMouseDown={(e) => startDrag(e, key)}
                onTouchStart={(e) => startDrag(e, key)}
                onClick={() => handleCellActivate(key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellActivate(key);
                  }
                }}
              >
                {!cellImages[key] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div> */}

      </div>
      
      

      <div className="hidden md:block mt-8 text-center max-w-md">
        <p className="text-sm text-gray-500">
          Click on any cell to upload an image. Images will be automatically clipped to fit each cell perfectly.
        </p>
      </div>
    </div>
  );
};

export default GridBoard;
