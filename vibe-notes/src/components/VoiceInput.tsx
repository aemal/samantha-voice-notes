'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Card, CardBody, Chip } from './NextUIProvider';

// TypeScript interfaces for component props and state
export interface VoiceInputProps {
  onTranscriptChange?: (transcript: string) => void;
  onFinalTranscript?: (finalTranscript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  placeholder?: string;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  className?: string;
  disabled?: boolean;
}

interface VoiceInputState {
  isRecording: boolean;
  transcript: string;
  finalTranscript: string;
  error: string | null;
  isSupported: boolean;
  isInitializing: boolean;
}

// Browser compatibility detection
const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptChange,
  onFinalTranscript,
  onError,
  onStart,
  onEnd,
  placeholder = "Click to start recording...",
  language = 'en-US',
  continuous = true,
  interimResults = true,
  className = '',
  disabled = false,
}) => {
  const [state, setState] = useState<VoiceInputState>({
    isRecording: false,
    transcript: '',
    finalTranscript: '',
    error: null,
    isSupported: false,
    isInitializing: true,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, isSupported: false, isInitializing: false }));
      return;
    }

    const isSupported = isSpeechRecognitionSupported();
    
    if (isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
    }

    setState(prev => ({ ...prev, isSupported, isInitializing: false }));
  }, [continuous, interimResults, language]);

  // Handle speech recognition events
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    const handleResult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let newFinalTranscript = '';

      // Only process new results from resultIndex onwards
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => {
        const updatedFinalTranscript = prev.finalTranscript + newFinalTranscript;
        const newState = {
          ...prev,
          transcript: interimTranscript,
          finalTranscript: updatedFinalTranscript,
        };

        // Callback for real-time transcript changes (send complete transcript + interim)
        if (onTranscriptChange) {
          const completeTranscript = updatedFinalTranscript + interimTranscript;
          onTranscriptChange(completeTranscript);
        }

        return newState;
      });

      // Callback for final transcript (only send the new final part)
      if (newFinalTranscript && onFinalTranscript) {
        onFinalTranscript(newFinalTranscript);
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error occurred';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone access denied or not available.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied.';
          break;
        case 'network':
          errorMessage = 'Network error occurred during speech recognition.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      setState(prev => ({ ...prev, error: errorMessage, isRecording: false }));
      
      if (onError) {
        onError(errorMessage);
      }
    };

    const handleStart = () => {
      setState(prev => ({ ...prev, isRecording: true, error: null }));
      if (onStart) {
        onStart();
      }
    };

    const handleEnd = () => {
      setState(prev => ({ ...prev, isRecording: false }));
      if (onEnd) {
        onEnd();
      }

      // Auto-restart if continuous mode and not manually stopped
      if (continuous && state.isRecording) {
        restartTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && !disabled) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.warn('Failed to restart speech recognition:', error);
            }
          }
        }, 100);
      }
    };

    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError);
    recognition.addEventListener('start', handleStart);
    recognition.addEventListener('end', handleEnd);

    return () => {
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('error', handleError);
      recognition.removeEventListener('start', handleStart);
      recognition.removeEventListener('end', handleEnd);
    };
  }, [continuous, onTranscriptChange, onFinalTranscript, onError, onStart, onEnd, disabled, state.isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current && state.isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [state.isRecording]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current || disabled || state.isRecording) return;

    setState(prev => ({ 
      ...prev, 
      transcript: '', 
      finalTranscript: '', 
      error: null 
    }));

    try {
      recognitionRef.current.start();
    } catch (error) {
      const errorMessage = 'Failed to start speech recognition';
      setState(prev => ({ ...prev, error: errorMessage }));
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [disabled, state.isRecording, onError]);

  const stopRecording = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (recognitionRef.current && state.isRecording) {
      recognitionRef.current.stop();
    }
  }, [state.isRecording]);

  const toggleRecording = () => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Render loading state
  if (state.isInitializing) {
    return (
      <Card className={`voice-input-container ${className}`}>
        <CardBody>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Initializing speech recognition...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Render unsupported state
  if (!state.isSupported) {
    return (
      <Card className={`voice-input-container ${className}`}>
        <CardBody>
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Speech Recognition Not Supported</p>
              <p className="text-sm text-yellow-700">
                Your browser doesn't support speech recognition. Please use a modern browser like Chrome, Edge, or Safari.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Main component render
  return (
    <Card className={`voice-input-container ${className}`}>
      <CardBody>
        <div className="flex flex-col space-y-4">
          {/* Recording Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={toggleRecording}
              isDisabled={disabled}
              color={state.isRecording ? 'danger' : 'primary'}
              variant="solid"
              size="lg"
              className={`p-4 rounded-full ${state.isRecording ? 'animate-pulse' : ''}`}
              aria-label={state.isRecording ? 'Stop recording' : 'Start recording'}
            >
              {state.isRecording ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              )}
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="text-center">
            {state.isRecording ? (
              <Chip color="danger" variant="light" className="animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Recording...</span>
                </div>
              </Chip>
            ) : (
              <span className="text-sm text-gray-600">{placeholder}</span>
            )}
          </div>

          {/* Live Transcript Display */}
          {(state.transcript || state.finalTranscript) && (
            <Card variant="flat">
              <CardBody>
                <div className="text-sm">
                  <div className="text-gray-900">
                    {state.finalTranscript}
                    <span className="text-gray-500 italic">{state.transcript}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Error Display */}
          {state.error && (
            <Card className="bg-red-50 border-red-200">
              <CardBody>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-red-800">{state.error}</span>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default VoiceInput;