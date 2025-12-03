"use client";
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import Button from './button';
import RemoveIcon from './icons/RemoveIcon';
import { AnimatePresence, motion } from 'framer-motion';

interface TagsDropdownProps {
  tags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export default function TagsDropdown({ tags, selectedTags, setSelectedTags, placeholder = 'Selecione as tags', id, disabled }: TagsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{isHovered: boolean, tag: string}>({isHovered: false, tag: ""});
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
        <div className="flex items-center gap-1 flex-wrap">
          {selectedTags.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selectedTags.map(tag => (
            <motion.div
              key={tag}
              className="group flex items-center small-box bg-gray-100 relative gap-1"
              style={{ color: "var(--neutral-800)" }}
              onHoverStart={() => setHoverInfo({ isHovered: true, tag: tag })}
              onHoverEnd={() => setHoverInfo({ isHovered: false, tag: "" })}
            >
              <span className="text-b3">{tag}</span>
              <AnimatePresence mode="wait">
                {hoverInfo.isHovered && hoverInfo.tag === tag && <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                >
                  <RemoveIcon size={12} fill="var(--neutral-800)" />
                </motion.button>}
              </AnimatePresence>
            </motion.div>
          ))
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-300 rounded shadow-md max-h-32 overflow-auto">
          <div className="p-2">
            {Array.from(new Set([...selectedTags, ...tags])).map(opt => (
              <label key={opt} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="w-4 h-4"
                  aria-label={opt}
                  disabled={disabled}
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