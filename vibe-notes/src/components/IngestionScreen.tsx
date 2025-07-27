'use client';

import React, { useState, useEffect } from 'react';
import VoiceInput from './VoiceInput';
import { indexedDBManager, ConnectionManager } from '@/utils/indexedDB';
import { Button, Input, Textarea, Card, CardBody, CardHeader, Chip } from './NextUIProvider';

interface IngestionData {
  linkedinUrl: string;
  notes: string;
  timestamp: number;
  id: string;
}

interface IngestionScreenProps {
  onSubmit?: (data: IngestionData) => void;
  className?: string;
}

const IngestionScreen: React.FC<IngestionScreenProps> = ({ onSubmit, className = '' }) => {
  const [formData, setFormData] = useState({
    linkedinUrl: '',
    notes: '',
  });
  const [errors, setErrors] = useState({
    linkedinUrl: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [characterCount, setCharacterCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // Load data from localStorage and setup connection monitoring
  useEffect(() => {
    const savedData = localStorage.getItem('ingestion-draft');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData({
          linkedinUrl: parsedData.linkedinUrl || '',
          notes: parsedData.notes || '',
        });
        setCharacterCount((parsedData.notes || '').length);
      } catch (error) {
        console.warn('Failed to load saved ingestion data:', error);
      }
    }

    // Setup connection monitoring
    const connectionManager = ConnectionManager.getInstance();
    setIsOnline(connectionManager.getConnectionStatus());
    
    const handleConnectionChange = (online: boolean) => {
      setIsOnline(online);
    };
    
    connectionManager.addConnectionListener(handleConnectionChange);
    
    return () => {
      connectionManager.removeConnectionListener(handleConnectionChange);
    };
  }, []);

  // Save to localStorage whenever form data changes
  useEffect(() => {
    const dataToSave = {
      ...formData,
      lastSaved: Date.now(),
    };
    localStorage.setItem('ingestion-draft', JSON.stringify(dataToSave));
  }, [formData]);

  // LinkedIn URL validation
  const validateLinkedInUrl = (url: string): string => {
    if (!url.trim()) {
      return 'LinkedIn URL is required';
    }
    
    const linkedinUrlPattern = /^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9\-_%]+\/?.*$/;
    if (!linkedinUrlPattern.test(url.trim())) {
      return 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)';
    }
    
    return '';
  };

  // Notes validation
  const validateNotes = (notes: string): string => {
    if (!notes.trim()) {
      return 'Notes are required';
    }
    
    if (notes.trim().length < 10) {
      return 'Notes must be at least 10 characters long';
    }
    
    return '';
  };

  // Handle LinkedIn URL input change
  const handleLinkedInUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, linkedinUrl: value }));
    
    // Clear error when user starts typing
    if (errors.linkedinUrl) {
      setErrors(prev => ({ ...prev, linkedinUrl: '' }));
    }
  };

  // Handle notes textarea change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, notes: value }));
    setCharacterCount(value.length);
    
    // Clear error when user starts typing
    if (errors.notes) {
      setErrors(prev => ({ ...prev, notes: '' }));
    }
  };

  // Handle voice input transcript
  const handleVoiceTranscript = (transcript: string) => {
    setFormData(prev => ({ ...prev, notes: prev.notes + transcript }));
    setCharacterCount(formData.notes.length + transcript.length);
  };

  // Handle voice input final transcript
  const handleVoiceFinalTranscript = (finalTranscript: string) => {
    const newNotes = formData.notes + finalTranscript + ' ';
    setFormData(prev => ({ ...prev, notes: newNotes }));
    setCharacterCount(newNotes.length);
  };

  // Form validation
  const validateForm = (): boolean => {
    const linkedinError = validateLinkedInUrl(formData.linkedinUrl);
    const notesError = validateNotes(formData.notes);
    
    setErrors({
      linkedinUrl: linkedinError,
      notes: notesError,
    });
    
    return !linkedinError && !notesError;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const submissionData: IngestionData = {
        linkedinUrl: formData.linkedinUrl.trim(),
        notes: formData.notes.trim(),
        timestamp: Date.now(),
        id: `ingestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      
      if (isOnline) {
        // Online: Save to localStorage as completed submission
        const existingSubmissions = JSON.parse(localStorage.getItem('completed-ingestions') || '[]');
        existingSubmissions.push(submissionData);
        localStorage.setItem('completed-ingestions', JSON.stringify(existingSubmissions));
        
        // Call onSubmit callback if provided
        if (onSubmit) {
          await onSubmit(submissionData);
        }
      } else {
        // Offline: Save to IndexedDB for later sync
        await indexedDBManager.addPendingIngestion({
          linkedinUrl: submissionData.linkedinUrl,
          notes: submissionData.notes,
          timestamp: submissionData.timestamp,
        });
      }
      
      // Clear draft
      localStorage.removeItem('ingestion-draft');
      
      setSubmitStatus('success');
      
      // Reset form
      setFormData({ linkedinUrl: '', notes: '' });
      setCharacterCount(0);
      setErrors({ linkedinUrl: '', notes: '' });
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear form
  const handleClear = () => {
    setFormData({ linkedinUrl: '', notes: '' });
    setCharacterCount(0);
    setErrors({ linkedinUrl: '', notes: '' });
    localStorage.removeItem('ingestion-draft');
  };

  return (
    <div className={`ingestion-screen max-w-2xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Contact Note</h1>
        <p className="text-gray-600">
          Enter a LinkedIn profile URL and add notes about your interaction or observations.
        </p>
      </div>

      {/* Success/Error Messages */}
      {submitStatus === 'success' && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardBody>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-800">Contact note saved successfully!</span>
            </div>
          </CardBody>
        </Card>
      )}

      {submitStatus === 'error' && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardBody>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-800">Failed to save contact note. Please try again.</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LinkedIn URL Input */}
        <Input
          type="url"
          label="LinkedIn Profile URL *"
          placeholder="https://linkedin.com/in/username"
          value={formData.linkedinUrl}
          onChange={handleLinkedInUrlChange}
          isInvalid={!!errors.linkedinUrl}
          errorMessage={errors.linkedinUrl}
          isDisabled={isSubmitting}
          variant="bordered"
        />

        {/* Notes Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes *
            </label>
            
            {/* Voice Input Component */}
            <div className="mb-4">
              <VoiceInput
                onTranscriptChange={handleVoiceTranscript}
                onFinalTranscript={handleVoiceFinalTranscript}
                placeholder="Click to record notes using your voice"
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            {/* Manual Text Input */}
            <Textarea
              value={formData.notes}
              onChange={handleNotesChange}
              placeholder="Type your notes here or use voice recording above..."
              rows={6}
              isInvalid={!!errors.notes}
              errorMessage={errors.notes}
              isDisabled={isSubmitting}
              variant="bordered"
            />
            
            {/* Character Count */}
            <div className="mt-2 flex justify-end">
              <Chip variant="light" size="sm">
                {characterCount} characters
              </Chip>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            {isSubmitting ? 'Saving...' : 'Save Contact Note'}
          </Button>
          
          <Button
            type="button"
            variant="bordered"
            size="lg"
            onClick={handleClear}
            isDisabled={isSubmitting}
          >
            Clear Form
          </Button>
        </div>
      </form>

      {/* Auto-save Indicator */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          📝 Form data is automatically saved as you type
        </p>
      </div>
    </div>
  );
};

export default IngestionScreen;