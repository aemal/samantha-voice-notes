'use client';

import React from 'react';
import { Button } from './NextUIProvider';

interface NavigationProps {
  currentScreen: 'ingestion' | 'query';
  onScreenChange: (screen: 'ingestion' | 'query') => void;
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentScreen, onScreenChange, className = '' }) => {
  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Vibe Notes</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-2">
            <Button
              onClick={() => onScreenChange('ingestion')}
              variant={currentScreen === 'ingestion' ? 'solid' : 'light'}
              color={currentScreen === 'ingestion' ? 'primary' : 'default'}
              size="md"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Contact
              </div>
            </Button>
            
            <Button
              onClick={() => onScreenChange('query')}
              variant={currentScreen === 'query' ? 'solid' : 'light'}
              color={currentScreen === 'query' ? 'primary' : 'default'}
              size="md"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Contacts
              </div>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;