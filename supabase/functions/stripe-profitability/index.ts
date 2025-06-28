import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

interface ClientProfitability {
  id: string
  name: string
  email: string
  totalRevenue: number
  stripeFees: number
  netProfit: number
  transactionCount: number
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

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured. Please add STRIPE_SECRET_KEY to your Edge Function environment variables.')
    }

    console.log('Fetching customers from Stripe...')

    // Fetch customers from Stripe
    const customersResponse = await fetch('https://api.stripe.com/v1/customers?limit=100', {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    })

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
    
    const chargesResponse = await fetch('https://api.stripe.com/v1/charges?limit=100', {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    })

    if (!chargesResponse.ok) {
      const errorData = await chargesResponse.text()
      console.error('Failed to fetch charges:', errorData)
      throw new Error(`Failed to fetch charges: ${errorData}`)
    }

    const chargesData = await chargesResponse.json()
    const charges: StripeCharge[] = chargesData.data || []
    
    console.log(`Found ${charges.length} charges`)

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

    console.log(`Processing profitability for ${chargesByCustomer.size} customers with charges`)

    // Calculate profitability for each customer
    for (const customer of customers) {
      const customerCharges = chargesByCustomer.get(customer.id) || []
      
      if (customerCharges.length === 0) {
        // Include customers with no charges for completeness
        clientProfitability.push({
          id: customer.id,
          name: customer.name || customer.email?.split('@')[0] || 'Unknown Customer',
          email: customer.email || 'no-email@example.com',
          totalRevenue: 0,
          stripeFees: 0,
          netProfit: 0,
          transactionCount: 0,
          lastTransaction: new Date(customer.created * 1000).toISOString().split('T')[0],
          status: 'inactive'
        })
        continue
      }

      // Calculate totals for this customer
      let totalRevenue = 0
      let totalFees = 0
      let lastTransactionDate = 0

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

      const netProfit = totalRevenue - totalFees

      clientProfitability.push({
        id: customer.id,
        name: customer.name || customer.email?.split('@')[0] || 'Unknown Customer',
        email: customer.email || 'no-email@example.com',
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
        stripeFees: Math.round(totalFees * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        transactionCount: customerCharges.length,
        lastTransaction: new Date(lastTransactionDate * 1000).toISOString().split('T')[0],
        status: customerCharges.length > 0 ? 'active' : 'inactive'
      })
    }

    // Sort by total revenue (highest first)
    clientProfitability.sort((a, b) => b.totalRevenue - a.totalRevenue)

    console.log(`Profitability calculation complete. Processed ${clientProfitability.length} clients`)
    console.log('Sample results:', clientProfitability.slice(0, 3))

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
        details: 'Check the Edge Function logs for more information'
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