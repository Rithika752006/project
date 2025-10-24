# Digital Wallet Application

## Overview

A secure digital wallet application built with React, Express, and PostgreSQL that enables users to manage finances through deposits, transfers, and multi-mode payment processing. The application features real-time transaction tracking, wallet type management (Basic/Premium), and comprehensive analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens

**Design System:**
- Hybrid approach combining Stripe Dashboard aesthetics with Material Design principles
- Custom color system using HSL values with CSS variables for theming
- Typography: Inter font for UI, JetBrains Mono for numerical/financial data
- Responsive grid: 12-column layout with mobile-first breakpoints

**Component Architecture:**
- Modular component structure with shadcn/ui components in `client/src/components/ui/`
- Feature components (DepositModal, TransferModal, TransactionTable, AnalyticsSection) handle business logic
- Form validation using React Hook Form with Zod schemas
- Real-time data fetching with automatic refetching and optimistic updates

### Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js for HTTP server and API routing
- **Database**: PostgreSQL via Neon serverless with WebSocket support
- **ORM**: Drizzle ORM for type-safe database queries
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)

**Design Patterns:**

1. **Strategy Pattern** (`server/patterns/paymentStrategy.ts`):
   - Implements different payment modes (UPI, Card, WalletBalance)
   - Encapsulates payment processing logic with `PaymentStrategy` interface
   - Factory method (`PaymentStrategyFactory`) for strategy instantiation
   - Enables easy addition of new payment methods without modifying existing code

2. **Factory Pattern** (`server/patterns/walletFactory.ts`):
   - Creates wallet configurations based on type (Basic/Premium)
   - Encapsulates wallet creation logic with different transaction limits
   - Provides reflection-like inspection capabilities for wallet metadata

3. **Concurrency Control**:
   - Mutex-based locking (`async-mutex`) for thread-safe wallet balance updates
   - HashMap implementation tracking locks per wallet ID
   - Prevents race conditions during concurrent transactions
   - Critical for maintaining financial data integrity

**Storage Layer** (`server/storage.ts`):
- Abstracted storage interface (`IStorage`) for database operations
- Thread-safe transaction processing with wallet-level locking
- Supports user management, wallet operations, and transaction history
- Integrates custom exception handling for business logic errors

**Error Handling**:
- Custom exception class `InsufficientFundsException` for domain-specific errors
- Structured error responses with detailed context (available balance, requested amount)
- Proper stack trace preservation for debugging

**File I/O & Logging**:
- Transaction audit logging to daily log files (`server/utils/transactionLogger.ts`)
- Wallet serialization for data persistence (`server/utils/walletSerializer.ts`)
- JSON-based file storage in dedicated directories

### Database Schema

**Tables:**

1. **sessions** - OpenID Connect session storage
   - Primary key: `sid` (session ID)
   - Contains session data and expiration timestamps
   - Indexed on expiration for cleanup efficiency

2. **users** - User account information
   - UUID primary key with auto-generation
   - Stores email, name, profile image from Replit Auth
   - Timestamps for creation and updates

3. **wallets** - Digital wallet records
   - UUID primary key, foreign key to users
   - Decimal balance with precision (12,2)
   - Wallet type (Basic/Premium) with transaction limits
   - One-to-one relationship with users

4. **transactions** - Transaction history
   - UUID primary key
   - Foreign keys to sender/recipient wallets and users
   - Transaction type (deposit/transfer), status, payment mode
   - Decimal amount, description, error messages
   - Timestamps for audit trails

**Relationships:**
- Users → Wallets (one-to-one)
- Wallets → Transactions (one-to-many, both as sender and recipient)
- Enforced referential integrity with foreign key constraints

### Authentication & Authorization

**Authentication Provider**: Replit Auth via OpenID Connect
- Discovery-based OIDC configuration
- Passport.js strategy implementation
- Automatic user provisioning on first login
- Session-based authentication with secure cookies

**Session Management**:
- 7-day session TTL
- PostgreSQL-backed session store
- HTTPOnly, secure cookies for production
- Middleware protection on all API routes except auth endpoints

**Authorization**:
- `isAuthenticated` middleware validates session and user presence
- User context extracted from OIDC claims (`req.user.claims.sub`)
- API routes enforce authentication before data access

### API Structure

**Authentication Routes:**
- `GET /api/login` - Initiates OIDC login flow
- `GET /api/callback` - OIDC callback handler
- `GET /api/logout` - Session termination
- `GET /api/auth/user` - Fetch current authenticated user

**Wallet Routes:**
- `GET /api/wallet` - Get current user's wallet with balance
- `POST /api/wallet/deposit` - Deposit funds via payment strategy
- `POST /api/wallet/transfer` - Transfer funds between wallets

**Transaction Routes:**
- `GET /api/transactions` - Fetch user's transaction history with details

**User Routes:**
- `GET /api/users` - List all users except current (for transfer recipient selection)

All routes use JSON request/response format with proper error handling and status codes.

## External Dependencies

### Third-Party Services

1. **Neon PostgreSQL**:
   - Serverless PostgreSQL database with WebSocket support
   - Environment variable: `DATABASE_URL`
   - Connection pooling via `@neondatabase/serverless`

2. **Replit Auth (OpenID Connect)**:
   - Authentication provider using OIDC Discovery
   - Environment variables: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`
   - Handles user identity, profile data, and session management

### Key NPM Packages

**Backend:**
- `express` - Web server framework
- `drizzle-orm` + `drizzle-kit` - Type-safe ORM and migrations
- `@neondatabase/serverless` - Neon database client
- `passport` + `openid-client` - Authentication middleware
- `async-mutex` - Concurrency control
- `connect-pg-simple` - PostgreSQL session store

**Frontend:**
- `react` + `react-dom` - UI framework
- `@tanstack/react-query` - Server state management
- `wouter` - Routing
- `react-hook-form` + `zod` + `@hookform/resolvers` - Form handling and validation
- `@radix-ui/*` - Headless UI primitives
- `tailwindcss` - Utility-first CSS framework
- `date-fns` - Date formatting and manipulation

**Development:**
- `vite` - Build tool and dev server
- `typescript` - Type checking
- `@replit/vite-plugin-*` - Replit-specific development tools

### Environment Variables Required

- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `ISSUER_URL` - OIDC issuer URL (defaults to Replit)
- `REPL_ID` - Replit project identifier
- `SESSION_SECRET` - Secret key for session encryption
- `NODE_ENV` - Environment mode (development/production)