
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

interface CellImage {
  [key: string]: string;
}

const GridBoard = () => {
  const [cellImages, setCellImages] = useState<CellImage>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cellOffsets, setCellOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const dragRef = useRef<{ key: string | null; startX: number; startY: number; startOffsetX: number; startOffsetY: number; elW: number; elH: number; moved: boolean } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingOffsetRef = useRef<{ key: string; x: number; y: number } | null>(null);

  const COMP_ID = 'grid-45';
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
      const off = cellOffsets[cellKey] ?? { x: 50, y: 50 };
      return {
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: `${off.x}% ${off.y}%`,
        backgroundRepeat: 'no-repeat'
      } as React.CSSProperties;
    }
    return {};
  };

  const startDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, key: string) => {
    if (!cellImages[key]) return;
    const isTouch = 'touches' in e;
    const point = isTouch ? e.touches[0] : (e as React.MouseEvent);
    const target = e.currentTarget as HTMLDivElement;
    const rect = target.getBoundingClientRect();
    const current = cellOffsets[key] ?? { x: 50, y: 50 };
    dragRef.current = {
      key,
      startX: point.pageX,
      startY: point.pageY,
      startOffsetX: current.x,
      startOffsetY: current.y,
      elW: rect.width,
      elH: rect.height,
      moved: false,
    };

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const p = (ev as TouchEvent).touches ? (ev as TouchEvent).touches[0] : (ev as MouseEvent);
      const dx = (p.pageX - dragRef.current.startX) / dragRef.current.elW * 100;
      const dy = (p.pageY - dragRef.current.startY) / dragRef.current.elH * 100;
      let nx = dragRef.current.startOffsetX + dx;
      let ny = dragRef.current.startOffsetY + dy;
      nx = Math.max(0, Math.min(100, nx));
      ny = Math.max(0, Math.min(100, ny));
      dragRef.current.moved = true;
      if ((ev as any).cancelable) (ev as any).preventDefault();
      const k = dragRef.current.key as string;
      pendingOffsetRef.current = { key: k, x: nx, y: ny };
      if (rafIdRef.current == null) {
        rafIdRef.current = requestAnimationFrame(() => {
          const pending = pendingOffsetRef.current;
          if (pending) {
            setCellOffsets(prev => ({ ...prev, [pending.key]: { x: pending.x, y: pending.y } }));
          }
          rafIdRef.current = null;
        });
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove as any);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove as any);
      window.removeEventListener('touchend', onUp);
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      setTimeout(() => {
        if (dragRef.current) dragRef.current = { ...dragRef.current, key: null } as any;
      }, 0);
    };

    window.addEventListener('mousemove', onMove as any, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove as any, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const handleCellActivate = (key: string) => {
    if (dragRef.current?.moved) {
      dragRef.current.moved = false;
      return;
    }
    handleCellClick(key);
  };

  // Canvas helpers
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

  // 8 columns; visual rows: topExt, top, mid x8, bottom, bottomExt => 12 rows
  const renderGridToCanvas = async () => {
    const cols = 8;
    const rows = 12;
    const base = 100; // each cell 100x100 px
    const width = cols * base;
    const height = rows * base;
    const desiredGapPx = 3; // keep this many device pixels between adjacent cells in the final image
    const scale = Math.min(4, Math.max(2, (window.devicePixelRatio || 1))); // bounded DPR for sharper export
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    // render in logical units; scale the context
    ctx.scale(scale, scale);
    ctx.imageSmoothingEnabled = true;
    try { (ctx as any).imageSmoothingQuality = 'high'; } catch {}

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const drawKey = async (key: string, r: number, c: number, rs = 1, cs = 1) => {
      const src = cellImages[key];
      if (!src) return;
      const img = await loadImage(src);
      // keep gap constant in output pixels by dividing by scale in logical space
      const gap = desiredGapPx / scale;
      const leftGap = c === 0 ? 0 : gap / 2;
      const rightGap = (c + cs) === cols ? 0 : gap / 2;
      const topGap = r === 0 ? 0 : gap / 2;
      const bottomGap = (r + rs) === rows ? 0 : gap / 2;
      const dx = Math.round(c * base + leftGap);
      const dy = Math.round(r * base + topGap);
      const dw = Math.round(cs * base - (leftGap + rightGap));
      const dh = Math.round(rs * base - (topGap + bottomGap));
      drawImageCover(ctx, img, dx, dy, dw, dh);
    };

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

    // Row 11: bottom extension (6 cells) centered at cols 1..6, keys are string "-1-<colIdx>"
    await Promise.all(
      Array.from({ length: 6 }, (_, i) => drawKey(`-1-${i + 2}`, 11, 1 + i))
    );

    return canvas;
  };

  const handleDownload = async () => {
    if (!Object.keys(cellImages).length) {
      toast.error('Please upload at least one image before downloading.');
      return;
    }
    try {
      setIsDownloading(true);
      const canvas = await renderGridToCanvas();
      const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to encode PNG');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template-45.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Template downloaded!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate the template.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Interactive Grid</h1>
        <p className="text-gray-600">Click on any cell to upload an image</p>
      </div>
      
      <div className="grid grid-cols-8 gap-1 p-6 bg-white rounded-xl shadow-2xl">
        
        {/* Top extension - 6 cells centered (non-intrusive full-row) */}
        <div className="col-span-8 flex justify-center gap-1">
          {Array.from({ length: 6 }, (_, colIndex) => {
            // const cellKey = `-1-${colIndex + 2}`;
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
                onClick={() => handleCellActivate(cid('center', 0,0))}
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
              onClick={() => handleCellActivate(cid('midR', rowIndex+1, 7))}
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
            const key = `-1-${colIndex + 2}`;
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
