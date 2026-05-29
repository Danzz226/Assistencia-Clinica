import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import './CustomSelect.scss';

/**
 * options: Array<{ value: string, label: string }>
 * value: string
 * onChange: (value: string) => void
 * placeholder: string
 * disabled?: boolean
 * searchable?: boolean  — ativa busca dentro do dropdown (padrão: true quando options.length > 5)
 */
const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
  searchable,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);

  // Ativa busca automaticamente para listas grandes, mas permite forçar via prop
  const isSearchable = searchable !== undefined ? searchable : options.length > 5;

  const selected = options.find(o => o.value === value) || null;

  const filtered = isSearchable && query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Foca o campo de busca ao abrir
  useEffect(() => {
    if (open && isSearchable && searchRef.current) {
      searchRef.current.focus();
    }
    if (!open) setQuery('');
  }, [open, isSearchable]);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  };

  const handleToggle = () => {
    if (!disabled) setOpen(o => !o);
  };

  return (
    <div
      className={`custom-select${open ? ' custom-select--open' : ''}${disabled ? ' custom-select--disabled' : ''}`}
      ref={ref}
    >
      <button
        type="button"
        className="custom-select__trigger"
        onClick={handleToggle}
        disabled={disabled}
      >
        <span className={selected ? 'custom-select__value' : 'custom-select__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} className="custom-select__arrow" />
      </button>

      {open && (
        <div className="custom-select__dropdown">
          {isSearchable && (
            <div className="custom-select__search">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                onMouseDown={(e) => e.stopPropagation()}
              />
              <Search size={13} className="custom-select__search-icon" />
            </div>
          )}

          <ul role="listbox">
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <li
                  key={opt.value}
                  className={`custom-select__option${opt.value === value ? ' custom-select__option--selected' : ''}`}
                  role="option"
                  aria-selected={opt.value === value}
                  onMouseDown={() => handleSelect(opt)}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <Check size={13} />}
                </li>
              ))
            ) : (
              <li className="custom-select__empty">Nenhum resultado</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
