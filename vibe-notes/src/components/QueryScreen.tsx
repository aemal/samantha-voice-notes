'use client';

import React, { useState, useEffect } from 'react';
import VoiceInput from './VoiceInput';

interface ContactResult {
  id: string;
  linkedinUrl: string;
  notes: string;
  timestamp: number;
  score?: number; // For search relevance scoring
}

interface QueryScreenProps {
  className?: string;
}

const QueryScreen: React.FC<QueryScreenProps> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContactResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Search functionality
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      // Get stored contacts from localStorage
      const storedContacts = JSON.parse(localStorage.getItem('completed-ingestions') || '[]') as ContactResult[];
      
      // Simple text-based search through notes and LinkedIn URLs
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
      
      const searchResults = storedContacts
        .map(contact => {
          let score = 0;
          const noteWords = contact.notes.toLowerCase();
          const urlWords = contact.linkedinUrl.toLowerCase();
          
          // Calculate relevance score
          searchTerms.forEach(term => {
            // Exact phrase match gets highest score
            if (noteWords.includes(searchQuery.toLowerCase())) {
              score += 10;
            }
            // Individual term matches in notes
            if (noteWords.includes(term)) {
              score += 5;
            }
            // Term matches in LinkedIn URL
            if (urlWords.includes(term)) {
              score += 3;
            }
            // Partial matches
            const noteMatches = (noteWords.match(new RegExp(term, 'g')) || []).length;
            score += noteMatches;
          });
          
          return { ...contact, score };
        })
        .filter(contact => contact.score > 0)
        .sort((a, b) => (b.score || 0) - (a.score || 0));

      // Simulate API delay for realistic feel
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle text input search
  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // Handle voice input
  const handleVoiceQuery = (transcript: string) => {
    setQuery(transcript);
  };

  // Handle voice input final transcript
  const handleVoiceFinalQuery = (finalTranscript: string) => {
    const newQuery = finalTranscript.trim();
    setQuery(newQuery);
    if (newQuery) {
      performSearch(newQuery);
    }
  };

  // Handle LinkedIn profile opening
  const handleOpenLinkedIn = (url: string) => {
    // Try to open in LinkedIn app first, fallback to web
    const linkedInAppUrl = url.replace('https://linkedin.com', 'linkedin://');
    
    // Create a temporary link to try app opening
    const appLink = document.createElement('a');
    appLink.href = linkedInAppUrl;
    appLink.target = '_blank';
    
    // Try to open in app
    const startTime = Date.now();
    appLink.click();
    
    // If app doesn't open after 2 seconds, open in web browser
    setTimeout(() => {
      if (Date.now() - startTime > 2000) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }, 2000);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Extract name from LinkedIn URL
  const extractNameFromUrl = (url: string) => {
    const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
    if (match) {
      return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'LinkedIn Profile';
  };

  // Truncate notes for preview
  const truncateNotes = (notes: string, maxLength: number = 150) => {
    if (notes.length <= maxLength) return notes;
    return notes.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={`query-screen max-w-4xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Contacts</h1>
        <p className="text-gray-600">
          Find contacts using natural language queries. Search through your saved notes and LinkedIn profiles.
        </p>
      </div>

      {/* Search Input Section */}
      <div className="mb-8 space-y-6">
        {/* Voice Input */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Voice Search</h3>
          <VoiceInput
            onTranscriptChange={handleVoiceQuery}
            onFinalTranscript={handleVoiceFinalQuery}
            placeholder="Click to search using your voice"
            className="w-full"
            disabled={isSearching}
          />
        </div>

        {/* Text Input */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Text Search</h3>
          <form onSubmit={handleTextSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for contacts, companies, roles, or any notes..."
              className="
                flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                hover:border-gray-400 transition-colors
              "
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="
                px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                text-white font-medium rounded-lg transition-colors focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed
                sm:w-auto w-full
              "
            >
              {isSearching ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                'Search'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Search Error */}
      {searchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-red-800">{searchError}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div>
        {/* Results Header */}
        {hasSearched && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isSearching ? 'Searching...' : `Search Results (${results.length})`}
            </h2>
            {query && !isSearching && (
              <p className="text-sm text-gray-600 mt-1">
                Results for: <span className="font-medium">"{query}"</span>
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Searching through your contacts...</span>
          </div>
        )}

        {/* Results List */}
        {!isSearching && hasSearched && results.length > 0 && (
          <div className="space-y-4">
            {results.map((contact) => (
              <div
                key={contact.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                {/* Contact Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {extractNameFromUrl(contact.linkedinUrl)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Added {formatTimestamp(contact.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenLinkedIn(contact.linkedinUrl)}
                    className="
                      ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm 
                      font-medium rounded-lg transition-colors focus:outline-none 
                      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    "
                    title="Open LinkedIn Profile"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      Open Profile
                    </div>
                  </button>
                </div>

                {/* Notes Preview */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notes:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {truncateNotes(contact.notes)}
                  </p>
                </div>

                {/* LinkedIn URL */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">LinkedIn Profile:</h4>
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {contact.linkedinUrl}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results State */}
        {!isSearching && hasSearched && results.length === 0 && query && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any contacts matching "<span className="font-medium">{query}</span>".
            </p>
            <p className="text-sm text-gray-500">
              Try using different keywords or check if you have any saved contacts.
            </p>
          </div>
        )}

        {/* Empty State (No Search Yet) */}
        {!hasSearched && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search Your Contacts</h3>
            <p className="text-gray-600 mb-4">
              Use voice or text search to find specific contacts from your saved notes.
            </p>
            <p className="text-sm text-gray-500">
              Try searching for names, companies, roles, or any keywords from your notes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryScreen;