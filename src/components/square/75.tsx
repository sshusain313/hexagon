
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useGrid } from './context/GridContext';

interface CellImage {
  [key: string]: string;
}

const SquareGrid = () => {
  const {
    cellImages,
    isDownloading,
    getCellStyle,
    startDrag,
    handleCellActivate,
    downloadImage,
  } = useGrid();

  // Component-scoped unique ID helpers
  const COMP_ID = 'grid-75';
  const cid = (section: string, row: number | string, col: number | string) => `${COMP_ID}:${section}:${row}-${col}`;

  const handleCellClick = (cellKey: string) => handleCellActivate(cellKey);

  

  // Canvas helpers: load image and draw with object-fit: cover
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

  // Render this template to canvas:
  // Rows: 11 total [topExt, topA, topB, mid x5, bottomA, bottomB, bottomC]
  // Cols: 9
  // Middle layout per row: L(2) + Center(5 on first row spans 5 rows) + R(2)
  const buildAndDownload = async () => {
    if (!Object.keys(cellImages).length) {
      toast.error('Please upload at least one image before downloading.');
      return;
    }
    await downloadImage('template-75.png', {
      cols: 9,
      rows: 11,
      // base: 100,
         // Target physical size for print within requested ranges
      targetWidthIn: 9.5,
      targetHeightIn: 13.5,
      dpi: 300,
      desiredGapPx: 4,
      draw: async ({ drawKey }) => {
        // topExt (row 0)
        await Promise.all(Array.from({ length: 9 }, (_, c) => drawKey(cid('topExt', -1, c + 2), 0, c)));
        // topA (row 1)
        await Promise.all(Array.from({ length: 9 }, (_, c) => drawKey(cid('topA', 0, c), 1, c)));
        // topB (row 2)
        await Promise.all(Array.from({ length: 9 }, (_, c) => drawKey(cid('topB', 0, c), 2, c)));
        // middle rows (rows 3..7) -> 5 rows
        for (let i = 0; i < 5; i++) {
          const r = 3 + i;
          // Left 2 cells
          await Promise.all([0, 1].map((lc) => drawKey(cid('midL', i + 1, lc), r, lc)));
          // Center span on first middle row
          if (i === 0) await drawKey(cid('center', 0, 0), 3, 2, 5, 5);
          // Right 2 cells at cols 7,8
          await Promise.all([7, 8].map((rc, idx) => drawKey(cid('midR', i + 1, 7 + idx), r, rc)));
        }
        // bottoms
        await Promise.all(Array.from({ length: 9 }, (_, c) => drawKey(cid('bottomA', 8, c), 8, c)));
        await Promise.all(Array.from({ length: 9 }, (_, c) => drawKey(cid('bottomB', 8, c), 9, c)));
        await Promise.all(Array.from({ length: 9 }, (_, c) => drawKey(cid('bottomC', 8, c), 10, c)));
      },
    });
    toast.success('Template downloaded!');
  };

  const handleDownload = buildAndDownload;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="fixed top-4 left-4 z-10">
        <Link 
          to="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          ← Original Grid
        </Link>
      </div>

      {/* File input handled globally by GridProvider */}
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Square Grid Layout</h1>
        <p className="text-gray-600">Click on any cell to upload an image</p>
      </div>
      
      <div className="grid grid-cols-9 gap-1 p-6 bg-white rounded-xl shadow-2xl">

       <div className="col-span-9 flex justify-center gap-1">
          {Array.from({ length: 9 }, (_, colIndex) => {
            const key = cid('topExt', -1, colIndex + 2);
            return (
              <div
                key={key}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
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
        </div>

        {/* Top row - 9 cells (A) */}
        {Array.from({ length: 9 }, (_, colIndex) => {
          const key = cid('topA', 0, colIndex);
          return (
            <div
              key={key}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
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

        {Array.from({ length: 9 }, (_, colIndex) => {
          const key = cid('topB', 0, colIndex);
          return (
            <div
              key={key}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(key)}
              onClick={() => handleCellClick(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(key);
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

        {/* Middle rows with left border cells, center cell, and right border cells */}
        {Array.from({ length: 5 }, (_, rowIndex) => (
          <React.Fragment key={`middle-row-${rowIndex}`}>
            {/* Left border cells - 2 columns */}
            {Array.from({ length: 2 }, (_, colIndex) => (
              <div
                key={cid('midL', rowIndex + 1, colIndex)}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                style={getCellStyle(cid('midL', rowIndex + 1, colIndex))}
                onMouseDown={(e) => startDrag(e, cid('midL', rowIndex + 1, colIndex))}
                onTouchStart={(e) => startDrag(e, cid('midL', rowIndex + 1, colIndex))}
                onClick={() => handleCellActivate(cid('midL', rowIndex + 1, colIndex))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellActivate(cid('midL', rowIndex + 1, colIndex));
                  }
                }}
              >
                {!cellImages[cid('midL', rowIndex + 1, colIndex)] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                    +
                  </div>
                )}
              </div>
            ))}

            {/* Center cell - only render once and span 5 columns and 5 rows */}
            {rowIndex === 0 && (
              <div
                className="col-span-5 row-span-5 grid-cell active:animate-grid-pulse flex items-center justify-center text-white font-bold text-2xl relative overflow-hidden cursor-pointer"
                style={getCellStyle(cid('center', 0, 0))}
                onMouseDown={(e) => startDrag(e, cid('center', 0, 0))}
                onTouchStart={(e) => startDrag(e, cid('center', 0, 0))}
                onClick={() => handleCellActivate(cid('center', 0, 0))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellActivate(cid('center', 0, 0));
                  }
                }}
              >
                {!cellImages[cid('center', 0, 0)] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span>CENTER</span>
                  </div>
                )}
              </div>
            )}

            {/* Right border cells - 2 columns */}
            {Array.from({ length: 2 }, (_, colIndex) => (
              <div
                key={cid('midR', rowIndex + 1, 7 + colIndex)}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                style={getCellStyle(cid('midR', rowIndex + 1, 7 + colIndex))}
                onMouseDown={(e) => startDrag(e, cid('midR', rowIndex + 1, 7 + colIndex))}
                onTouchStart={(e) => startDrag(e, cid('midR', rowIndex + 1, 7 + colIndex))}
                onClick={() => handleCellActivate(cid('midR', rowIndex + 1, 7 + colIndex))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellActivate(cid('midR', rowIndex + 1, 7 + colIndex));
                  }
                }}
              >
                {!cellImages[cid('midR', rowIndex + 1, 7 + colIndex)] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                    +
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}

        {/* Bottom row - 9 cells (A) */}
        {Array.from({ length: 9 }, (_, colIndex) => {
          const key = cid('bottomA', 8, colIndex);
          return (
            <div
              key={key}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(key)}
              onClick={() => handleCellClick(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(key);
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

         {Array.from({ length: 9 }, (_, colIndex) => {
          const key = cid('bottomB', 8, colIndex);
          return (
            <div
              key={key}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(key)}
              onClick={() => handleCellClick(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(key);
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

        {Array.from({ length: 9 }, (_, colIndex) => {
          const key = cid('bottomC', 8, colIndex);
          return (
            <div
              key={key}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(key)}
              onClick={() => handleCellClick(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(key);
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
      
      <div className="mt-6 flex flex-col items-center gap-4 max-w-md">
        <button
          onClick={handleDownload}
          disabled={!Object.keys(cellImages).length || isDownloading}
          className={`px-5 py-2 rounded-lg text-white shadow ${
            !Object.keys(cellImages).length || isDownloading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
          aria-disabled={!Object.keys(cellImages).length || isDownloading}
        >
          {isDownloading ? 'Preparing...' : 'Download Template'}
        </button>
        <p className="text-sm text-gray-500">
          Click on any cell to upload an image. Images will be automatically clipped to fit each cell perfectly.
        </p>
      </div>
    </div>
  );
};

export default SquareGrid;
