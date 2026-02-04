
import React, { useState, ReactNode, Children } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileDataViewerProps {
  children: ReactNode;
}

export const MobileDataViewer: React.FC<MobileDataViewerProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const childrenArray = Children.toArray(children).filter(child => child); // Filter out nulls
  const total = childrenArray.length;

  if (total === 0) return null;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <div className="w-full">
      {/* Desktop View: Stacked */}
      <div className="hidden lg:block space-y-6">
        {children}
      </div>

      {/* Mobile View: Button-controlled Carousel */}
      <div className="lg:hidden">
        
        {/* Navigation Controls (Moved to Top) */}
        <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-4">
          <button
            onClick={prev}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <div className="flex space-x-2 mb-1">
              {childrenArray.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'bg-indigo-600 w-4' : 'bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <div className="text-[10px] text-slate-400">
               {currentIndex + 1} / {total}
            </div>
          </div>

          <button
            onClick={next}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors active:scale-95"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px] mb-4 transition-all duration-300">
          {childrenArray[currentIndex]}
        </div>

      </div>
    </div>
  );
};
