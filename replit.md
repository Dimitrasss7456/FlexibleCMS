# replit.md

## Overview

This is a full-stack leasing platform application built with Express.js, React, and TypeScript. The platform connects clients seeking leasing services with leasing companies, agents, and suppliers. It provides a comprehensive solution for managing leasing applications, offers, and document workflows.

## User Preferences

Preferred communication style: Simple, everyday language.
Authentication system: Simple username/password instead of third-party auth (implemented).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Custom username/password authentication with bcrypt
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with structured error handling

### Database Design
- **Primary Database**: PostgreSQL (configured for Neon Database)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Tables**: 
  - Users (with username/password authentication)
  - Sessions (for authentication state)
  - Leasing applications, offers, companies, cars, documents, notifications

## Key Components

### Authentication System
- **Provider**: Custom username/password authentication with bcrypt hashing
- **Session Storage**: PostgreSQL-backed sessions using express-session and connect-pg-simple
- **User Types**: Client, Manager, Supplier, Agent, Admin
- **Access Control**: Role-based access with authentication middleware
- **Pages**: Dedicated login (/login) and registration (/register) pages

### Application Management
- **Workflow**: Multi-step process from application submission to approval
- **Status Tracking**: Real-time status updates with progress indicators
- **Document Management**: File upload and management system
- **Notifications**: Real-time notification system for status updates

### UI/UX Design
- **Design System**: shadcn/ui with "new-york" style variant
- **Theme**: Neutral color scheme with CSS custom properties
- **Responsive**: Mobile-first responsive design
- **Accessibility**: Radix UI primitives ensure accessibility compliance

### Data Management
- **Query Layer**: TanStack Query for caching, synchronization, and optimistic updates
- **Form Handling**: React Hook Form with Zod validation
- **Type Safety**: End-to-end TypeScript with shared schema validation

## Data Flow

1. **User Authentication**: Users authenticate via username/password and are assigned roles
2. **Application Submission**: Clients submit leasing applications through forms
3. **Offer Collection**: System distributes applications to compatible leasing companies
4. **Offer Review**: Clients review and select from available offers
5. **Document Processing**: Selected offers trigger document collection workflows
6. **Status Updates**: Real-time notifications keep all parties informed
7. **Admin Management**: Admin users have access to system-wide management tools

## External Dependencies

### Authentication & Infrastructure
- **Custom Authentication**: Username/password with bcrypt encryption
- **Neon Database**: PostgreSQL hosting service
- **Replit Platform**: Development and deployment environment

### Frontend Libraries
- **UI Components**: Comprehensive Radix UI component library
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Form Validation**: Zod for runtime type checking and validation

### Backend Services
- **Database**: @neondatabase/serverless for serverless PostgreSQL connections
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **WebSocket Support**: ws library for real-time features

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Vite HMR with custom error overlay
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Production Build
- **Frontend**: Vite production build to dist/public
- **Backend**: esbuild bundling for Node.js deployment
- **Static Assets**: Served via Express static middleware
- **Database**: Automated migrations via Drizzle Kit

### Platform Integration
- **Replit-Specific**: Custom Replit integration plugins and banners
- **Cartographer**: Development-time code mapping for Replit environment
- **Runtime Error Handling**: Custom error modal for development feedback

The application follows a monorepo structure with clear separation between client, server, and shared code, enabling efficient development and deployment on the Replit platform while maintaining scalability and maintainability.