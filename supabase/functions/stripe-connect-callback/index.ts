import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured in Edge Function environment')
    }

    // Exchange authorization code for access token
    console.log('Exchanging authorization code for access token...')
    
    const tokenResponse = await fetch('https://connect.stripe.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${stripeSecretKey}`,
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
      country: accountData.country,
      charges_enabled: accountData.charges_enabled,
      payouts_enabled: accountData.payouts_enabled
    })

    // TODO: Store the connected account information in your database
    // You would typically save this to a user_stripe_accounts table
    /*
    const { data, error: dbError } = await supabase
      .from('user_stripe_accounts')
      .upsert({
        user_id: userId, // You'll need to get this from the state parameter or session
        stripe_user_id: tokenData.stripe_user_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        account_id: accountData.id,
        account_email: accountData.email,
        account_country: accountData.country,
        charges_enabled: accountData.charges_enabled,
        payouts_enabled: accountData.payouts_enabled,
        scope: tokenData.scope,
        connected_at: new Date().toISOString(),
      })
    
    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save account connection')
    }
    */

    // For now, we'll just log the successful connection
    console.log('Stripe Connect successful! Account connected:', {
      stripe_user_id: tokenData.stripe_user_id,
      account_id: accountData.id,
      email: accountData.email,
      charges_enabled: accountData.charges_enabled,
      payouts_enabled: accountData.payouts_enabled
    })

    // Redirect back to the app with success
    const redirectUrl = new URL(`${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/settings`)
    redirectUrl.searchParams.set('stripe_connected', 'true')
    redirectUrl.searchParams.set('stripe_account_id', accountData.id)
    redirectUrl.searchParams.set('stripe_email', accountData.email || '')
    
    return Response.redirect(redirectUrl.toString(), 302)

  } catch (error) {
    console.error('Stripe Connect callback error:', error)
    
    // Redirect back to app with error
    const redirectUrl = new URL(`${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/settings`)
    redirectUrl.searchParams.set('stripe_error', 'callback_failed')
    redirectUrl.searchParams.set('stripe_error_description', error.message)
    
    return Response.redirect(redirectUrl.toString(), 302)
  }
})