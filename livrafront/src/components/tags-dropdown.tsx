"use client";
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface TagsDropdownProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
}

const OPTIONS = [
  'Romance',
  'Aventura',
  'Fantasia',
  'Drama',
  'Terror',
  'Suspense',
  'Comédia',
  'Distopia',
];

export default function TagsDropdown({ selectedTags, setSelectedTags, placeholder = 'Selecione as tags', id }: TagsDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggle = (option: string) => {
    if (selectedTags.includes(option)) {
      setSelectedTags(selectedTags.filter(t => t !== option));
    } else {
      setSelectedTags([...selectedTags, option]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div
        id={id}
        role="button"
        tabIndex={0}
        aria-label={id ? undefined : 'Tags da comunidade'}
        aria-haspopup="listbox"
        aria-expanded="false"
        aria-labelledby={id ? `${id}-label` : undefined}
        onClick={() => setOpen(v => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(v => !v);
          }
        }}
        className={cn(
          'w-full medium-box text-b2 text-left transition-all duration-200 placeholder:text-gray-400',
          'border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-900 focus:border-green-900 hover:border-gray-400'
        )}
      >
        <div className="flex items-center gap-2 flex-wrap py-2">
          {selectedTags.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selectedTags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded bg-gray-100 text-b3">{tag}</span>
            ))
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded shadow-md max-h-56 overflow-auto">
          <div className="p-2">
            {Array.from(new Set([...selectedTags, ...OPTIONS])).map(opt => (
              <label key={opt} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="w-4 h-4"
                  aria-label={opt}
                />
                <span className="text-b2">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
