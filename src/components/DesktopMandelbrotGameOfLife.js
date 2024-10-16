import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/UIComponents';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/UIComponents';
import { Slider } from './ui/UIComponents';

const DesktopMandelbrotGameOfLife = () => {
  const canvasRef = useRef(null);
  const [isGameOfLifeActive, setIsGameOfLifeActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [colorScheme, setColorScheme] = useState('default');
  const [maxIterations, setMaxIterations] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const canvasWidth = 800;
  const canvasHeight = 600;
  const gridWidth = 2000; // Increased by 10x
  const gridHeight = 1500; // Increased by 10x

  const colorSchemes = {
    default: (value) => {
      const hue = (value * 360) | 0;
      return `hsl(${hue}, 100%, 50%)`;
    },
    grayscale: (value) => {
      const gray = (value * 255) | 0;
      return `rgb(${gray}, ${gray}, ${gray})`;
    },
    fire: (value) => {
      const r = Math.min(255, value * 1020);
      const g = Math.max(0, Math.min(255, value * 1020 - 255));
      const b = Math.max(0, Math.min(255, value * 1020 - 510));
      return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
    },
  };

  const calculateMandelbrot = useCallback((cx, cy) => {
    let zx = 0;
    let zy = 0;
    let i = 0;
    while (i < maxIterations && zx * zx + zy * zy < 4) {
      const tempX = zx * zx - zy * zy + cx;
      zy = 2 * zx * zy + cy;
      zx = tempX;
      i++;
    }
    return i / maxIterations;
  }, [maxIterations]);

  const renderMandelbrot = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const pixelWidth = canvasWidth / gridWidth;
    const pixelHeight = canvasHeight / gridHeight;

    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        const cx = (x - gridWidth / 2 + offsetX) / (gridWidth / 4) / zoom;
        const cy = (y - gridHeight / 2 + offsetY) / (gridWidth / 4) / zoom;
        const value = calculateMandelbrot(cx, cy);
        const color = colorSchemes[colorScheme](value);
        ctx.fillStyle = color;
        ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight);
      }
    }
  }, [zoom, offsetX, offsetY, colorScheme, calculateMandelbrot]);

  const applyGameOfLife = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    const newImageData = ctx.createImageData(canvasWidth, canvasHeight);
    const newData = newImageData.data;

    const pixelWidth = canvasWidth / gridWidth;
    const pixelHeight = canvasHeight / gridHeight;

    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        const pixelIndex = (Math.floor(y * pixelHeight) * canvasWidth + Math.floor(x * pixelWidth)) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];

        let aliveNeighbors = 0;

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const neighborX = (x + i + gridWidth) % gridWidth;
            const neighborY = (y + j + gridHeight) % gridHeight;
            if (!(i === 0 && j === 0)) {
              const neighborIndex = (Math.floor(neighborY * pixelHeight) * canvasWidth + Math.floor(neighborX * pixelWidth)) * 4;
              const neighborR = data[neighborIndex];
              const neighborG = data[neighborIndex + 1];
              const neighborB = data[neighborIndex + 2];
              const neighborGrayscale = (neighborR + neighborG + neighborB) / 3;
              if (neighborGrayscale < 128) {
                aliveNeighbors++;
              }
            }
          }
        }

        const grayscale = (r + g + b) / 3;
        const isAlive = grayscale < 128;

        let newR = r;
        let newG = g;
        let newB = b;

        if (isAlive) {
          if (aliveNeighbors < 2 || aliveNeighbors > 3) {
            newR = 255;
            newG = 255;
            newB = 255;
          }
        } else {
          if (aliveNeighbors === 3) {
            newR = 0;
            newG = 0;
            newB = 0;
          }
        }

        for (let px = 0; px < pixelWidth; px++) {
          for (let py = 0; py < pixelHeight; py++) {
            const index = ((y * pixelHeight + py) * canvasWidth + (x * pixelWidth + px)) * 4;
            newData[index] = newR;
            newData[index + 1] = newG;
            newData[index + 2] = newB;
            newData[index + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(newImageData, 0, 0);
  }, []);

  useEffect(() => {
    renderMandelbrot();
  }, [renderMandelbrot]);

  useEffect(() => {
    if (isGameOfLifeActive) {
      const intervalId = setInterval(() => {
        applyGameOfLife();
      }, 100);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isGameOfLifeActive, applyGameOfLife]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setOffsetX(prev => prev - dx / zoom);
      setOffsetY(prev => prev - dy / zoom);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, lastMousePos, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newZoom = zoom * zoomFactor;
    const newOffsetX = (x / canvasWidth * gridWidth - gridWidth / 2) * (1 - 1 / zoomFactor) / zoom + offsetX;
    const newOffsetY = (y / canvasHeight * gridHeight - gridHeight / 2) * (1 - 1 / zoomFactor) / zoom + offsetY;
    setZoom(newZoom);
    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
  }, [zoom, offsetX, offsetY]);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
      <div className="flex items-center space-x-4">
        <Button onClick={() => setIsGameOfLifeActive(prev => !prev)}>
          {isGameOfLifeActive ? 'Stop Game of Life' : 'Start Game of Life'}
        </Button>
        <Select value={colorScheme} onValueChange={setColorScheme}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select color scheme" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(colorSchemes).map((scheme) => (
              <SelectItem key={scheme} value={scheme}>
                {scheme}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <span>Max Iterations:</span>
        <Slider
          min={10}
          max={1000}
          step={10}
          value={[maxIterations]}
          onValueChange={([value]) => setMaxIterations(value)}
          className="w-[200px]"
        />
        <span>{maxIterations}</span>
      </div>
      <div>
        <p>Use mouse wheel to zoom, click and drag to pan</p>
      </div>
    </div>
  );
};

export default DesktopMandelbrotGameOfLife;