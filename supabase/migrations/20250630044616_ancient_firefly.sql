/*
  # Add Stripe Disconnect Events Support

  1. New Features
    - Add support for tracking Stripe disconnection events
    - Add GDPR data deletion request functionality
    - Add security event cleanup for compliance

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Add audit trail for disconnection events
*/

-- Ensure security_events table exists and has proper structure
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'security_events'
  ) THEN
    CREATE TABLE public.security_events (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      ip_address INET,
      user_agent TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    -- Enable RLS
    ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view own security events" ON public.security_events
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "System can insert security events" ON public.security_events
      FOR INSERT WITH CHECK (true);

    -- Grant permissions
    GRANT SELECT ON public.security_events TO authenticated;
    GRANT INSERT ON public.security_events TO service_role;
  END IF;
END $$;

-- Add indexes for security_events if they don't exist
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);

-- Create a function to clean up old security events (GDPR compliance)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete security events older than 2 years (GDPR retention period)
  DELETE FROM public.security_events 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  -- Log the cleanup
  INSERT INTO public.security_events (event_type, metadata)
  VALUES ('system_cleanup', jsonb_build_object(
    'action', 'security_events_cleanup',
    'timestamp', NOW()
  ));
END;
$$;

-- Create a view for Stripe disconnect events
CREATE OR REPLACE VIEW public.stripe_disconnect_events AS
SELECT 
  id,
  user_id,
  event_type,
  metadata,
  created_at
FROM public.security_events
WHERE event_type = 'stripe_disconnected'
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.stripe_disconnect_events TO authenticated;
GRANT SELECT ON public.stripe_disconnect_events TO service_role;

-- Create a function to handle GDPR data deletion requests
CREATE OR REPLACE FUNCTION public.request_gdpr_deletion(
  target_user_id UUID,
  deletion_reason TEXT DEFAULT 'user_request'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id TEXT;
  completion_date TIMESTAMPTZ;
BEGIN
  -- Generate unique request ID
  request_id := 'gdpr_' || target_user_id || '_' || extract(epoch from now())::bigint;
  completion_date := NOW() + INTERVAL '30 days';
  
  -- Log the GDPR deletion request
  INSERT INTO public.security_events (user_id, event_type, metadata)
  VALUES (
    target_user_id,
    'gdpr_deletion_request',
    jsonb_build_object(
      'request_id', request_id,
      'reason', deletion_reason,
      'estimated_completion', completion_date,
      'status', 'pending'
    )
  );
  
  -- Return request details
  RETURN jsonb_build_object(
    'request_id', request_id,
    'estimated_completion_date', completion_date,
    'message', 'GDPR deletion request submitted successfully'
  );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.request_gdpr_deletion(UUID, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.security_events IS 'Stores security-related events for audit and compliance purposes';
COMMENT ON FUNCTION public.cleanup_old_security_events() IS 'Cleans up security events older than 2 years for GDPR compliance';
COMMENT ON FUNCTION public.request_gdpr_deletion(UUID, TEXT) IS 'Handles GDPR data deletion requests with proper logging';
COMMENT ON VIEW public.stripe_disconnect_events IS 'View of Stripe disconnection events for monitoring and compliance';