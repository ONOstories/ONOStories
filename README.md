# ONOSTORIES - Interactive Storybook Platform

ONOSTORIES is a frontend-only demo of a platform that creates personalized animated storybooks for children under 10 years old.

**Note: This is a frontend-only application with no authentication required. All features are accessible to everyone.**

## Features

### Available to All Users
- Access to 4-5 pre-made demo stories
- View stories online
- Create personalized stories with photo uploads
- Generate unlimited stories across multiple genres
- Download stories as PDF files (simulated)
- Access complete story history with regeneration capability

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **State Management**: React useState and localStorage persistence
- **Mock Data**: Local JSON data structures
- **No Authentication**: Open access to all features

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

## Local Data Storage

The application uses localStorage to persist:
- Generated stories
- Uploaded photos (as base64 URLs)

All data is stored locally in your browser and will persist between sessions.

## Mock Data Structure

The application includes comprehensive mock data:
- **Demo Stories**: 5 pre-made stories available to all users
- **Personalized Story Templates**: 3 customizable story types
- **Generated Stories**: Sample personalized stories

## Features

### Story Generation Workflow

1. User uploads child photos
2. Selects genre and sub-genre
3. Template-based story creation
4. Story saved to localStorage
5. Simulated PDF download

### Story Library
- Browse demo stories with ratings and descriptions
- View personalized story templates
- Create new stories directly from the library

### Dashboard
- Create new personalized stories
- Manage uploaded photos
- View story history
- Download created stories

## Development Notes

This frontend-only version provides:
- All UI functionality without backend dependencies
- User interactions work as expected
- State management through React hooks
- Data persistence via localStorage
- No authentication required - open access

## Deployment

The application can be deployed to any static hosting service:
- Netlify
- Vercel  
- GitHub Pages
- Any CDN or static file server

No backend infrastructure is required.

## License

Copyright © 2024 ONOSTORIES. All rights reserved.