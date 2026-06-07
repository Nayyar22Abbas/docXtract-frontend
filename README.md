# DocXtract Frontend

A modern, futuristic Next.js application for AI-powered document processing.

## Features

- 🚀 **Modern Stack**: Built with Next.js 15, React 18, and TypeScript
- 🎨 **Beautiful UI**: Shadcn/ui components with Tailwind CSS
- 🌙 **Dark/Light Mode**: Seamless theme switching with next-themes
- ✨ **Smooth Animations**: Framer Motion for delightful interactions
- 📱 **Responsive Design**: Mobile-first approach with responsive layouts
- 🔐 **Authentication**: Login/signup forms with validation
- 🎯 **Modern UX**: Glass morphism effects and futuristic design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd docxtract-frontend
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Run the development server
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── dashboard/         # Dashboard page
│   ├── page.tsx          # Landing page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   ├── navbar.tsx        # Navigation component
│   ├── theme-toggle.tsx  # Theme switcher
│   └── futuristic-background.tsx
├── lib/                  # Utilities and API
│   ├── utils.ts         # Utility functions
│   └── api/
│       └── auth.ts      # Authentication API
└── public/              # Static assets
\`\`\`

## Pages

- **Landing Page** (`/`) - Hero section with features and CTA
- **Login Page** (`/login`) - User authentication with OAuth options
- **Signup Page** (`/signup`) - User registration with validation
- **Dashboard** (`/dashboard`) - Main application interface

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Shadcn/ui
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Theme**: next-themes for dark/light mode
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Design System

- **Colors**: Cyan primary with emerald accents
- **Typography**: Geist Sans font family
- **Effects**: Glass morphism, soft shadows, gradient animations
- **Responsive**: Mobile-first design approach

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Customization

The design system can be customized by modifying the CSS variables in `app/globals.css`. The color palette, spacing, and other design tokens are defined there.

## Backend Integration

The frontend includes placeholder API functions in `lib/api/auth.ts`. Replace these with actual backend endpoints:

- `login()` - User authentication
- `signup()` - User registration  
- `loginWithGoogle()` - Google OAuth
- `loginWithGitHub()` - GitHub OAuth

## Deployment

This project is optimized for deployment on Vercel:

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

## License

MIT License - see LICENSE file for details
