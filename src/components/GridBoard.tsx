
import React, { useRef, useState, Suspense, lazy } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { GridProvider } from './square/context/GridContext';

interface CellImage {
  [key: string]: string;
}

const GridBoard = () => {
  const [cellImages, setCellImages] = useState<CellImage>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [numberInput, setNumberInput] = useState<string>("");
  const [PreviewComp, setPreviewComp] = useState<React.LazyExoticComponent<React.ComponentType> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Map of all TSX components in this folder
  // We will look for files like "33.tsx", "37.tsx", or any "n.tsx"
  const componentModules = import.meta.glob('./square/*.tsx');

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

  const loadComponentByNumber = async (n: number) => {
    setLoadError(null);
    setPreviewComp(null);

    const path = `./square/${n}.tsx` as const;
    // Only allow files with numeric names like 33.tsx, 37.tsx, etc.
    if (!/^[0-9]+\.tsx$/.test(`${n}.tsx`)) {
      setLoadError('Please enter a valid number.');
      return;
    }

    if (componentModules[path]) {
      // Wrap the dynamic import in React.lazy
      const loader = componentModules[path] as () => Promise<{ default: React.ComponentType<any> }>;
      const LazyComp = lazy(loader);
      setPreviewComp(() => LazyComp);
    } else {
      setLoadError(`Component ${n}.tsx not found in src/components/square.`);
    }
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(numberInput);
    if (Number.isNaN(n)) {
      setLoadError('Enter a valid number.');
      return;
    }
    loadComponentByNumber(n);
  };

  return (
    <div className="min-h-screen max-w-8xl mx-auto bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 md:p-6">
      <div className="grid gap-4 lg:grid lg:grid-cols-2">
      {/* Preview Controller */}
      <Card className="w-full lg:max-w-2xl lg:h-[75vh]">
        <CardHeader>
          <CardTitle className="text-lg">Component Preview Loader</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePreviewSubmit} className="grid grid-cols-1 sm:grid-cols-[220px_1fr_auto] items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="preview-number">Component number</Label>
              <Input
                id="preview-number"
                type="number"
                inputMode="numeric"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                placeholder="e.g. 33 or 37"
              />
            </div>
            <div className="text-xs text-slate-500 sm:self-center">
              Enter a number to load a file named <code className="px-1 py-0.5 rounded bg-slate-100">{`{n}`}.tsx</code> from <code className="px-1 py-0.5 rounded bg-slate-100">src/components</code>.
            </div>
            <Button type="submit" className="sm:justify-self-end">Load</Button>
          </form>

          <Separator className="my-4" />

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => loadComponentByNumber(33)}>
              Load 33.tsx
            </Button>
            <Button variant="outline" size="sm" onClick={() => loadComponentByNumber(37)}>
              Load 37.tsx
            </Button>
          </div>

          {loadError && (
            <p className="mt-3 text-sm text-red-600" role="alert">{loadError}</p>
          )}
        </CardContent>
      </Card>

      {/* Preview Area */}
      <div className="mt-4 lg:mt-0">
        {PreviewComp ? (
          <Card className="-ml-4 sm:ml-0">
            <CardContent className="p-0">
              {/* Preview actions */}
              <div className="flex justify-end p-2">
                <Button size="sm" onClick={() => window.dispatchEvent(new Event('grid-template-download'))}>
                  Download
                </Button>
              </div>
              <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading preview...</div>}>
                <GridProvider>
                  <PreviewComp />
                </GridProvider>
              </Suspense>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500 text-center">
              Enter a number to preview a component (e.g. 33 or 37) from src/components/square.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grid UI area (existing feature) */}
      <div className="flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
      </div>
    </div>
  );
};

export default GridBoard;
