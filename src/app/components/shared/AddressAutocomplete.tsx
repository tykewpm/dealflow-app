import { useState, useEffect, useRef } from 'react';
import { searchAddresses, AddressSuggestion } from '../../data/mockAddresses';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  required?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Start typing address…',
  autoFocus = false,
  required = false,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for addresses as user types
  useEffect(() => {
    if (value.length >= 2 && !selectedAddress) {
      const results = searchAddresses(value);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    } else if (value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value, selectedAddress]);

  const handleInputChange = (newValue: string) => {
    setSelectedAddress(null);
    onChange(newValue);
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setSelectedAddress(suggestion);
    onChange(suggestion.fullAddress);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleManualEntry = () => {
    setShowManualEntry(true);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        {/* Location Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          required={required}
          className="w-full h-12 pl-12 pr-4 border border-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-transparent text-text-primary placeholder:text-text-muted"
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => {
              setSelectedAddress(null);
              onChange('');
              setSuggestions([]);
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && !showManualEntry && (
        <div className="absolute z-50 w-full mt-2 bg-bg-surface border border-border-subtle rounded-xl shadow-lg overflow-hidden">
          {/* Suggestions List */}
          <ul className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                    index === highlightedIndex
                      ? 'bg-accent-blue-soft'
                      : 'hover:bg-bg-app'
                  }`}
                >
                  {/* Location Icon */}
                  <div className={`flex-shrink-0 mt-0.5 ${
                    index === highlightedIndex ? 'text-accent-blue' : 'text-text-muted'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  {/* Address Text */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">
                      {suggestion.street}
                    </div>
                    <div className="text-sm text-text-secondary truncate">
                      {suggestion.city}, {suggestion.state} {suggestion.zipCode}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Manual Entry Link */}
          <div className="border-t border-border-subtle px-4 py-3 bg-bg-app">
            <button
              type="button"
              onClick={handleManualEntry}
              className="text-sm text-accent-blue hover:text-accent-blue font-medium"
            >
              Can't find address? Enter manually
            </button>
          </div>
        </div>
      )}

      {/* Selected Address Confirmation */}
      {selectedAddress && (
        <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
          <svg className="w-4 h-4 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
          </span>
        </div>
      )}
    </div>
  );
}
