
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

  const handleCellClick = (cellType: string, position?: { row: number, col: number }) => {
    let cellKey: string;
    
    if (cellType === 'center') {
      cellKey = 'center';
      console.log('Center cell clicked');
    } else {
      cellKey = `${position?.row}-${position?.col}`;
      console.log(`Border cell clicked: row ${position?.row}, col ${position?.col}`);
    }
    
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
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
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Square Grid Layout</h1>
        <p className="text-gray-600">Click on any cell to upload an image</p>
      </div>
      
      <div className="grid grid-cols-9 gap-1 p-6 bg-white rounded-xl shadow-2xl">


        {/* Top extension - 1 cells centered (non-intrusive full-row) */}
         <div className="col-span-9 flex justify-center gap-1">
          {Array.from({ length: 7 }, (_, colIndex) => {
            const cellKey = `-1-${colIndex + 2}`;
            return (
              <div
                key={`top-extension-${colIndex}`}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden"
                style={getCellStyle(cellKey)}
                onClick={() => handleCellClick('border', { row: -1, col: colIndex + 2 })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellClick('border', { row: -1, col: colIndex + 2 });
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
        </div>

        {/* Top row - 9 cells */}
        {Array.from({ length: 9 }, (_, colIndex) => {
          const cellKey = `0-${colIndex}`;
          return (
            <div
              key={`top-${colIndex}`}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(cellKey)}
              onClick={() => handleCellClick('border', { row: 0, col: colIndex })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick('border', { row: 0, col: colIndex });
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

        {Array.from({ length: 9 }, (_, colIndex) => {
          const cellKey = `0-${colIndex}`;
          return (
            <div
              key={`top-${colIndex}`}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(cellKey)}
              onClick={() => handleCellClick('border', { row: 0, col: colIndex })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick('border', { row: 0, col: colIndex });
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

        {/* Middle rows with left border cells, center cell, and right border cells */}
        {Array.from({ length: 5 }, (_, rowIndex) => (
          <React.Fragment key={`middle-row-${rowIndex}`}>
            {/* Left border cells - 2 columns */}
            {Array.from({ length: 2 }, (_, colIndex) => (
              <div
                key={`left-${rowIndex}-${colIndex}`}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                style={getCellStyle(`${rowIndex + 1}-${colIndex}`)}
                onClick={() => handleCellClick('border', { row: rowIndex + 1, col: colIndex })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellClick('border', { row: rowIndex + 1, col: colIndex });
                  }
                }}
              >
                {!cellImages[`${rowIndex + 1}-${colIndex}`] && (
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
                style={getCellStyle('center')}
                onClick={() => handleCellClick('center')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellClick('center');
                  }
                }}
              >
                {!cellImages['center'] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span>CENTER</span>
                  </div>
                )}
              </div>
            )}

            {/* Right border cells - 2 columns */}
            {Array.from({ length: 2 }, (_, colIndex) => (
              <div
                key={`right-${rowIndex}-${colIndex}`}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
                style={getCellStyle(`${rowIndex + 1}-${7 + colIndex}`)}
                onClick={() => handleCellClick('border', { row: rowIndex + 1, col: 7 + colIndex })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellClick('border', { row: rowIndex + 1, col: 7 + colIndex });
                  }
                }}
              >
                {!cellImages[`${rowIndex + 1}-${7 + colIndex}`] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
                    +
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}

        {/* Bottom row - 9 cells */}
        {Array.from({ length: 9 }, (_, colIndex) => {
          const cellKey = `8-${colIndex}`;
          return (
            <div
              key={`bottom-${colIndex}`}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(cellKey)}
              onClick={() => handleCellClick('border', { row: 8, col: colIndex })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick('border', { row: 8, col: colIndex });
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

         {Array.from({ length: 9 }, (_, colIndex) => {
          const cellKey = `8-${colIndex}`;
          return (
            <div
              key={`bottom-${colIndex}`}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer"
              style={getCellStyle(cellKey)}
              onClick={() => handleCellClick('border', { row: 8, col: colIndex })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCellClick('border', { row: 8, col: colIndex });
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
