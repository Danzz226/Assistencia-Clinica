import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './CustomSelect.scss';

/**
 * options: Array<{ value: string, label: string }>
 * value: string
 * onChange: (value: string) => void
 * placeholder: string
 * disabled?: boolean
 */
const CustomSelect = ({ options = [], value, onChange, placeholder = 'Selecione...', disabled = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => o.value === value) || null;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div className={`custom-select${open ? ' custom-select--open' : ''}${disabled ? ' custom-select--disabled' : ''}`} ref={ref}>
      <button
        type="button"
        className="custom-select__trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        <span className={selected ? 'custom-select__value' : 'custom-select__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} className="custom-select__arrow" />
      </button>

      {open && (
        <ul className="custom-select__dropdown" role="listbox">
          {options.map(opt => (
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
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
