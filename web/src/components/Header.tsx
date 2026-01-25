'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from 'flowbite-react';
import { HiExternalLink, HiChevronDown } from 'react-icons/hi';

const USE_CASES = [
  { id: 'json-schema', name: 'JSON Schema', href: '/json-schema' },
  { id: 'json-instance', name: 'JSON Instance', href: '/json-instance' },
  { id: 'json-graph', name: 'JSON Graph', href: '/json-graph' },
  { id: 'generative-ui', name: 'Generative UI', href: '/generative-ui' },
  { id: 'nodal-ui', name: 'Nodal UI', href: '/nodal-ui' },
];

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="autoon-header flex items-center justify-between" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
      <Link href="/" className="flex items-center gap-3">
        <img src="/autoon-logo.svg" alt="Autoon" className="w-8 h-8" style={{ borderRadius: '4px' }} />
        <span className="text-xl font-semibold" style={{ color: 'var(--color-brand-primary)' }}>
          Autoon
        </span>
        <Badge color="warning">v0.2</Badge>
      </Link>

      <div className="flex items-center gap-4">
        {/* Use Cases Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span>Use Cases</span>
            <HiChevronDown
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute top-full right-0 mt-2 rounded-lg shadow-xl z-50 overflow-hidden"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-muted)',
                minWidth: '200px'
              }}
            >
              {USE_CASES.map((useCase) => (
                <Link
                  key={useCase.id}
                  href={useCase.href}
                  onClick={() => setIsDropdownOpen(false)}
                  className="block text-sm transition-colors"
                  style={{
                    padding: '12px 16px',
                    color: 'var(--color-text-secondary)',
                    borderBottom: '1px solid var(--color-border-muted)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  {useCase.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <a
          href="https://github.com/or13/autoon"
          target="_blank"
          rel="noopener noreferrer"
          className="autoon-btn"
        >
          <HiExternalLink className="w-4 h-4 mr-2" />
          GitHub
        </a>
      </div>
    </nav>
  );
}
