import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Configure function to be publicly accessible (no JWT verification)
export const config = { auth: false }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    console.log('Stripe disconnect request received')

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured in Edge Function environment')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing in Edge Function environment')
    }

    // Parse request body
    const { userId, stripeAccountId, reason } = await req.json()

    if (!userId || !stripeAccountId) {
      throw new Error('Missing required parameters: userId and stripeAccountId')
    }

    console.log('Processing disconnect request:', { userId, stripeAccountId, reason })

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Deauthorize the Stripe account (if Connect client ID is available)
    let deauthorizationSuccess = false
    let deauthorizationMessage = 'Stripe deauthorization skipped (no Connect client ID)'

    const connectClientId = Deno.env.get('STRIPE_CONNECT_CLIENT_ID')
    if (connectClientId) {
      try {
        console.log('Attempting Stripe OAuth deauthorization...')
        
        const deauthorizeResponse = await fetch('https://connect.stripe.com/oauth/deauthorize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: connectClientId,
            stripe_user_id: stripeAccountId,
          }),
        })

        if (deauthorizeResponse.ok) {
          const deauthorizeData = await deauthorizeResponse.json()
          console.log('Stripe deauthorization successful:', deauthorizeData)
          deauthorizationSuccess = true
          deauthorizationMessage = 'Stripe account successfully deauthorized'
        } else {
          const errorData = await deauthorizeResponse.text()
          console.warn('Stripe deauthorization failed:', errorData)
          
          // Check if already disconnected
          if (deauthorizeResponse.status === 404 || errorData.includes('already_disconnected')) {
            deauthorizationSuccess = true
            deauthorizationMessage = 'Stripe account was already disconnected'
          } else {
            deauthorizationMessage = `Stripe deauthorization failed: ${errorData}`
          }
        }
      } catch (error) {
        console.error('Stripe deauthorization error:', error)
        deauthorizationMessage = `Stripe deauthorization error: ${error.message}`
      }
    }

    // 2. Update user metadata in Supabase to remove Stripe connection
    console.log('Updating user metadata in Supabase...')
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          stripe_connected: false,
          stripe_account_id: null,
          stripe_email: null,
          stripe_country: null,
          stripe_charges_enabled: null,
          stripe_payouts_enabled: null,
          stripe_connected_at: null,
          stripe_disconnected_at: new Date().toISOString(),
          stripe_disconnect_reason: reason || 'user_request',
        },
      }
    )

    if (updateError) {
      console.error('Failed to update user metadata:', updateError)
      throw new Error('Failed to update user connection status in database')
    }

    console.log('User metadata updated successfully:', updateData)

    // 3. Log the disconnection event in security_events table
    const { error: logError } = await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: 'stripe_disconnected',
        metadata: {
          stripe_account_id: stripeAccountId,
          deauthorization_success: deauthorizationSuccess,
          deauthorization_message: deauthorizationMessage,
          reason: reason || 'user_request',
          timestamp: new Date().toISOString()
        }
      })

    if (logError) {
      console.warn('Failed to log security event:', logError)
      // Don't fail the entire operation for logging issues
    }

    // 4. TODO: In production, you might want to:
    // - Remove or anonymize Stripe-related data from your database
    // - Send confirmation email to user
    // - Notify relevant team members
    // - Update any analytics or reporting systems

    console.log('Stripe disconnect process completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stripe account disconnected successfully',
        deauthorizationSuccess,
        deauthorizationMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Stripe disconnect error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Check the Edge Function logs for more information',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})