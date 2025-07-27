'use client';

import React, { useState, useEffect } from 'react';
import { indexedDBManager, ConnectionManager, type PendingIngestion } from '@/utils/indexedDB';

const OfflineManager: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showOfflineNotes, setShowOfflineNotes] = useState(false);
  const [pendingIngestions, setPendingIngestions] = useState<PendingIngestion[]>([]);

  useEffect(() => {
    const connectionManager = ConnectionManager.getInstance();
    
    // Set initial online status
    setIsOnline(connectionManager.getConnectionStatus());
    
    // Listen for connection changes
    const handleConnectionChange = (online: boolean) => {
      setIsOnline(online);
    };
    
    connectionManager.addConnectionListener(handleConnectionChange);
    
    // Load pending ingestions count
    loadPendingCount();
    
    // Set up periodic check for pending items
    const interval = setInterval(loadPendingCount, 10000); // Check every 10 seconds
    
    return () => {
      connectionManager.removeConnectionListener(handleConnectionChange);
      clearInterval(interval);
    };
  }, []);

  const loadPendingCount = async () => {
    try {
      const pending = await indexedDBManager.getPendingIngestions();
      setPendingCount(pending.length);
      setPendingIngestions(pending);
    } catch (error) {
      console.error('Failed to load pending count:', error);
    }
  };

  const handleRetrySync = async () => {
    if (!isOnline) return;
    
    setIsRetrying(true);
    try {
      const connectionManager = ConnectionManager.getInstance();
      await connectionManager.retryFailedSync();
      await loadPendingCount();
    } catch (error) {
      console.error('Retry sync failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleClearOfflineData = async () => {
    if (confirm('Are you sure you want to clear all offline data? This action cannot be undone.')) {
      try {
        await indexedDBManager.clearAllData();
        await loadPendingCount();
      } catch (error) {
        console.error('Failed to clear offline data:', error);
      }
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'syncing': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Don't render if online and no pending items
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <>
      {/* Connection Status Bar */}
      <div className={`
        fixed top-0 left-0 right-0 z-40 p-3 text-sm font-medium text-center transition-all duration-300
        ${isOnline 
          ? pendingCount > 0 
            ? 'bg-yellow-100 text-yellow-800 border-b border-yellow-200' 
            : 'bg-green-100 text-green-800 border-b border-green-200'
          : 'bg-red-100 text-red-800 border-b border-red-200'
        }
      `}>
        <div className="flex items-center justify-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center">
            <div className={`
              w-2 h-2 rounded-full mr-2
              ${isOnline ? 'bg-green-500' : 'bg-red-500'}
            `} />
            {isOnline ? 'Online' : 'Offline'}
          </div>

          {/* Pending Items */}
          {pendingCount > 0 && (
            <>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {pendingCount} pending
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowOfflineNotes(!showOfflineNotes)}
                  className="text-xs underline hover:no-underline"
                >
                  {showOfflineNotes ? 'Hide' : 'View'}
                </button>

                {isOnline && (
                  <button
                    onClick={handleRetrySync}
                    disabled={isRetrying}
                    className="text-xs underline hover:no-underline disabled:opacity-50"
                  >
                    {isRetrying ? 'Syncing...' : 'Retry Sync'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Spacer to push content down */}
      <div className="h-12" />

      {/* Offline Notes Modal */}
      {showOfflineNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Notes ({pendingCount})
              </h3>
              <button
                onClick={() => setShowOfflineNotes(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Pending Items List */}
            <div className="overflow-y-auto max-h-64 space-y-3">
              {pendingIngestions.map((ingestion) => (
                <div
                  key={ingestion.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {new URL(ingestion.linkedinUrl).pathname.split('/').pop()?.replace(/-/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(ingestion.timestamp)}
                      </div>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full border
                      ${getStatusColor(ingestion.status)}
                    `}>
                      {ingestion.status}
                      {ingestion.retryCount > 0 && ` (${ingestion.retryCount} retries)`}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {ingestion.notes.substring(0, 100)}
                    {ingestion.notes.length > 100 && '...'}
                  </div>
                  
                  <div className="text-xs text-blue-600 truncate mt-2">
                    {ingestion.linkedinUrl}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleClearOfflineData}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Clear All Offline Data
              </button>
              
              <div className="flex space-x-3">
                {isOnline && (
                  <button
                    onClick={handleRetrySync}
                    disabled={isRetrying}
                    className="
                      px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                      text-white text-sm rounded-lg transition-colors
                    "
                  >
                    {isRetrying ? 'Syncing...' : 'Retry All'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowOfflineNotes(false)}
                  className="
                    px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 
                    text-sm rounded-lg transition-colors
                  "
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfflineManager;