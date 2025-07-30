# ONOSTORIES - Interactive Storybook Platform

ONOSTORIES is a frontend-only demo of a subscription-based platform that creates personalized animated storybooks for children under 10 years old using AI technology.

**Note: This is now a frontend-only application with all backend integrations removed. All data is stored locally using localStorage and mock data.**
## Features

### Free Users
- Access to 4-5 pre-made demo stories
- View stories online only
- Sample different story types and genres

### Pro Users
- Upload child photos (4-5 images) for personalized characters
- Generate unlimited personalized stories
- Choose from 3 main genres with multiple sub-genres
- Custom genre option for specific story themes
- Download stories as PDF files
- Access complete story history with regeneration capability

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **State Management**: React Context API with localStorage persistence
- **Mock Data**: Local JSON data structures replacing database content
- **Authentication**: Simulated with localStorage (demo credentials available)

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

## Demo Credentials

For testing the application, you can use these demo accounts:

**Free User:**
- Email: demo@example.com
- Password: password123

**Pro User:**
- Email: pro@example.com  
- Password: password123

## Local Data Storage

The application uses localStorage to persist:
- User authentication state
- User profiles and subscription status
- Generated stories
- Uploaded photos (as base64 URLs)

All data is stored locally in your browser and will persist between sessions.

## Mock Data Structure

The application includes comprehensive mock data:
- **Demo Stories**: 5 pre-made stories available to all users
- **Personalized Story Templates**: 3 customizable story types for Pro users
- **User Profiles**: Mock user data with different subscription tiers
- **Generated Stories**: Sample personalized stories for Pro users

## Removed Backend Features

The following backend integrations have been removed and replaced with frontend alternatives:

- ~~Supabase authentication~~ → Local authentication simulation
- ~~Supabase database~~ → localStorage with mock data
- ~~Stripe payments~~ → Simulated subscription upgrades
- ~~File uploads to Supabase Storage~~ → Local file handling with base64
- ~~AI story generation~~ → Mock story creation with templates
- ~~PDF generation~~ → Simulated download functionality

## Frontend-Only Features

## Subscription Management

### Tiers
- **Free**: Demo stories only
- **Pro Monthly**: $9.99/month
- **Pro 6-Month**: $49.99 (17% savings)
- **Pro Annual**: $89.99 (25% savings)

### Simulated Features
- Local subscription status management
- Simulated upgrade functionality (updates localStorage)
- Subscription expiration tracking

## Story Generation Workflow

1. User uploads child photos
2. Selects genre and sub-genre
3. ~~AI generates multi-slide story~~ → Template-based story creation
4. ~~Images generated~~ → Placeholder images used
5. Story saved to localStorage
6. ~~PDF generation~~ → Simulated download

## Development Notes

This frontend-only version maintains all UI functionality while removing backend dependencies:

- All components render correctly
- User interactions work as expected
- State management through React Context
- Data persistence via localStorage
- Mock authentication system
- Simulated subscription management

## Deployment

The application can be deployed to any static hosting service:
- Netlify
- Vercel  
- GitHub Pages
- Any CDN or static file server

No backend infrastructure is required.

## Re-integrating Backend (Future)

To restore backend functionality:

1. Reinstall removed packages: `@supabase/supabase-js`, `stripe`, `@stripe/stripe-js`
2. Restore the `src/lib/supabase.ts` file
3. Replace the AuthContext with the original useAuth hook
4. Update components to use Supabase queries instead of localStorage
5. Implement actual file upload and AI integration
6. Configure environment variables for external services

## License

Copyright © 2024 ONOSTORIES. All rights reserved.