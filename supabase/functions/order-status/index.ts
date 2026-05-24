import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

const SB_URL = Deno.env.get("SB_URL")
const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")

if (!SB_URL || !SB_SERVICE_ROLE_KEY) {
  throw new Error("Missing required environment variables")
}

const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY)

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  }

  try {
    // Only allow GET
    if (req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Parse order_id from query params
    const url = new URL(req.url)
    const orderId = url.searchParams.get("order_id")

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing order_id parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Fetch order status
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order:", orderError)
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({ status: order.status }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
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
        },
      }
    )
  }
})
