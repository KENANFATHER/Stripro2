import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests for webhook events
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    console.log('Stripe webhook received')

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured in Edge Function environment')
    }

    if (!stripeWebhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured in Edge Function environment')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing in Edge Function environment')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the raw body and signature for webhook verification
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('Missing Stripe signature header')
    }

    console.log('Verifying webhook signature...')

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(`Webhook signature verification failed: ${err.message}`, {
        status: 400,
        headers: corsHeaders
      })
    }

    console.log(`Processing webhook event: ${event.type}`)

    // Process different event types
    switch (event.type) {
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerEvent(event, supabase)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event, supabase)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event, supabase)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    console.log(`Successfully processed webhook event: ${event.type}`)

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the Edge Function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

/**
 * Handle customer.created and customer.updated events
 */
async function handleCustomerEvent(event: Stripe.Event, supabase: any) {
  const customer = event.data.object as Stripe.Customer

  console.log(`Processing customer event for: ${customer.id}`)

  const customerData = {
    stripe_customer_id: customer.id,
    email: customer.email,
    name: customer.name,
    metadata: customer.metadata || {},
    livemode: customer.livemode,
    updated_at: new Date().toISOString()
  }

  // Upsert customer data (insert or update if exists)
  const { error } = await supabase
    .from('stripe_customers')
    .upsert(customerData, {
      onConflict: 'stripe_customer_id'
    })

  if (error) {
    console.error('Error upserting customer:', error)
    throw new Error(`Failed to upsert customer: ${error.message}`)
  }

  console.log(`Successfully processed customer: ${customer.id}`)
}

/**
 * Handle payment_intent.succeeded events
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event, supabase: any) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  console.log(`Processing payment intent: ${paymentIntent.id}`)

  // Calculate Stripe fees (approximate calculation)
  // Standard rate: 2.9% + $0.30 for most cards
  const amount = paymentIntent.amount
  const calculatedStripeFee = Math.round((amount * 0.029) + 30) // in cents

  const paymentData = {
    stripe_payment_intent_id: paymentIntent.id,
    stripe_customer_id: paymentIntent.customer as string || null,
    amount: amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
    charge_id: paymentIntent.latest_charge as string || null,
    application_fee_amount: paymentIntent.application_fee_amount,
    amount_received: paymentIntent.amount_received,
    calculated_stripe_fee: calculatedStripeFee,
    livemode: paymentIntent.livemode,
    updated_at: new Date().toISOString()
  }

  // Upsert payment data
  const { error } = await supabase
    .from('stripe_payments')
    .upsert(paymentData, {
      onConflict: 'stripe_payment_intent_id'
    })

  if (error) {
    console.error('Error upserting payment:', error)
    throw new Error(`Failed to upsert payment: ${error.message}`)
  }

  console.log(`Successfully processed payment intent: ${paymentIntent.id}`)
}

/**
 * Handle charge.refunded events
 */
async function handleChargeRefunded(event: Stripe.Event, supabase: any) {
  const charge = event.data.object as Stripe.Charge

  console.log(`Processing refunded charge: ${charge.id}`)

  // Process each refund for this charge
  if (charge.refunds && charge.refunds.data) {
    for (const refund of charge.refunds.data) {
      const refundData = {
        stripe_refund_id: refund.id,
        stripe_charge_id: charge.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        livemode: refund.livemode,
        updated_at: new Date().toISOString()
      }

      // Upsert refund data
      const { error } = await supabase
        .from('stripe_refunds')
        .upsert(refundData, {
          onConflict: 'stripe_refund_id'
        })

      if (error) {
        console.error('Error upserting refund:', error)
        throw new Error(`Failed to upsert refund: ${error.message}`)
      }

      console.log(`Successfully processed refund: ${refund.id}`)
    }
  }

  // Update the payment status if it was fully refunded
  if (charge.amount_refunded === charge.amount) {
    const { error: updateError } = await supabase
      .from('stripe_payments')
      .update({ 
        status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('charge_id', charge.id)

    if (updateError) {
      console.error('Error updating payment status to refunded:', updateError)
      // Don't throw here as the refund was still processed successfully
    }
  }
}