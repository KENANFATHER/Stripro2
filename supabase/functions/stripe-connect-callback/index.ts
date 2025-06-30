import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Environment variable names for better error messages
const REQUIRED_ENV_VARS = {
  STRIPE_SECRET_KEY: 'STRIPE_SECRET_KEY',
  SUPABASE_URL: 'SUPABASE_URL',
  SERVICE_ROLE_KEY: 'SERVICE_ROLE_KEY',
  FRONTEND_URL: 'FRONTEND_URL',
}

// Configure function to be publicly accessible (no JWT verification)
export const config = { auth: false }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check for required environment variables
    const missingEnvVars = []
    
    if (!Deno.env.get(REQUIRED_ENV_VARS.FRONTEND_URL)) {
      missingEnvVars.push(REQUIRED_ENV_VARS.FRONTEND_URL)
    }
    
    if (!Deno.env.get(REQUIRED_ENV_VARS.SUPABASE_URL)) {
      missingEnvVars.push(REQUIRED_ENV_VARS.SUPABASE_URL)
    }
    
    if (!Deno.env.get(REQUIRED_ENV_VARS.SERVICE_ROLE_KEY)) {
      missingEnvVars.push(REQUIRED_ENV_VARS.SERVICE_ROLE_KEY)
    }
    
    if (!Deno.env.get(REQUIRED_ENV_VARS.STRIPE_SECRET_KEY)) {
      missingEnvVars.push(REQUIRED_ENV_VARS.STRIPE_SECRET_KEY)
    }
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}. Please set these in your Supabase project.`)
    }

    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')
    const errorDescription = url.searchParams.get('error_description')

    console.log('Stripe Connect callback received:', { code: !!code, state, error, errorDescription })

    // Handle OAuth errors from Stripe
    if (error) {
      console.error('Stripe OAuth error:', error, errorDescription)
      
      // Redirect back to app with error
      const redirectUrl = new URL(`${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/settings`)
      redirectUrl.searchParams.set('stripe_error', error)
      redirectUrl.searchParams.set('stripe_error_description', errorDescription || 'Unknown error')
      
      return Response.redirect(redirectUrl.toString(), 302)
    }

    // Validate required parameters
    if (!code) {
      throw new Error('Missing authorization code from Stripe')
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get(REQUIRED_ENV_VARS.STRIPE_SECRET_KEY)!

    // Exchange authorization code for access token
    console.log('Exchanging authorization code for access token...')
    
    const tokenResponse = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_secret: stripeSecretKey,
        code: code,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Stripe token exchange failed:', errorData)
      throw new Error(`Failed to exchange authorization code: ${errorData}`)
    }

    const tokenData = await tokenResponse.json()
    console.log('Token exchange successful:', { 
      stripe_user_id: tokenData.stripe_user_id,
      scope: tokenData.scope 
    })

    // Get connected account details
    const accountResponse = await fetch(`https://api.stripe.com/v1/accounts/${tokenData.stripe_user_id}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })

    if (!accountResponse.ok) {
      const errorData = await accountResponse.text()
      console.error('Failed to fetch account details:', errorData)
      throw new Error(`Failed to fetch account details: ${errorData}`)
    }

    const accountData = await accountResponse.json()
    console.log('Account details fetched:', {
      id: accountData.id,
      email: accountData.email,
      country: accountData.country || 'unknown',
      charges_enabled: accountData.charges_enabled || false,
      payouts_enabled: accountData.payouts_enabled || false
    })

    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get(REQUIRED_ENV_VARS.SUPABASE_URL)!,
      Deno.env.get(REQUIRED_ENV_VARS.SERVICE_ROLE_KEY)!
    )

    // Extract user_id from the state parameter
    const userId = state?.split('_')[1]

    if (!userId) {
      throw new Error('User ID not found in state parameter. Cannot update user metadata.')
    }

    // Update user_metadata in Supabase auth.users table
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          stripe_connected: true,
          stripe_account_id: accountData.id,
          stripe_email: accountData.email,
          stripe_country: accountData.country,
          stripe_charges_enabled: accountData.charges_enabled,
          stripe_payouts_enabled: accountData.payouts_enabled,
          stripe_connected_at: new Date().toISOString(),
        },
      }
    )

    if (updateError) {
      console.error('Failed to update user metadata in Supabase:', updateError)
      throw new Error('Failed to update user connection status in database')
    }
    console.log('User metadata updated in Supabase:', updateData)

    // Redirect back to the app with success
    const frontendUrl = Deno.env.get(REQUIRED_ENV_VARS.FRONTEND_URL) || 'http://localhost:5173'
    const redirectUrl = new URL(`${frontendUrl}/settings`)
    redirectUrl.searchParams.set('stripe_connected', 'true')
    redirectUrl.searchParams.set('stripe_account_id', accountData.id)
    
    return Response.redirect(redirectUrl.toString(), 302)

  } catch (error) {
    console.error('Stripe Connect callback error:', error)
    
    // Redirect back to app with error
    const frontendUrl = Deno.env.get(REQUIRED_ENV_VARS.FRONTEND_URL) || 'http://localhost:5173'
    const redirectUrl = new URL(`${frontendUrl}/settings`)
    redirectUrl.searchParams.set('stripe_error', 'callback_failed')
    redirectUrl.searchParams.set('stripe_error_description', error.message)
    
    return Response.redirect(redirectUrl.toString(), 302)
  }
})