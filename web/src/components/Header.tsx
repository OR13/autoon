'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from 'flowbite-react';
import { HiExternalLink, HiChevronDown } from 'react-icons/hi';

const USE_CASES = [
  { id: 'json-schema', name: 'JSON Schema', href: '/json-schema' },
  { id: 'json-instance', name: 'JSON Instance', href: '/json-instance' },
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
        <div className="logo-container w-8 h-8">
          <div className="logo-glow-ring" />
          <svg viewBox="0 0 32 32" className="w-8 h-8 logo-svg">
            <defs>
              <linearGradient id="headerHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2D3748"/>
                <stop offset="100%" stopColor="#1A202C"/>
              </linearGradient>
              <linearGradient id="headerStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D4FF"/>
                <stop offset="50%" stopColor="#7C3AED"/>
                <stop offset="100%" stopColor="#F472B6"/>
              </linearGradient>
              <radialGradient id="headerNodeGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#FFF"/>
                <stop offset="50%" stopColor="#FFD700"/>
                <stop offset="100%" stopColor="#FF8C00"/>
              </radialGradient>
            </defs>
            <polygon
              points="16,5 25,10 25,22 16,27 7,22 7,10"
              fill="url(#headerHexGrad)"
              stroke="url(#headerStrokeGrad)"
              strokeWidth="1.5"
            />
            <circle cx="16" cy="5" r="2" fill="url(#headerNodeGrad)" className="logo-node logo-node-1"/>
            <circle cx="25" cy="22" r="2" fill="url(#headerNodeGrad)" className="logo-node logo-node-2"/>
            <circle cx="7" cy="22" r="2" fill="url(#headerNodeGrad)" className="logo-node logo-node-3"/>
          </svg>
        </div>
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
