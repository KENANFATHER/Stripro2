/*
  # Create Stripe Tables for Webhook Data Storage

  1. New Tables
    - `stripe_customers`
      - `stripe_customer_id` (text, primary key)
      - `email` (text)
      - `name` (text)
      - `metadata` (jsonb, default empty object)
      - `livemode` (boolean, indicates test vs live data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stripe_payments`
      - `stripe_payment_intent_id` (text, primary key)
      - `stripe_customer_id` (text, foreign key to stripe_customers)
      - `amount` (integer, amount in cents)
      - `currency` (text)
      - `status` (text)
      - `charge_id` (text)
      - `application_fee_amount` (integer, in cents)
      - `amount_received` (integer, in cents)
      - `calculated_stripe_fee` (integer, calculated fee in cents)
      - `livemode` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stripe_refunds`
      - `stripe_refund_id` (text, primary key)
      - `stripe_charge_id` (text, references the charge being refunded)
      - `amount` (integer, refund amount in cents)
      - `currency` (text)
      - `status` (text)
      - `reason` (text)
      - `livemode` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for service_role to manage data (webhooks)
    - Add policies for authenticated users to read data

  3. Indexes
    - Add performance indexes on commonly queried columns
    - Foreign key indexes for joins
    - Status indexes for filtering

  4. Triggers
    - Auto-update timestamps on record changes
*/

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  stripe_customer_id TEXT PRIMARY KEY UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  livemode BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create stripe_payments table
CREATE TABLE IF NOT EXISTS public.stripe_payments (
  stripe_payment_intent_id TEXT PRIMARY KEY UNIQUE NOT NULL,
  stripe_customer_id TEXT REFERENCES public.stripe_customers(stripe_customer_id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  charge_id TEXT,
  application_fee_amount INTEGER,
  amount_received INTEGER,
  calculated_stripe_fee INTEGER,
  livemode BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create stripe_refunds table
CREATE TABLE IF NOT EXISTS public.stripe_refunds (
  stripe_refund_id TEXT PRIMARY KEY UNIQUE NOT NULL,
  stripe_charge_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  livemode BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_email ON public.stripe_customers(email);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_livemode ON public.stripe_customers(livemode);

CREATE INDEX IF NOT EXISTS idx_stripe_payments_customer_id ON public.stripe_payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON public.stripe_payments(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_livemode ON public.stripe_payments(livemode);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_charge_id ON public.stripe_payments(charge_id);

CREATE INDEX IF NOT EXISTS idx_stripe_refunds_charge_id ON public.stripe_refunds(stripe_charge_id);
CREATE INDEX IF NOT EXISTS idx_stripe_refunds_status ON public.stripe_refunds(status);
CREATE INDEX IF NOT EXISTS idx_stripe_refunds_livemode ON public.stripe_refunds(livemode);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stripe_customers
-- Allow service_role to insert and update (used by webhook)
CREATE POLICY "Service role can manage stripe_customers"
  ON public.stripe_customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to select (read) all customers (assuming data is aggregated or filtered at app level)
CREATE POLICY "Authenticated users can view all stripe_customers"
  ON public.stripe_customers
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for stripe_payments
-- Allow service_role to insert and update (used by webhook)
CREATE POLICY "Service role can manage stripe_payments"
  ON public.stripe_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to select (read) all payments (assuming data is aggregated or filtered at app level)
CREATE POLICY "Authenticated users can view all stripe_payments"
  ON public.stripe_payments
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for stripe_refunds
-- Allow service_role to insert and update (used by webhook)
CREATE POLICY "Service role can manage stripe_refunds"
  ON public.stripe_refunds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to select (read) all refunds (assuming data is aggregated or filtered at app level)
CREATE POLICY "Authenticated users can view all stripe_refunds"
  ON public.stripe_refunds
  FOR SELECT
  TO authenticated
  USING (true);

-- Create triggers to update updated_at timestamp for stripe_customers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_stripe_customers_updated_at'
  ) THEN
    CREATE TRIGGER update_stripe_customers_updated_at
      BEFORE UPDATE ON public.stripe_customers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create triggers to update updated_at timestamp for stripe_payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_stripe_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_stripe_payments_updated_at
      BEFORE UPDATE ON public.stripe_payments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create triggers to update updated_at timestamp for stripe_refunds
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_stripe_refunds_updated_at'
  ) THEN
    CREATE TRIGGER update_stripe_refunds_updated_at
      BEFORE UPDATE ON public.stripe_refunds
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create a view for easy profitability calculations
CREATE OR REPLACE VIEW public.client_profitability AS
SELECT 
  c.stripe_customer_id as client_id,
  c.name as client_name,
  c.email as client_email,
  COALESCE(SUM(p.amount), 0) / 100.0 as total_revenue,
  COALESCE(SUM(p.calculated_stripe_fee), 0) / 100.0 as total_stripe_fees,
  (COALESCE(SUM(p.amount), 0) - COALESCE(SUM(p.calculated_stripe_fee), 0)) / 100.0 as net_profit,
  COUNT(p.stripe_payment_intent_id) as transaction_count,
  MAX(p.created_at) as last_transaction_date,
  CASE 
    WHEN COUNT(p.stripe_payment_intent_id) > 0 THEN 'active'
    ELSE 'inactive'
  END as status
FROM public.stripe_customers c
LEFT JOIN public.stripe_payments p ON c.stripe_customer_id = p.stripe_customer_id 
  AND p.status = 'succeeded'
GROUP BY c.stripe_customer_id, c.name, c.email
ORDER BY total_revenue DESC;

-- Grant access to the view
GRANT SELECT ON public.client_profitability TO authenticated;
GRANT SELECT ON public.client_profitability TO service_role;