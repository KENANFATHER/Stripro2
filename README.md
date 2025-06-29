# Stripro - Stripe Analytics & Profitability Dashboard

A comprehensive SaaS dashboard for analyzing Stripe client profitability with beautiful design, built with React, TypeScript, and Tailwind CSS.

## Features

- **Authentication System**: Secure login/signup with enhanced security features
- **Client Management**: Track and analyze client profitability
- **Revenue Analytics**: Detailed revenue and fee analysis
- **Stripe Integration**: Ready for Stripe payment processing integration
- **Security Features**: Input validation, CSRF protection, rate limiting
- **Beautiful Design**: Custom color palette with lilac, tangerine, coral, and sage tones
- **Responsive Design**: Works on all devices

## Design System

### Color Palette
- **Lilac**: `#c08cad` - Primary brand color for accents and highlights
- **Atomic Tangerine**: `#e69c7f` - Secondary color for CTAs and important elements
- **Coral**: `#ed8074` - Vibrant accent color for special highlights and interactions
- **Ash Gray/Sage**: `#becdb8` - Neutral color for backgrounds and subtle elements
- **White**: `#ffffff` - Clean backgrounds and text contrast

### Typography & Branding
- **Brand Name**: Stripro (Stripe + Pro)
- **Logo**: Custom logo with modern design
- **Fonts**: System fonts with careful hierarchy
- **Gradients**: Smooth transitions between brand colors including coral accents

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Authentication**: Supabase (ready for integration)
- **Security**: bcryptjs, input validation, CSRF protection
- **Code Quality**: ESLint, TypeScript ESLint with comprehensive rules

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stripro-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

## Code Quality

### ESLint Configuration
The project includes comprehensive ESLint rules for:
- **React & Hooks**: Enforces React best practices and Rules of Hooks
- **TypeScript**: Strict type checking and modern TS patterns
- **Security**: Prevents common vulnerabilities (XSS, eval, etc.)
- **Performance**: Optimizes bundle size and runtime performance
- **Import Organization**: Automatic import sorting and circular dependency detection

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run lint:check` - Strict linting (no warnings)
- `npm run type-check` - TypeScript type checking

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env`

### 2. Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- User security settings table
CREATE TABLE user_security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret TEXT, -- Encrypted TOTP secret
  backup_codes TEXT[], -- Hashed backup codes
  last_password_change TIMESTAMPTZ DEFAULT NOW(),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security events log table
CREATE TABLE security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own security settings" ON user_security_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own security settings" ON user_security_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own security events" ON security_events
  FOR SELECT USING (auth.uid() = user_id);
```

### 3. Authentication Configuration

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL: `http://localhost:5173` (for development)
3. Add production URL when deploying
4. Configure email templates as needed

### 4. Stripe Webhook Configuration

Set up the Stripe webhook Edge Function to receive real-time events:

1. **Deploy the webhook Edge Function:**
   ```bash
   supabase functions deploy stripe-webhook
   ```

2. **Configure Stripe webhook endpoint:**
   - Go to your [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
   - Click "Add endpoint"
   - Set the endpoint URL to: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Select these events to send:
     - `customer.created`
     - `customer.updated`
     - `payment_intent.succeeded`
     - `charge.refunded`
   - Copy the webhook signing secret

3. **Set environment variables in Supabase:**
   ```bash
   # Set your Stripe secret key
   supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   
   # Set your webhook signing secret
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

4. **Test the webhook:**
   - Use Stripe CLI to forward events: `stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Or trigger test events from the Stripe Dashboard

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard-specific components
│   ├── Layout/         # Layout components
│   └── UI/             # Generic UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── data/               # Mock data for development
├── supabase/
│   ├── functions/          # Supabase Edge Functions
│   │   ├── stripe-connect-callback/  # OAuth callback handler
│   │   ├── stripe-webhook/           # Webhook event processor
│   │   └── stripe-profitability/     # Profitability calculator
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## Security Features

- **Input Validation**: Client-side validation with sanitization
- **Password Security**: Strong password requirements with visual feedback
- **Rate Limiting**: Protection against brute force attacks
- **CSRF Protection**: Cross-site request forgery prevention
- **Session Management**: Secure session handling with fingerprinting
- **MFA Support**: Two-factor authentication ready
- **XSS Prevention**: Input sanitization and CSP headers

## Design Philosophy

Stripro follows modern design principles with:
- **Clean Aesthetics**: Inspired by Apple's attention to detail
- **Consistent Spacing**: 8px grid system throughout
- **Thoughtful Colors**: Carefully chosen palette for accessibility and beauty
- **Micro-interactions**: Subtle animations and hover states
- **Responsive Design**: Mobile-first approach with breakpoints
- **Typography Hierarchy**: Clear information architecture
- **Gradient Accents**: Beautiful color transitions with coral highlights

## Development

### Demo Mode

The application includes demo mode with mock authentication:
- Use any email and password to sign in
- All data is mocked for demonstration purposes
- Replace with actual Supabase integration for production

## Supabase Edge Functions

The project includes three Supabase Edge Functions:

1. **stripe-connect-callback**: Handles Stripe Connect OAuth callbacks
2. **stripe-webhook**: Processes Stripe webhook events in real-time
3. **stripe-profitability**: Calculates client profitability from Stripe data

### Deploying Edge Functions

```bash
# Deploy the updated stripe-profitability function
supabase functions deploy stripe-profitability

# Deploy all functions
supabase functions deploy

# Deploy specific functions
supabase functions deploy stripe-connect-callback
supabase functions deploy stripe-webhook
supabase functions deploy stripe-profitability
```

### Environment Variables

Set these secrets in your Supabase project:

```bash
# Required for all Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Required for OAuth callback
supabase secrets set FRONTEND_URL=http://localhost:5173

# For production, also set the service role key
supabase secrets set SERVICE_ROLE_KEY=your_service_role_key_here
```

## Production Setup

### Stripe Integration

1. **Set up API keys** in the Settings page
2. **Configure webhook endpoint** in your Stripe Dashboard (see Webhook Configuration above)
3. **Test the integration** with Stripe's test mode

### Data Flow

1. Stripe events trigger webhooks to the `stripe-webhook` Edge Function
2. Edge Functions process events and update Supabase tables
3. The `stripe-profitability` Edge Function calculates client metrics including refunds
4. Users can analyze client performance and optimize pricing

### Profitability Calculation

The `stripe-profitability` Edge Function calculates comprehensive client metrics:

- **Total Revenue**: Sum of all successful payments
- **Stripe Fees**: Calculated fees (2.9% + $0.30 per transaction)
- **Total Refunds**: Sum of all refunds issued to the client
- **Net Profit**: Revenue - Fees - Refunds
- **Transaction Count**: Number of successful payments
- **Refund Count**: Number of refunds processed

Results are sorted by net profit (highest first) to prioritize the most profitable clients.

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

3. Update environment variables for production

4. Configure Supabase for production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint:check`
5. Add tests if applicable
6. Submit a pull request

## License

This project is licensed under the MIT License.