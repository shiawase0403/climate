import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Loader2 } from 'lucide-react';
import { marked } from 'marked';
import { useLanguage } from '../contexts/LanguageContext';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/tutorial.md')
        .then(res => {
          if (!res.ok) throw new Error("Failed to load tutorial");
          return res.text();
        })
        .then(text => {
          setContent(marked.parse(text) as string);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setContent('<p>Failed to load tutorial content.</p>');
          setLoading(false);
        });
        
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur">
          <div className="flex items-center space-x-2 text-indigo-700">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-xl font-bold">{t.tutorialTitle}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
            aria-label={t.closeTutorial}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
              <p className="text-slate-500">{t.loading}</p>
            </div>
          ) : (
            <div 
              className="prose prose-slate prose-headings:font-bold prose-h1:text-indigo-900 prose-a:text-indigo-600 max-w-none"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
           >
             {t.closeTutorial}
           </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
