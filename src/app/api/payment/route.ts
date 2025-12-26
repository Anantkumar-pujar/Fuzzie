import { NextResponse, NextRequest } from 'next/server'
import Stripe from 'stripe'

export async function GET(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    typescript: true,
    apiVersion: '2023-10-16',
  })

  const products = await stripe.prices.list({
    limit: 3, // Fetch more to ensure we get all products
    active: true,
  })

  // Get only one price per product (the default/lowest for each nickname)
  const priceMap = new Map()
  
  for (const price of products.data) {
    const nickname = price.nickname || 'Unknown'
    const existing = priceMap.get(nickname)
    
    // Keep the price with lowest amount for each nickname (or first if same)
    if (!existing || (price.unit_amount || 0) < (existing.unit_amount || 0)) {
      priceMap.set(nickname, price)
    }
  }

  // Get Free, Pro, Unlimited in order
  const orderedPrices = [
    priceMap.get('Free'),
    priceMap.get('Pro'),
    priceMap.get('Unlimited'),
  ].filter(Boolean) // Remove any undefined entries

  return NextResponse.json(orderedPrices)
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    typescript: true,
    apiVersion: '2023-10-16',
  })
  const data = await req.json()
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: data.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url:
      'https://localhost:3000/billing?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://localhost:3000/billing',
  })
  return NextResponse.json(session.url)
}
