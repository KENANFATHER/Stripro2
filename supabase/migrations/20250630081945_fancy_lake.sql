/*
  # Create Stripe Tables for Webhook Data

  1. New Tables
    - `stripe_customers`
      - `stripe_customer_id` (text, primary key)
      - `email` (text)
      - `name` (text)
      - `metadata` (jsonb)
      - `livemode` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stripe_payments`
      - `stripe_payment_intent_id` (text, primary key)
      - `stripe_customer_id` (text, foreign key)
      - `amount` (integer, in cents)
      - `currency` (text)
      - `status` (text)
      - `charge_id` (text)
      - `application_fee_amount` (integer)
      - `amount_received` (integer)
      - `calculated_stripe_fee` (integer)
      - `livemode` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `stripe_refunds`
      - `stripe_refund_id` (text, primary key)
      - `stripe_charge_id` (text)
      - `amount` (integer, in cents)
      - `currency` (text)
      - `status` (text)
      - `reason` (text)
      - `livemode` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for service_role (webhooks) and authenticated users
    - Create profitability view for easy calculations

  3. Performance
    - Add indexes on commonly queried columns
    - Create triggers for automatic timestamp updates
*/

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  stripe_customer_id TEXT PRIMARY KEY NOT NULL,
  email TEXT,
  name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  livemode BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create stripe_payments table
CREATE TABLE IF NOT EXISTS public.stripe_payments (
  stripe_payment_intent_id TEXT PRIMARY KEY NOT NULL,
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
  stripe_refund_id TEXT PRIMARY KEY NOT NULL,
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

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  -- Drop stripe_customers policies
  DROP POLICY IF EXISTS "Service role can manage stripe_customers" ON public.stripe_customers;
  DROP POLICY IF EXISTS "Authenticated users can view all stripe_customers" ON public.stripe_customers;
  
  -- Drop stripe_payments policies
  DROP POLICY IF EXISTS "Service role can manage stripe_payments" ON public.stripe_payments;
  DROP POLICY IF EXISTS "Authenticated users can view all stripe_payments" ON public.stripe_payments;
  
  -- Drop stripe_refunds policies
  DROP POLICY IF EXISTS "Service role can manage stripe_refunds" ON public.stripe_refunds;
  DROP POLICY IF EXISTS "Authenticated users can view all stripe_refunds" ON public.stripe_refunds;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if policies don't exist
    NULL;
END $$;

-- Create RLS Policies for stripe_customers
CREATE POLICY "Service role can manage stripe_customers"
  ON public.stripe_customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all stripe_customers"
  ON public.stripe_customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS Policies for stripe_payments
CREATE POLICY "Service role can manage stripe_payments"
  ON public.stripe_payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all stripe_payments"
  ON public.stripe_payments
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS Policies for stripe_refunds
CREATE POLICY "Service role can manage stripe_refunds"
  ON public.stripe_refunds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all stripe_refunds"
  ON public.stripe_refunds
  FOR SELECT
  TO authenticated
  USING (true);

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update updated_at timestamp
DO $$
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS update_stripe_customers_updated_at ON public.stripe_customers;
  DROP TRIGGER IF EXISTS update_stripe_payments_updated_at ON public.stripe_payments;
  DROP TRIGGER IF EXISTS update_stripe_refunds_updated_at ON public.stripe_refunds;
  
  -- Create triggers for stripe_customers
  CREATE TRIGGER update_stripe_customers_updated_at
    BEFORE UPDATE ON public.stripe_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    
  -- Create triggers for stripe_payments
  CREATE TRIGGER update_stripe_payments_updated_at
    BEFORE UPDATE ON public.stripe_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    
  -- Create triggers for stripe_refunds
  CREATE TRIGGER update_stripe_refunds_updated_at
    BEFORE UPDATE ON public.stripe_refunds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but continue
    RAISE NOTICE 'Error creating triggers: %', SQLERRM;
END $$;

-- Create or replace the profitability view
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