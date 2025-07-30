# ONOSTORIES - Interactive Storybook Platform

ONOSTORIES is a subscription-based platform that creates personalized animated storybooks for children under 10 years old using AI technology.

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
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payments**: Stripe (subscriptions)
- **AI Integration**: Placeholders for Gemini 1.5 Pro/GPT-4o (text) and Imagen 2/Stable Diffusion (images)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migration in `supabase/migrations/create_initial_schema.sql`
   - Enable authentication with email/password
   - Configure storage bucket for child photos

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials
   ```

4. **Set up Stripe**
   - Create Stripe products for subscription tiers
   - Configure webhook endpoints
   - Add Stripe keys to environment variables

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Database Schema

### Tables
- **profiles**: User information and subscription status
- **stories**: Generated stories with content and metadata
- **child_photos**: Uploaded child photos for story generation

### Key Features
- Row Level Security (RLS) for data protection
- Automatic profile creation on user signup
- Subscription status tracking with expiration dates
- Photo storage integration

## AI Integration

The platform includes placeholders for AI services:

### Text Generation
- Gemini 1.5 Pro or OpenAI GPT-4o for story creation
- Context-aware prompts based on child's name, photos, and genre selection

### Image Generation
- Imagen 2 or Stable Diffusion SDXL for character-consistent illustrations
- Uses uploaded child photos as reference for main character

## Subscription Management

### Tiers
- **Free**: Demo stories only
- **Pro Monthly**: $9.99/month
- **Pro 6-Month**: $49.99 (17% savings)
- **Pro Annual**: $89.99 (25% savings)

### Features
- Automatic tier transitions via Stripe webhooks
- Subscription expiration handling
- Upgrade/downgrade functionality

## Story Generation Workflow

1. User uploads child photos
2. Selects genre and sub-genre
3. AI generates multi-slide story with illustration prompts
4. Images generated using child photos as character reference
5. Story compiled and stored in database
6. PDF generation for download

## Deployment

The application is designed for deployment on:
- Frontend: Netlify, Vercel, or similar
- Backend: Supabase (managed)
- Edge Functions: Supabase Edge Functions

## Development Roadmap

### Phase 1: Core MVP ✅
- User authentication and subscription management
- Basic story library with demo content
- Pro user dashboard and photo upload
- Payment integration foundation

### Phase 2: AI Integration
- Implement Gemini/GPT-4o for text generation
- Integrate Imagen 2/Stable Diffusion for images
- Character consistency across story images
- Advanced prompt engineering

### Phase 3: Enhanced Features
- Story customization options
- Multiple character support
- Advanced PDF styling
- Social sharing capabilities

### Phase 4: Scale & Polish
- Performance optimization
- Advanced analytics
- Multi-language support
- Mobile app development

## Contributing

This is a production-worthy foundation ready for AI integration and scaling. The architecture supports:
- Modular component design
- Type-safe database operations
- Secure authentication and authorization
- Scalable subscription management
- AI service integration points

## License

Copyright © 2024 ONOSTORIES. All rights reserved.