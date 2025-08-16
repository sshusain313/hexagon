
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4 lg:p-8">
      <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-10">
        <Link 
          to="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg transition-colors text-sm sm:text-base"
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
      
      <div className="mb-2 sm:mb-4 lg:mb-8 text-center px-4">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Square Grid Layout</h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">Click on any cell to upload an image</p>
      </div>
      
      {/* Fixed size container that scales properly */}
      <div className="w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] xl:w-[700px] xl:h-[700px]">
        <div className="grid grid-cols-9 gap-[1px] sm:gap-[2px] p-1 sm:p-2 lg:p-4 bg-white rounded-lg sm:rounded-xl shadow-2xl w-full h-full">
          {/* Top row - 9 cells */}
          {Array.from({ length: 9 }, (_, colIndex) => {
            const cellKey = `0-${colIndex}`;
            return (
              <div
                key={`top-${colIndex}`}
                className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer min-h-0"
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
                  <div className="absolute inset-0 flex items-center justify-center text-white text-[8px] sm:text-xs lg:text-sm font-medium opacity-70">
                    +
                  </div>
                )}
              </div>
            );
          })}

          {/* Middle rows with left border, center cell, and right border */}
          {Array.from({ length: 7 }, (_, rowIndex) => (
            <React.Fragment key={`middle-row-${rowIndex}`}>
              {/* Left border cell */}
              <div
                className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer min-h-0"
                style={getCellStyle(`${rowIndex + 1}-0`)}
                onClick={() => handleCellClick('border', { row: rowIndex + 1, col: 0 })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellClick('border', { row: rowIndex + 1, col: 0 });
                  }
                }}
              >
                {!cellImages[`${rowIndex + 1}-0`] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-[8px] sm:text-xs lg:text-sm font-medium opacity-70">
                    +
                  </div>
                )}
              </div>

              {/* Center cell - only render once and span 7 columns and 7 rows */}
              {rowIndex === 0 && (
                <div
                  className="col-span-7 row-span-7 grid-cell active:animate-grid-pulse flex items-center justify-center text-white font-bold text-xs sm:text-lg lg:text-2xl relative overflow-hidden cursor-pointer min-h-0"
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

              {/* Right border cell */}
              <div
                className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer min-h-0"
                style={getCellStyle(`${rowIndex + 1}-8`)}
                onClick={() => handleCellClick('border', { row: rowIndex + 1, col: 8 })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCellClick('border', { row: rowIndex + 1, col: 8 });
                  }
                }}
              >
                {!cellImages[`${rowIndex + 1}-8`] && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-[8px] sm:text-xs lg:text-sm font-medium opacity-70">
                    +
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}

          {/* Bottom row - 9 cells */}
          {Array.from({ length: 9 }, (_, colIndex) => {
            const cellKey = `8-${colIndex}`;
            return (
              <div
                key={`bottom-${colIndex}`}
                className="grid-cell active:animate-grid-pulse relative overflow-hidden cursor-pointer min-h-0"
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
                  <div className="absolute inset-0 flex items-center justify-center text-white text-[8px] sm:text-xs lg:text-sm font-medium opacity-70">
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-2 sm:mt-4 lg:mt-8 text-center max-w-md px-4">
        <p className="text-xs sm:text-sm text-gray-500">
          Click on any cell to upload an image. Images will be automatically clipped to fit each cell perfectly.
        </p>
      </div>
    </div>
  );
};

export default SquareGrid;
