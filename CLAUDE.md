# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a health directory application for Madagascar (Annuaire Digital des Centres d'Urgence du Madagascar), designed to help users find, filter, and view health centers in their area. The project is currently transitioning from a Vue.js application to a Next.js 14+ implementation.

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Maps**: Leaflet + OpenStreetMap (free alternative to Mapbox)
- **State Management**: Zustand or Context API
- **Validation**: Zod
- **Deployment**: Vercel

### Backend & Database
- **Backend**: Supabase (PostgreSQL + PostGIS for geospatial queries)
- **API**: Supabase auto-generated REST API + Edge Functions
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (for health center images)
- **Real-time**: Supabase Realtime (for notifications)

### Development Commands

Since this is a Next.js project, the standard commands would be:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

Note: The actual package.json has not been created yet, so these commands should be added when initializing the project.

## Architecture Overview

### Database Schema (PostgreSQL + PostGIS)

The main table `centres_sante` includes:
- Basic information (name, type, status)
- Location data with geospatial support (`GEOMETRY(POINT, 4326)`)
- Contact information (phone, WhatsApp, email, website)
- Services and specialties arrays
- Operating hours (JSONB format)
- Accessibility features
- Photos (stored in Supabase Storage)

### Key Features

1. **Geospatial Search**: Using PostGIS for proximity-based searches
2. **Multi-filter System**: Search by location, services, type, 24/7 availability
3. **Interactive Maps**: Leaflet integration with clustering
4. **Mobile-First Design**: Responsive with PWA capabilities
5. **Admin Dashboard**: Content moderation and management
6. **Registration System**: Health centers can self-register (requires moderation)

### Application Structure

```
/app
├── page.tsx                    # Homepage with search
├── recherche/                  # Search results page
├── centre/[id]/               # Individual health center pages
├── inscription/               # Registration form for health centers
├── admin/                     # Admin dashboard
└── api/                       # API routes
    ├── centres/               # CRUD operations for health centers
    ├── search/                # Advanced search functionality
    └── contact/               # Contact form handling
```

### Key Components

- `SearchBar`: Intelligent search with autocomplete
- `CentreCard`: Health center display cards
- `MapView`: Interactive Leaflet map
- `FilterPanel`: Dynamic filtering interface
- `CentreDetail`: Detailed health center information
- `ContactModal`: Contact form modal
- `AdminDashboard`: Content management interface

## Development Guidelines

### Database Queries

The application uses PostGIS for geospatial queries:
- Distance-based searches using `ST_Distance` and `ST_DWithin`
- Full-text search with PostgreSQL's `to_tsvector`
- Proper indexing for performance (`GIST` for spatial, `GIN` for text search)

### API Structure

REST endpoints following RESTful conventions:
- `GET /api/centres` - List with pagination & filters
- `GET /api/centres/[id]` - Get specific health center
- `POST /api/centres` - Create new health center (requires moderation)
- `PUT /api/centres/[id]` - Update health center
- `DELETE /api/centres/[id]` - Delete health center (admin only)

### Security & Permissions

Using Supabase Row Level Security (RLS):
- Public users can only view active health centers
- Registered users can submit health centers for moderation
- Admins have full CRUD access

### Performance Considerations

- Implement pagination (20 centers per page)
- Lazy loading for images and components
- Browser and Supabase Edge caching
- Image optimization with WebP format
- Clustering for map markers with many points

## Environment Variables

Required environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (server-side only)
NEXT_PUBLIC_NOMINATIM_URL=https://nominatim.openstreetmap.org  # Geocoding service
NEXT_PUBLIC_APP_URL=             # Application URL for SEO/metadata
```

## Development Phases

### Phase 1 (MVP)
- Supabase database setup with PostGIS
- Basic Next.js structure with App Router
- Home page with search functionality
- Health center listing with basic filters
- Individual health center detail pages

### Phase 2 (Enhanced Features)
- Interactive map with Leaflet
- User geolocation for proximity search
- Health center registration form
- Basic admin dashboard
- Image upload functionality

### Phase 3 (Polish)
- PWA capabilities
- Dark mode support
- Performance optimizations
- SEO implementation
- Comprehensive testing

## Key Technical Notes

- The project uses French language content (target audience in Madagascar)
- Geospatial data uses WGS84 coordinate system (SRID 4326)
- All timestamps use PostgreSQL's `TIMESTAMP WITH TIME ZONE`
- Health center types are defined as PostgreSQL ENUMs
- Services and specialties are stored as PostgreSQL arrays for flexible querying
- Operating hours are stored as JSONB for complex schedule structures

## Project Status

Currently in transition phase - the previous Vue.js application has been removed and the project needs to be initialized as a fresh Next.js application following the specifications in the README.md and specs files.