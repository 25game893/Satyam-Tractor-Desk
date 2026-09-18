import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  required?: boolean;
  searchable?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, label, required, searchable = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && (
        <label className="hw-label">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-3.5 bg-transparent border border-hw-border rounded-2xl font-bold text-xs flex justify-between items-center cursor-pointer hover:bg-hw-accent/[0.02] transition-all ${isOpen ? 'ring-4 ring-hw-accent/5 border-hw-accent' : ''}`}
      >
        <span className={selectedOption ? 'text-hw-text' : 'text-hw-muted'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-hw-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[1100] top-full left-0 w-full mt-2 bg-hw-surface/30 backdrop-blur-2xl border border-hw-border/30 rounded-2xl shadow-2xl shadow-hw-accent/5 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {searchable && (
            <div className="p-3 border-b border-hw-border/20 bg-transparent flex items-center gap-2">
              <Search size={14} className="text-hw-muted" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search..." 
                className="flex-1 bg-transparent outline-none text-xs font-bold text-hw-text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }} className="text-hw-muted hover:text-hw-accent">
                  <X size={14} />
                </button>
              )}
            </div>
          )}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-5 py-3 hover:bg-hw-accent/10 cursor-pointer transition-colors border-b border-hw-border/10 last:border-0 ${value === opt.id ? 'bg-hw-accent/20' : ''}`}
                >
                  <p className={`text-xs font-black ${value === opt.id ? 'text-hw-accent' : 'text-hw-text'}`}>{opt.label}</p>
                  {opt.sublabel && <p className="text-[9px] font-bold text-hw-muted uppercase tracking-widest">{opt.sublabel}</p>}
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-hw-muted">
                <p className="text-[10px] font-black uppercase tracking-widest">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Hidden input for form validation if required */}
      {required && (
        <input 
          type="text" 
          value={value} 
          readOnly 
          required 
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" 
        />
      )}
    </div>
  );
};

export default SearchableSelect;
