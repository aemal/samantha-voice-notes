'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  announceMessage: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');

  useEffect(() => {
    // Check for user preferences
    if (typeof window !== 'undefined') {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(prefersReducedMotion);

      // Check for high contrast preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      setHighContrast(prefersHighContrast);

      // Load saved preferences
      const savedPrefs = localStorage.getItem('accessibility-preferences');
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          setHighContrast(prefs.highContrast ?? prefersHighContrast);
          setFontSize(prefs.fontSize ?? 'normal');
        } catch (error) {
          console.warn('Failed to load accessibility preferences:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Save preferences
    const preferences = {
      highContrast,
      fontSize,
    };
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));

    // Apply CSS custom properties
    document.documentElement.style.setProperty(
      '--font-size-multiplier', 
      fontSize === 'large' ? '1.125' : fontSize === 'extra-large' ? '1.25' : '1'
    );
    
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [highContrast, fontSize, reducedMotion]);

  const announceMessage = (message: string) => {
    // Create a live region announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const value: AccessibilityContextType = {
    highContrast,
    reducedMotion,
    fontSize,
    announceMessage,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};