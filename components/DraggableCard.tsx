
import React, { useState, useRef, useEffect } from 'react';
import { Move, ZoomIn, ZoomOut } from 'lucide-react';

interface DraggableCardProps {
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  title?: string;
  className?: string;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({ children, initialX = 20, initialY = 20, title, className = '' }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent text selection
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag if left click and not on a button/interactive element
    if (e.button !== 0) return;
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  return (
    <div 
      ref={cardRef}
      className={`fixed z-[3000] rounded-xl shadow-2xl border border-slate-200 bg-white/90 backdrop-blur-md overflow-hidden flex flex-col pointer-events-auto transition-shadow duration-200 ${isDragging ? 'shadow-inner cursor-grabbing' : ''} ${className}`}
      style={{ 
        left: position.x, 
        top: position.y,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: 'fit-content',
        maxWidth: '90vw',
        maxHeight: '90vh'
      }}
    >
      <div 
        className={`h-9 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between px-3 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2 text-slate-600">
          <Move className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center space-x-1" onMouseDown={e => e.stopPropagation()}>
          <button 
            onClick={handleZoomOut} 
            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono w-8 text-center text-slate-500">{Math.round(scale * 100)}%</span>
          <button 
            onClick={handleZoomIn} 
            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-0 overflow-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
};
