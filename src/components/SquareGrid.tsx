
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

  const handleCellClick = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    console.log(`Cell clicked: row ${row}, col ${col}`);
    
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

  const renderCell = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    
    // Check if this is part of the center area (rows 2-6, cols 2-6)
    if (row >= 2 && row <= 6 && col >= 2 && col <= 6) {
      // Only render the center cell once at position 2,2
      if (row === 2 && col === 2) {
        return (
          <div
            key={`center-${row}-${col}`}
            className="col-span-5 row-span-5 grid-cell active:animate-grid-pulse flex items-center justify-center text-white font-bold text-2xl relative overflow-hidden"
            style={getCellStyle('center')}
            onClick={() => {
              setSelectedCell('center');
              fileInputRef.current?.click();
            }}
            role="button"
            tabIndex={0}
          >
            {!cellImages['center'] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span>CENTER</span>
              </div>
            )}
          </div>
        );
      }
      // Skip other center cells
      return null;
    }

    return (
      <div
        key={`cell-${row}-${col}`}
        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 grid-cell active:animate-grid-pulse relative overflow-hidden"
        style={getCellStyle(cellKey)}
        onClick={() => handleCellClick(row, col)}
        role="button"
        tabIndex={0}
      >
        {!cellImages[cellKey] && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-70">
            +
          </div>
        )}
      </div>
    );
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
        {Array.from({ length: 9 }, (_, row) =>
          Array.from({ length: 9 }, (_, col) => renderCell(row, col))
        )}
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
