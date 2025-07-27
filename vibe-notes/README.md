# Vibe Notes - Voice-Powered Contact Management

A Progressive Web App (PWA) built with Next.js 15 that enables voice-powered contact management for LinkedIn networking. Record notes about your professional contacts using speech-to-text technology and search them using natural language queries.

## Features

### ✨ Core Functionality
- **Voice Recording**: Use Web Speech API to record notes with your voice
- **LinkedIn Integration**: Save notes linked to LinkedIn profile URLs
- **Smart Search**: Natural language search through your contact notes
- **Offline Support**: Works offline with automatic sync when reconnected

### 🚀 Technical Features
- **Progressive Web App**: Install on mobile devices for native-like experience
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Accessibility**: WCAG compliant with screen reader support
- **Offline Storage**: IndexedDB for local data persistence
- **TypeScript**: Fully typed for better development experience

## Getting Started

### Prerequisites
- Node.js 18+ 
- Modern browser with Web Speech API support (Chrome, Edge, Safari)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vibe-notes
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Contact Notes
1. Navigate to the "Add Contact" tab
2. Enter a LinkedIn profile URL
3. Either:
   - Click the voice recording button and speak your notes
   - Type notes manually in the textarea
4. Click "Save Contact Note"

### Searching Contacts
1. Navigate to the "Search Contacts" tab
2. Either:
   - Use voice search by clicking the microphone
   - Type your search query in the text field
3. View results and click "Open Profile" to visit LinkedIn

### Progressive Web App Installation
- On mobile: Look for the browser's "Add to Home Screen" option
- On desktop: Click the install button that appears in the address bar
- The app works offline and provides native-like experience when installed

## Architecture

### Frontend Components
- **VoiceInput**: Reusable speech-to-text component
- **IngestionScreen**: Form for adding new contact notes
- **QueryScreen**: Search interface with results display
- **OfflineManager**: Handles offline/online status and sync
- **PWAInstaller**: Manages PWA installation prompts

### Data Storage
- **localStorage**: Form drafts and completed submissions (online)
- **IndexedDB**: Offline data persistence and sync queue
- **Service Worker**: Caches resources and handles background sync

### Technologies Used
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Utility-first styling
- **Web Speech API**: Browser-native speech recognition
- **IndexedDB**: Client-side database for offline support
- **Service Workers**: PWA functionality and offline support

## Browser Support

### Full Support
- Chrome 25+
- Edge 79+
- Safari 14.1+

### Limited Support (no voice features)
- Firefox (Web Speech API not supported)
- Older browsers

## Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── types/              # TypeScript definitions
└── utils/              # Utility functions

public/
├── icons/              # PWA icons
├── manifest.json       # PWA manifest
└── sw.js              # Service worker
```

### Key Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Accessibility Features

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Reduced motion respect
- Minimum touch target sizes (44px)
- Focus indicators
- ARIA labels and roles

## Privacy & Data

- All data stored locally in browser
- No external APIs called for core functionality
- LinkedIn URLs only used for deep linking
- Voice data processed locally via Web Speech API
- No analytics or tracking implemented

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

- [ ] Export/import functionality
- [ ] Contact categories and tags
- [ ] Advanced search filters
- [ ] Contact relationship mapping
- [ ] Integration with CRM systems
- [ ] Push notifications for follow-ups

## Support

For support, please open an issue on GitHub or contact the development team.