// TypeScript declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  
  start(): void;
  stop(): void;
  abort(): void;
  
  addEventListener(type: 'audiostart', listener: (event: Event) => void): void;
  addEventListener(type: 'audioend', listener: (event: Event) => void): void;
  addEventListener(type: 'end', listener: (event: Event) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'nomatch', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'soundstart', listener: (event: Event) => void): void;
  addEventListener(type: 'soundend', listener: (event: Event) => void): void;
  addEventListener(type: 'speechstart', listener: (event: Event) => void): void;
  addEventListener(type: 'speechend', listener: (event: Event) => void): void;
  addEventListener(type: 'start', listener: (event: Event) => void): void;
  
  removeEventListener(type: 'audiostart', listener: (event: Event) => void): void;
  removeEventListener(type: 'audioend', listener: (event: Event) => void): void;
  removeEventListener(type: 'end', listener: (event: Event) => void): void;
  removeEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  removeEventListener(type: 'nomatch', listener: (event: SpeechRecognitionEvent) => void): void;
  removeEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  removeEventListener(type: 'soundstart', listener: (event: Event) => void): void;
  removeEventListener(type: 'soundend', listener: (event: Event) => void): void;
  removeEventListener(type: 'speechstart', listener: (event: Event) => void): void;
  removeEventListener(type: 'speechend', listener: (event: Event) => void): void;
  removeEventListener(type: 'start', listener: (event: Event) => void): void;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof webkitSpeechRecognition;
}