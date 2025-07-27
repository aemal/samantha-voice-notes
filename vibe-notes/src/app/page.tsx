'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import IngestionScreen from '@/components/IngestionScreen';
import QueryScreen from '@/components/QueryScreen';
import PWAInstaller from '@/components/PWAInstaller';
import OfflineManager from '@/components/OfflineManager';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'ingestion' | 'query'>('ingestion');

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineManager />
      <Navigation 
        currentScreen={currentScreen} 
        onScreenChange={setCurrentScreen}
      />
      
      <main className="py-8">
        {currentScreen === 'ingestion' ? (
          <IngestionScreen />
        ) : (
          <QueryScreen />
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600">
            Vibe Notes - Voice-powered contact management for LinkedIn networking
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Built with Next.js 15, TypeScript, and Web Speech API
          </p>
        </div>
      </footer>
      
      <PWAInstaller />
    </div>
  );
}
