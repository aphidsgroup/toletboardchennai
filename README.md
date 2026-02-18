# Tolet Board Chennai - Real Estate Micro-Site + CMS

A modern, PWA-enabled real estate micro-site with a complete CMS dashboard, built for Tolet Board Chennai. Opens from Instagram bio and provides instant access to property listings with immersive 360° virtual tours.

## Features

### Public Site (PWA)
- **Linktree-style Home Page**: Brand header, primary CTAs, featured properties, type chips
- **Smart Listings**: Transaction type (Rent/Lease) and usage type (Residential/Commercial) toggles
- **Advanced Filters**: Area, budget, size, amenities with URL persistence
- **Property Details**: 360° tour iframe, specs, amenities, sticky contact bar
- **Mobile-First**: Responsive design, bottom sheet filters, thumb-friendly UI
- **Contact Integration**: WhatsApp with prefilled messages, direct call, share functionality

### CMS Dashboard
- **Authentication**: Secure login with session management
- **Dashboard**: Stats overview, quick actions, recent properties
- **Properties Management**: Full CRUD with search, publish/unpublish, featured toggle
- **Property Editor**: Live embed preview, auto-slug generation, validation
- **Settings**: Brand configuration, contact details, amenities vocabulary
- **Preview & Share**: Direct links to public pages, copy functionality

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom design system
- **Database**: Prisma + SQLite
- **Authentication**: iron-session with bcrypt
- **PWA**: next-pwa with service worker
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd "c:\Users\Kawinfinite PC 32\Downloads\TLC Web Antigrav"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values as needed (default values work for local development)

4. **Initialize the database**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   - Public site: http://localhost:3000
   - Admin login: http://localhost:3000/admin/login

### Default Admin Credentials
- **Email**: admin@toletboardchennai.com
- **Password**: ChangeThisPassword123!

## Project Structure

```
├── app/                      # Next.js App Router pages
│   ├── (public)/
│   │   ├── page.tsx         # Home page (Linktree-style)
│   │   ├── list/            # Listings page with filters
│   │   └── p/[slug]/        # Property detail page
│   ├── admin/               # CMS dashboard
│   │   ├── login/           # Admin login
│   │   ├── properties/      # Properties management
│   │   └── settings/        # Site settings
│   └── api/                 # API routes
│       ├── auth/            # Authentication endpoints
│       ├── admin/           # Protected admin APIs
│       └── public/          # Public read-only APIs
├── components/              # Reusable React components
│   ├── PropertyCard.tsx     # Property listing card
│   ├── FilterSheet.tsx      # Mobile filter bottom sheet
│   ├── ContactBar.tsx       # Sticky contact CTA bar
│   └── admin/               # Admin-specific components
├── lib/                     # Utilities and helpers
│   ├── db.ts               # Prisma client
│   ├── auth.ts             # Authentication utilities
│   ├── utils.ts            # Helper functions
│   └── types.ts            # TypeScript types
├── prisma/                  # Database schema and seed
│   ├── schema.prisma       # Database models
│   └── seed.ts             # Seed data script
└── public/                  # Static assets
    ├── manifest.json       # PWA manifest
    └── icons/              # App icons
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Admin Credentials (used for seeding)
ADMIN_EMAIL="admin@toletboardchennai.com"
ADMIN_PASSWORD="ChangeThisPassword123!"

# Session Secret (generate a random string for production)
SESSION_SECRET="your-super-secret-session-key-change-this-in-production"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Database Schema

### Models

**Admin**
- Stores admin user credentials with hashed passwords

**Property**
- Complete property information including:
  - Basic details (title, slug, location)
  - Transaction type (rent/lease) and usage type (residential/commercial)
  - Pricing and size specifications
  - Amenities (stored as JSON array)
  - 360° tour embed URL
  - Publishing status (isPublished, isFeatured)

**SiteSettings**
- Global site configuration:
  - Brand name and tagline
  - Contact information (WhatsApp, phone)
  - WhatsApp message template
  - Amenities vocabulary

## API Endpoints

### Public APIs (Read-only)
- `GET /api/public/properties` - List properties with filters
- `GET /api/public/properties/[slug]` - Get property by slug
- `GET /api/public/settings` - Get site settings

### Admin APIs (Protected)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/admin/properties` - List all properties
- `POST /api/admin/properties` - Create property
- `GET /api/admin/properties/[id]` - Get property by ID
- `PUT /api/admin/properties/[id]` - Update property
- `DELETE /api/admin/properties/[id]` - Delete property
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Important**: For production, you'll need to:
- Use a production-ready database (PostgreSQL, MySQL, etc.)
- Update `DATABASE_URL` in environment variables
- Change `SESSION_SECRET` to a secure random string
- Update `NEXT_PUBLIC_SITE_URL` to your domain
- Update admin credentials

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted with PM2

## PWA Features

The application is installable as a Progressive Web App:
- Offline-capable with service worker caching
- App-like experience on mobile devices
- Add to home screen functionality
- Fast loading with optimized assets

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes to database
- `npx prisma db seed` - Seed database with sample data

### Adding New Properties

See [PROPERTY_CHECKLIST.md](./PROPERTY_CHECKLIST.md) for a step-by-step guide.

### Customization

- **Colors**: Edit `tailwind.config.ts` to change the color scheme
- **Fonts**: Update `app/layout.tsx` to use different Google Fonts
- **Branding**: Use the Settings page in the CMS to update brand name and tagline

## Troubleshooting

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
npx prisma db seed
```

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm run dev
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Support

For issues or questions, contact Tolet Board Chennai support.

## License

Proprietary - All rights reserved by Tolet Board Chennai

---

Built with ❤️ for Tolet Board Chennai
