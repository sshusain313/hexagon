
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface CellImage {
  [key: string]: string;
}

const SquareGrid = () => {
  const [cellImages, setCellImages] = useState<CellImage>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // Component-scoped unique ID helpers
  const COMP_ID = 'grid-73';
  const cid = (section: string, row: number | string, col: number | string) => `${COMP_ID}:${section}:${row}-${col}`;

  const handleCellClick = (cellKey: string) => {
    setSelectedCell(cellKey);
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCell) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setCellImages(prev => ({
        ...prev,
        [selectedCell]: imageUrl
      }));
      toast.success('Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    event.target.value = '';
    setSelectedCell(null);
  };

  const getCellStyle = (cellKey: string) => {
    const image = cellImages[cellKey];
    if (image) {
      return {
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {};
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-8">
      <div className="fixed top-4 left-4 z-10">
        <Link 
          to="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          ← Original Grid
        </Link>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      {/* Content wrapper to keep rows from wrapping on small screens */}
      <div className="w-[110%] sm:w-full overflow-hidden pb-2 sm:pb-4">
        <div className="inline-grid grid-cols-9 gap-1 p-2 sm:p-6 bg-white rounded-xl shadow-2xl">

          {/* Top extension - centered */}
          <div className="col-span-9 flex justify-center gap-1">
            {Array.from({ length: 7 }, (_, colIndex) => {
              const key = cid('topExt', -1, colIndex + 2);
              return (
                <div
                  key={key}
                  className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 grid-cell active:animate-grid-pulse relative overflow-hidden"
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

          {/* Top rows - A and B */}
          <div className="col-span-9 flex justify-center gap-1">
            {Array.from({ length: 9 }, (_, colIndex) => {
              const key = cid('topA', 0, colIndex);
              return (
                <div
                  key={key}
                  className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
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

          <div className="col-span-9 flex justify-center gap-1">
            {Array.from({ length: 9 }, (_, colIndex) => {
              const key = cid('topB', 0, colIndex);
              return (
                <div
                  key={key}
                  className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
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

          {/* Middle section: Left stacks (2 cols) + 5x5 center + Right stacks (2 cols) */}
          <div className="col-span-9 flex justify-center gap-1 items-stretch">
            {/* Left stacks */}
            {Array.from({ length: 2 }, (_, colIndex) => (
              <div key={`midL-col-${colIndex}`} className="flex flex-col gap-1">
                {Array.from({ length: 5 }, (_, rowIndex) => (
                  <div
                    key={cid('midL', rowIndex + 1, colIndex)}
                    className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 flex-none grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                    style={getCellStyle(cid('midL', rowIndex + 1, colIndex))}
                    onClick={() => handleCellClick(cid('midL', rowIndex + 1, colIndex))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCellClick(cid('midL', rowIndex + 1, colIndex));
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
              </div>
            ))}

            {/* Center 5x5 */}
            <div
              className="w-[calc(5*2rem+4*0.25rem)] sm:w-[calc(5*4rem+4*0.25rem)] md:w-[calc(5*5rem+4*0.25rem)] h-[calc(5*2rem+4*0.25rem)] sm:h-[calc(5*4rem+4*0.25rem)] md:h-[calc(5*5rem+4*0.25rem)] shrink-0 flex-none grid-cell active:animate-grid-pulse flex items-center justify-center text-white font-bold text-2xl relative overflow-hidden cursor-pointer"
              style={getCellStyle(cid('center', 0, 0))}
              onClick={() => handleCellClick(cid('center', 0, 0))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick(cid('center', 0, 0));
                }
              }}
            >
              {!cellImages[cid('center', 0, 0)] && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span>CENTER</span>
                </div>
              )}
            </div>

            {/* Right stacks */}
            {Array.from({ length: 2 }, (_, colIndex) => (
              <div key={`midR-col-${colIndex}`} className="flex flex-col gap-1">
                {Array.from({ length: 5 }, (_, rowIndex) => (
                  <div
                    key={cid('midR', rowIndex + 1, 7 + colIndex)}
                    className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 flex-none grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                    style={getCellStyle(cid('midR', rowIndex + 1, 7 + colIndex))}
                    onClick={() => handleCellClick(cid('midR', rowIndex + 1, 7 + colIndex))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCellClick(cid('midR', rowIndex + 1, 7 + colIndex));
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
              </div>
            ))}
          </div>

          {/* Bottom rows - A, B, C */}
          <div className="col-span-9 flex justify-center gap-1">
            {Array.from({ length: 9 }, (_, colIndex) => {
              const key = cid('bottomA', 8, colIndex);
              return (
                <div
                  key={key}
                  className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
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

          <div className="col-span-9 flex justify-center gap-1">
            {Array.from({ length: 9 }, (_, colIndex) => {
              const key = cid('bottomB', 8, colIndex);
              return (
                <div
                  key={key}
                  className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
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

          <div className="col-span-9 flex justify-center gap-1">
            {Array.from({ length: 9 }, (_, colIndex) => {
              const key = cid('bottomC', 8, colIndex);
              return (
                <div
                  key={key}
                  className="w-8 h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
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
        </div>
      </div>
      
      <div className="mt-8 text-center max-w-md">
        <p className="text-sm text-gray-500">
          Click on any cell to upload an image. Images will be automatically clipped to fit each cell perfectly.
        </p>
      </div>
    </div>
  );
};

export default SquareGrid;
