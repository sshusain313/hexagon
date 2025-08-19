
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface CellImage {
  [key: string]: string;
}

interface AxialCoord {
  q: number;
  r: number;
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

  // Generate hexagonal coordinates for the ring pattern (hollow center)
  const generateHexCoordinates = (): AxialCoord[] => {
    const coords: AxialCoord[] = [];
    const radius = 4;
    
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      
      for (let r = r1; r <= r2; r++) {
        const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
        
        // Only include cells at distance 3 or 4 to create the ring pattern
        if (distance >= 3 && distance <= 4) {
          coords.push({ q, r });
        }
      }
    }
    
    return coords;
  };

  // Group coordinates by row (r coordinate) and sort by column (q coordinate)
  const groupByRows = (coords: AxialCoord[]) => {
    const rows: { [key: number]: AxialCoord[] } = {};
    
    coords.forEach(coord => {
      if (!rows[coord.r]) {
        rows[coord.r] = [];
      }
      rows[coord.r].push(coord);
    });
    
    // Sort each row by q coordinate
    Object.keys(rows).forEach(r => {
      rows[parseInt(r)].sort((a, b) => a.q - b.q);
    });
    
    return rows;
  };

  const hexCoords = generateHexCoordinates();
  const rowGroups = groupByRows(hexCoords);
  const sortedRows = Object.keys(rowGroups).map(Number).sort((a, b) => a - b);

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
      
      <div className="hex-honeycomb-container">
        {sortedRows.map((r) => {
          const isEvenRow = r % 2 === 0;
          const rowCells = rowGroups[r];
          
          return (
            <div 
              key={r} 
              className="hex-honeycomb-row"
              style={{
                marginLeft: isEvenRow ? '0px' : '35px', // Offset for odd rows
              }}
            >
              {rowCells.map((coord) => {
                const cellKey = `${coord.q}-${coord.r}`;
                
                return (
                  <div
                    key={cellKey}
                    className="hex-honeycomb-cell-rotated"
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
                      <div className="hex-cell-content">
                        <span className="text-white text-xs sm:text-sm font-medium opacity-70">+</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      
      <div className="mt-2 sm:mt-4 lg:mt-8 text-center max-w-md px-4">
        <p className="text-xs sm:text-sm text-gray-500">
          Click on any cell to upload an image. The center is completely hollow as shown in the reference.
        </p>
      </div>
    </div>
  );
};

export default HexGrid;
