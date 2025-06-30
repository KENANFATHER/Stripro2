import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Configure function to be publicly accessible (no JWT verification)
export const config = { auth: false }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StripeCustomer {
  id: string
  email: string
  name?: string
  created: number
}

interface StripeCharge {
  id: string
  amount: number
  currency: string
  customer: string | null
  created: number
  status: string
  application_fee_amount?: number
}

interface StripeRefund {
  id: string
  amount: number
  currency: string
  charge: string
  created: number
  status: string
}

interface ClientProfitability {
  id: string
  name: string
  email: string
  totalRevenue: number
  stripeFees: number
  totalRefunds: number
  netProfit: number
  transactionCount: number
  refundCount: number
  lastTransaction: string
  status: 'active' | 'inactive'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Stripe profitability calculation started...')
    
    // Check for Stripe account ID in headers (for Stripe Connect)
    const stripeAccountId = req.headers.get('X-Stripe-Account')
    if (stripeAccountId) {
      console.log(`Using connected Stripe account: ${stripeAccountId}`)
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured in Edge Function environment')
    }

    console.log('Fetching customers from Stripe...')

    // Fetch customers from Stripe
    const customersHeaders: Record<string, string> = {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      }
    }
    
    // Add Stripe-Account header for connected accounts
    if (stripeAccountId) {
      customersHeaders.headers['Stripe-Account'] = stripeAccountId
    }
    
    const customersResponse = await fetch('https://api.stripe.com/v1/customers?limit=100', customersHeaders)

    if (!customersResponse.ok) {
      const errorData = await customersResponse.text()
      console.error('Failed to fetch customers:', errorData)
      throw new Error(`Failed to fetch customers: ${errorData}`)
    }

    const customersData = await customersResponse.json()
    const customers: StripeCustomer[] = customersData.data || []
    
    console.log(`Found ${customers.length} customers`)

    // Fetch charges from Stripe
    console.log('Fetching charges from Stripe...')
    
    const chargesHeaders: Record<string, string> = {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      }
    }
    
    // Add Stripe-Account header for connected accounts
    if (stripeAccountId) {
      chargesHeaders.headers['Stripe-Account'] = stripeAccountId
    }
    
    const chargesResponse = await fetch('https://api.stripe.com/v1/charges?limit=100', chargesHeaders)

    if (!chargesResponse.ok) {
      const errorData = await chargesResponse.text()
      console.error('Failed to fetch charges:', errorData)
      throw new Error(`Failed to fetch charges: ${errorData}`)
    }

    const chargesData = await chargesResponse.json()
    const charges: StripeCharge[] = chargesData.data || []
    
    console.log(`Found ${charges.length} charges`)

    // Fetch refunds from Stripe
    console.log('Fetching refunds from Stripe...')
    
    const refundsHeaders: Record<string, string> = {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      }
    }
    
    // Add Stripe-Account header for connected accounts
    if (stripeAccountId) {
      refundsHeaders.headers['Stripe-Account'] = stripeAccountId
    }
    
    const refundsResponse = await fetch('https://api.stripe.com/v1/refunds?limit=100', refundsHeaders)

    if (!refundsResponse.ok) {
      const errorData = await refundsResponse.text()
      console.error('Failed to fetch refunds:', errorData)
      throw new Error(`Failed to fetch refunds: ${errorData}`)
    }

    const refundsData = await refundsResponse.json()
    const refunds: StripeRefund[] = refundsData.data || []
    
    console.log(`Found ${refunds.length} refunds`)

    // Calculate profitability for each customer
    const clientProfitability: ClientProfitability[] = []

    // Group charges by customer
    const chargesByCustomer = new Map<string, StripeCharge[]>()
    
    for (const charge of charges) {
      if (charge.customer && charge.status === 'succeeded') {
        if (!chargesByCustomer.has(charge.customer)) {
          chargesByCustomer.set(charge.customer, [])
        }
        chargesByCustomer.get(charge.customer)!.push(charge)
      }
    }

    // Group refunds by charge ID, then map to customers
    const refundsByCharge = new Map<string, StripeRefund[]>()
    
    for (const refund of refunds) {
      if (refund.status === 'succeeded') {
        if (!refundsByCharge.has(refund.charge)) {
          refundsByCharge.set(refund.charge, [])
        }
        refundsByCharge.get(refund.charge)!.push(refund)
      }
    }

    // Map refunds to customers by looking up charge -> customer relationship
    const refundsByCustomer = new Map<string, StripeRefund[]>()
    
    for (const charge of charges) {
      if (charge.customer && refundsByCharge.has(charge.id)) {
        const chargeRefunds = refundsByCharge.get(charge.id)!
        if (!refundsByCustomer.has(charge.customer)) {
          refundsByCustomer.set(charge.customer, [])
        }
        refundsByCustomer.get(charge.customer)!.push(...chargeRefunds)
      }
    }

    console.log(`Processing profitability for ${chargesByCustomer.size} customers with charges`)
    console.log(`Found refunds for ${refundsByCustomer.size} customers`)

    // Calculate profitability for each customer
    for (const customer of customers) {
      const customerCharges = chargesByCustomer.get(customer.id) || []
      const customerRefunds = refundsByCustomer.get(customer.id) || []
      
      if (customerCharges.length === 0) {
        // Include customers with no charges for completeness
        clientProfitability.push({
          id: customer.id,
          name: customer.name || customer.email?.split('@')[0] || 'Unknown Customer',
          email: customer.email || 'no-email@example.com',
          totalRevenue: 0,
          stripeFees: 0,
          totalRefunds: 0,
          netProfit: 0,
          transactionCount: 0,
          refundCount: 0,
          lastTransaction: new Date(customer.created * 1000).toISOString().split('T')[0],
          status: 'inactive'
        })
        continue
      }

      // Calculate totals for this customer
      let totalRevenue = 0
      let totalFees = 0
      let totalRefunds = 0
      let lastTransactionDate = 0

      // Process charges
      for (const charge of customerCharges) {
        // Convert from cents to dollars
        const amount = charge.amount / 100
        totalRevenue += amount

        // Calculate Stripe fees (2.9% + $0.30 for most cards)
        const stripeFee = (amount * 0.029) + 0.30
        totalFees += stripeFee

        // Track latest transaction
        if (charge.created > lastTransactionDate) {
          lastTransactionDate = charge.created
        }
      }

      // Process refunds
      for (const refund of customerRefunds) {
        // Convert from cents to dollars
        const refundAmount = refund.amount / 100
        totalRefunds += refundAmount
      }

      // Calculate net profit: Revenue - Fees - Refunds
      const netProfit = totalRevenue - totalFees - totalRefunds

      clientProfitability.push({
        id: customer.id,
        name: customer.name || customer.email?.split('@')[0] || 'Unknown Customer',
        email: customer.email || 'no-email@example.com',
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        stripeFees: Math.round(totalFees * 100) / 100,
        totalRefunds: Math.round(totalRefunds * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        transactionCount: customerCharges.length,
        refundCount: customerRefunds.length,
        lastTransaction: new Date(lastTransactionDate * 1000).toISOString().split('T')[0],
        status: customerCharges.length > 0 ? 'active' : 'inactive'
      })
    }

    // Sort by net profit (highest first) to show most profitable clients at the top
    clientProfitability.sort((a, b) => b.netProfit - a.netProfit)

    console.log(`Profitability calculation complete. Processed ${clientProfitability.length} clients`)
    console.log('Sample results:', clientProfitability.slice(0, 3).map(client => ({
      name: client.name,
      totalRevenue: client.totalRevenue,
      stripeFees: client.stripeFees,
      totalRefunds: client.totalRefunds,
      netProfit: client.netProfit,
      transactionCount: client.transactionCount,
      refundCount: client.refundCount
    })))

    return new Response(
      JSON.stringify(clientProfitability),
      {
        headers: {
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )

  } catch (error) {
    console.error('Stripe profitability calculation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check the Edge Function logs for more information',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})