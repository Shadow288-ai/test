// @ts-nocheck
// supabase/functions/fetch-stock-data/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Preflight for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null) as
      | { ticker?: string; type?: "current" | "historical" }
      | null;

    const ticker = body?.ticker;
    const type = body?.type;

    if (!ticker || !type) {
      return new Response(
        JSON.stringify({ error: "Missing 'ticker' or 'type' in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = Deno.env.get("STOCK_DATA_API_KEY");
    if (!apiKey) {
      console.error("[fetch-stock-data] STOCK_DATA_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Server misconfigured: API key missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[fetch-stock-data] Fetching ${type} data for: ${ticker}`);

    if (type === "current") {
      // --- CURRENT PRICE -----------------------------------------------------
      const url =
        `https://api.stockdata.org/v1/data/quote?symbols=${encodeURIComponent(
          ticker
        )}&api_token=${apiKey}`;

      const resp = await fetch(url);
      if (!resp.ok) {
        console.error(
          "[fetch-stock-data] StockData current error:",
          resp.status,
          resp.statusText,
        );
        return new Response(
          JSON.stringify({
            error: `Failed to fetch current price: ${resp.status} ${resp.statusText}`,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const json = await resp.json();
      console.log("[fetch-stock-data] current response:", json);

      const price = json?.data?.[0]?.price;
      if (typeof price !== "number") {
        return new Response(
          JSON.stringify({ error: "No price data available" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ price }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (type === "historical") {
      // --- HISTORICAL DATA (last 30 days) -----------------------------------
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);

      const formatDate = (d: Date) => d.toISOString().split("T")[0];

      const url =
        `https://api.stockdata.org/v1/data/eod?symbols=${encodeURIComponent(
          ticker
        )}&date_from=${formatDate(fromDate)}&date_to=${formatDate(
          toDate
        )}&sort=asc&api_token=${apiKey}`;

      const resp = await fetch(url);
      if (!resp.ok) {
        console.error(
          "[fetch-stock-data] StockData historical error:",
          resp.status,
          resp.statusText,
        );
        return new Response(
          JSON.stringify({
            error: `Failed to fetch historical data: ${resp.status} ${resp.statusText}`,
          }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const json = await resp.json();
      console.log("[fetch-stock-data] historical response:", json);

      const rows = json?.data;
      if (!Array.isArray(rows) || rows.length === 0) {
        return new Response(
          JSON.stringify({ error: "No historical data available" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const historicalData = rows.map((item: any) => ({
        date: (item.date as string).split("T")[0],
        price: item.close,
      }));

      return new Response(
        JSON.stringify({ data: historicalData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid 'type' – must be 'current' or 'historical'" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[fetch-stock-data] Unhandled error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
