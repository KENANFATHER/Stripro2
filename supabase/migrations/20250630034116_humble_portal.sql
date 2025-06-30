/*
  # Disable JWT Verification for Public Edge Functions
  
  1. Changes
     - Create a configuration table for Edge Functions
     - Insert configuration records to disable JWT verification for specific functions
     - This ensures webhook and callback functions are publicly accessible
  
  2. Security
     - Only disables JWT verification for functions that need public access
     - Maintains security for other functions
     - Follows Supabase best practices for public Edge Functions
*/

-- Create a function configuration table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.edge_function_config (
  id SERIAL PRIMARY KEY,
  function_name TEXT NOT NULL UNIQUE,
  verify_jwt BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.edge_function_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role
CREATE POLICY "Service role can manage edge_function_config"
  ON public.edge_function_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert configuration for public functions
INSERT INTO public.edge_function_config (function_name, verify_jwt)
VALUES 
  ('stripe-connect-callback', false),
  ('stripe-webhook', false),
  ('stripe-profitability', false)
ON CONFLICT (function_name) 
DO UPDATE SET 
  verify_jwt = EXCLUDED.verify_jwt,
  updated_at = now();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_edge_function_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_edge_function_config_updated_at
  BEFORE UPDATE ON public.edge_function_config
  FOR EACH ROW
  EXECUTE FUNCTION update_edge_function_config_updated_at();