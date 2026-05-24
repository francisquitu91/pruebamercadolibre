import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

const SB_URL = Deno.env.get("SB_URL")
const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")
const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")

if (!SB_URL || !SB_SERVICE_ROLE_KEY || !MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error("Missing required environment variables")
}

const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY)

interface WebhookPayload {
  id: string
  type: string
  action: string
  data: {
    id: string
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body: WebhookPayload = await req.json()

    // Only handle payment webhooks
    if (body.type !== "payment") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const paymentId = body.data.id

    // Verify payment with Mercado Pago API
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    )

    if (!mpResponse.ok) {
      console.error("Failed to verify payment with Mercado Pago")
      return new Response(
        JSON.stringify({ error: "Failed to verify payment" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const paymentData = await mpResponse.json()

    // Determine order status based on payment status
    let orderStatus = "pending"
    if (paymentData.status === "approved") {
      orderStatus = "approved"
    } else if (paymentData.status === "rejected") {
      orderStatus = "rejected"
    } else if (paymentData.status === "cancelled") {
      orderStatus = "cancelled"
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("mercadopago_payment_id", paymentData.external_reference)

    if (updateError) {
      console.error("Error updating order:", updateError)
      return new Response(
        JSON.stringify({ error: "Failed to update order" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Update product stock if payment approved
    if (orderStatus === "approved") {
      // Get order items
      const { data: order, error: orderFetchError } = await supabase
        .from("orders")
        .select("id")
        .eq("mercadopago_payment_id", paymentData.external_reference)
        .single()

      if (!orderFetchError && order) {
        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select("product_id, quantity")
          .eq("order_id", order.id)

        if (!itemsError && orderItems) {
          // Decrease stock for each product
          for (const item of orderItems) {
            await supabase.rpc("decrease_stock", {
              product_id: item.product_id,
              quantity: item.quantity,
            }).catch((err) => {
              console.error(`Error decreasing stock for ${item.product_id}:`, err)
              // Continue even if one product fails
            })
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Unexpected error in webhook handler:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }
})
