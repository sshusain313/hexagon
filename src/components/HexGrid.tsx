
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface CellImage {
  [key: string]: string;
}

const HexGrid = () => {
  const [cellImages, setCellImages] = useState<CellImage>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

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

  // Grid structure with center cell
  const gridRows = [
    { cols: 4, offset: 4, type: 'hex' },      // Row 1: 4 hexagons
    { cols: 5, offset: 3.5, type: 'hex' },    // Row 2: 5 hexagons
    { cols: 6, offset: 3, type: 'hex' },      // Row 3: 6 hexagons
    { cols: 1, offset: 6, type: 'center' },   // Row 4: Center star cell
    { cols: 6, offset: 3, type: 'hex' },      // Row 5: 6 hexagons
    { cols: 5, offset: 3.5, type: 'hex' },    // Row 6: 5 hexagons
    { cols: 4, offset: 4, type: 'hex' },      // Row 7: 4 hexagons
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4 lg:p-8">
      <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-10">
        <Link 
          to="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg shadow-lg transition-colors text-sm sm:text-base"
        >
          ← Back to Grid
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
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Hexagonal Grid</h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">Click on any cell to upload an image</p>
      </div>
      
      <div className="hex-grid-container">
        {gridRows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="hex-row" 
            style={{ 
              marginLeft: `${row.offset * 20}px`,
              marginBottom: row.type === 'center' ? '-35px' : '-25px'
            }}
          >
            {Array.from({ length: row.cols }, (_, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const isCenterCell = row.type === 'center';
              
              return (
                <div
                  key={cellKey}
                  className={isCenterCell ? 'center-cell' : 'hex-cell'}
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
                    <div className="hex-content">
                      <span className="text-white text-xs sm:text-sm font-medium opacity-70">+</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-2 sm:mt-4 lg:mt-8 text-center max-w-md px-4">
        <p className="text-xs sm:text-sm text-gray-500">
          Click on any cell to upload an image. Images will be automatically clipped to fit each cell perfectly.
        </p>
      </div>
    </div>
  );
};

export default HexGrid;
