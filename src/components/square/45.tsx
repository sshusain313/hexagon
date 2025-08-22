
import React from 'react';
import { toast } from 'sonner';
import { useGrid } from './context/GridContext';

const GridBoard = () => {
  const {
    cellImages,
    isDownloading,
    getCellStyle,
    startDrag,
    handleCellActivate,
    downloadImage,
  } = useGrid();

  const COMP_ID = 'grid-45';
  const cid = (section: string, row: number | string, col: number | string) => `${COMP_ID}:${section}:${row}-${col}`;

  const buildAndDownload = async () => {
    if (!Object.keys(cellImages).length) {
      toast.error('Please upload at least one image before downloading.');
      return;
    }
    await downloadImage('template-45.png', {
      cols: 8,
      rows: 12,
      base: 100,
      desiredGapPx: 3,
      draw: async ({ drawKey }) => {
        // Row 0: top extension (6 cells) centered at cols 1..6
        await Promise.all(
          Array.from({ length: 6 }, (_, i) => drawKey(cid('top-extension', -1, i + 2), 0, 1 + i))
        );
        // Row 1: top row (8 cells)
        await Promise.all(
          Array.from({ length: 8 }, (_, c) => drawKey(cid('top', 0, c), 1, c))
        );
        // Rows 2..9: middle 8 rows
        for (let i = 0; i < 8; i++) {
          const r = 2 + i;
          await drawKey(cid('midL', i + 1, 0), r, 0);
          if (i === 0) {
            // center spans 6 cols x 8 rows starting row 2, col 1
            await drawKey(cid('center', 0, 0), 2, 1, 8, 6);
          }
          await drawKey(cid('midR', i + 1, 7), r, 7);
        }
        // Row 10: bottom row
        await Promise.all(
          Array.from({ length: 8 }, (_, c) => drawKey(cid('bottom', 8, c), 10, c))
        );
        // Row 11: bottom extension (6 cells) centered at cols 1..6
        await Promise.all(
          Array.from({ length: 6 }, (_, i) => drawKey(cid('bottom-extension', -1, i + 2), 11, 1 + i))
        );
      },
    });
    toast.success('Template downloaded!');
  };

  const handleDownload = buildAndDownload;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Interactive Grid</h1>
        <p className="text-gray-600">Click on any cell to upload an image</p>
      </div>
      
      <div className="grid grid-cols-8 gap-1 p-6 bg-white rounded-xl shadow-2xl">
        
        {/* Top extension - 6 cells centered (non-intrusive full-row) */}
        <div className="col-span-8 flex justify-center gap-1">
          {Array.from({ length: 6 }, (_, colIndex) => {
            const key = cid('top-extension', -1, colIndex + 2);
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
        
        {/* Top row - 8 cells */}
        {Array.from({ length: 8 }, (_, colIndex) => {
          const key = cid('top', 0, colIndex);
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

        {/* Middle rows with left border, center cell, and right border */}
        {Array.from({ length: 8 }, (_, rowIndex) => (
          <React.Fragment key={cid('mid', rowIndex + 1, 0)}>
            {/* Left border cell */}
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(cid('midL', rowIndex + 1, 0))}  
              onMouseDown={(e) => startDrag(e, cid('midL', rowIndex + 1, 0))}
              onTouchStart={(e) => startDrag(e, cid('midL', rowIndex + 1, 0))}
              onClick={() => handleCellActivate(cid('midL', rowIndex + 1, 0))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellActivate(cid('midL', rowIndex + 1, 0));
                }
              }}
            >
              {!cellImages[cid('midL', rowIndex + 1, 0)] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>

            {/* Center cell - only render once and span 6 columns */}
            {rowIndex === 0 && (
              <div
                className="col-span-6 row-span-8 grid-cell active:animate-grid-pulse flex items-center justify-center text-white font-bold text-lg relative overflow-hidden"
                style={getCellStyle(cid('center', 0, 0))}
                onMouseDown={(e) => startDrag(e, cid('center', 0, 0))}
                onTouchStart={(e) => startDrag(e, cid('center', 0, 0))}
                onClick={() => handleCellActivate(cid('center', 0, 0))}
                role="button"
                tabIndex={0}
                // onKeyDown={(e) => {
                //   if (e.key === 'Enter' || e.key === ' ') {
                //     e.preventDefault();
                //     handleCellActivate('center');
                //   }
                // }}
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
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(cid('midR', rowIndex + 1, 7))}
              onMouseDown={(e) => startDrag(e, cid('midR', rowIndex + 1, 7))}
              onTouchStart={(e) => startDrag(e, cid('midR', rowIndex + 1, 7))}
              onClick={() => handleCellActivate(cid('midR', rowIndex + 1, 7))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellActivate(cid('midR', rowIndex + 1, 7));
                }
              }}
            >
              {!cellImages[cid('midR', rowIndex + 1, 7)] && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                  +
                </div>
              )}
            </div>
          </React.Fragment>
        ))}

        {/* Bottom row - 8 cells */}
        {Array.from({ length: 8 }, (_, colIndex) => {
          const key = cid('bottom', 8, colIndex);
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

         {/* Bottom extension - 6 cells centered */}
        <div className="col-span-8 flex justify-center gap-1">
          {Array.from({ length: 6 }, (_, colIndex) => {
            const key = cid('bottom-extension', -1, colIndex + 2);
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

export default GridBoard;
