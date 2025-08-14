
import React from 'react';

const GridBoard = () => {
  // Define the grid structure based on the uploaded image
  const gridStructure = [
    // Top row (8 cells)
    [1, 1, 1, 1, 1, 1, 1, 1],
    // Main body rows (8 rows with side columns and center space)
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    // Bottom row (8 cells)
    [1, 1, 1, 1, 1, 1, 1, 1],
    // Bottom extension (3 cells centered)
    [0, 0, 0, 1, 1, 1, 0, 0]
  ];

  const handleCellClick = (row: number, col: number) => {
    console.log(`Cell clicked: row ${row}, col ${col}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Interactive Grid</h1>
        <p className="text-gray-600">Click on any cell to interact with the grid</p>
      </div>
      
      <div className="grid gap-1 p-6 bg-white rounded-xl shadow-2xl">
        {gridStructure.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20
                  ${cell === 1 
                    ? 'grid-cell active:animate-grid-pulse' 
                    : 'invisible'
                  }
                `}
                onClick={() => cell === 1 && handleCellClick(rowIndex, colIndex)}
                role={cell === 1 ? "button" : undefined}
                tabIndex={cell === 1 ? 0 : -1}
                onKeyDown={(e) => {
                  if (cell === 1 && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleCellClick(rowIndex, colIndex);
                  }
                }}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center max-w-md">
        <p className="text-sm text-gray-500">
          This grid replicates the structure from your uploaded image with interactive cells.
          Each turquoise cell responds to hover and click interactions.
        </p>
      </div>
    </div>
  );
};

export default GridBoard;
