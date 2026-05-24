import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

const SB_URL = Deno.env.get("SB_URL")
const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")
const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")

if (!SB_URL || !SB_SERVICE_ROLE_KEY || !MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("Missing required environment variables")
}

const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY)

interface CartItem {
  product_id: string
  quantity: number
}

interface PayerData {
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
}

interface CreatePaymentRequest {
  items: CartItem[]
  payer: PayerData
}

interface ProductData {
  id: string
  name: string
  price: number
  stock: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }

    let body: CreatePaymentRequest
    try {
      body = await req.json()
    } catch (e) {
      console.error("Error parsing request body:", e)
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    }

    console.log("Received payment request:", JSON.stringify(body))

    // Validate request
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or empty items list" }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      )
    }

    // Validate payer data
    if (!body.payer || !body.payer.email || !body.payer.firstName || !body.payer.lastName) {
      return new Response(
        JSON.stringify({ error: "Missing payer information" }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      )
    }

    // Fetch all products from database
    const productIds = body.items.map((item) => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock")
      .in("id", productIds)

    if (productsError || !products) {
      console.error("Error fetching products:", productsError)
      return new Response(
        JSON.stringify({ error: "Failed to fetch products" }),
        { 
          status: 500, 
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      )
    }

    // Validate stock and calculate total
    let total = 0
    const items = []

    for (const cartItem of body.items) {
      const product = products.find((p) => p.id === cartItem.product_id)

      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product ${cartItem.product_id} not found` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      }

      if (cartItem.quantity > product.stock) {
        return new Response(
          JSON.stringify({
            error: `Insufficient stock for ${product.name}`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        )
      }

      const itemTotal = product.price * cartItem.quantity
      total += itemTotal

      items.push({
        title: product.name,
        quantity: cartItem.quantity,
        unit_price: Math.round(product.price * 100), // En centavos como entero
        currency_id: "ARS", // Adjust to your currency
      })
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        total: Math.round(total * 100) / 100,
        status: "pending",
        user_id: null, // Can be set to auth.uid() if using authentication
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error("Error creating order:", orderError)
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { 
          status: 500, 
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      )
    }

    // Create order items
    const orderItems = body.items.map((cartItem) => ({
      order_id: order.id,
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
      price: products.find((p) => p.id === cartItem.product_id)!.price,
    }))

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        { 
          status: 500, 
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      )
    }

    // Create Mercado Pago preference
    const preference = {
      items: items,
      payer: {
        email: body.payer.email,
        first_name: body.payer.firstName,
        last_name: body.payer.lastName,
        phone: {
          number: body.payer.phone,
        },
        identification: {
          type: body.payer.documentType,
          number: body.payer.documentNumber,
        },
      },
      back_urls: {
        success: `${req.headers.get("origin")}/success?order_id=${order.id}`,
        failure: `${req.headers.get("origin")}/success?order_id=${order.id}`,
        pending: `${req.headers.get("origin")}/success?order_id=${order.id}`,
      },
      notification_url: `${SB_URL}/functions/v1/mercadopago-webhook`,
      external_reference: order.id,
      binary_mode: true,
    }

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    })

    if (!mpResponse.ok) {
      const error = await mpResponse.text()
      console.error("Mercado Pago error:", error)
      return new Response(
        JSON.stringify({ error: "Failed to create payment preference" }),
        { 
          status: 500, 
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          }
        }
      )
    }

    const mpData = await mpResponse.json()

    // Update order with Mercado Pago preference ID
    await supabase
      .from("orders")
      .update({ mercadopago_payment_id: mpData.id })
      .eq("id", order.id)

    return new Response(
      JSON.stringify({
        order_id: order.id,
        preference_id: mpData.id,
        init_point: mpData.init_point,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        },
      }
    )
  } catch (error) {
    console.error("Unexpected error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        },
      }
    )
  }
})
