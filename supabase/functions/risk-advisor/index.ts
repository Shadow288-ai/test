import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, portfolioData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhanced system prompt for risk management advisor
    const systemPrompt = `You are an expert portfolio risk management advisor. Your role is to provide clear, actionable insights about portfolio risk and diversification strategies.

Portfolio Context:
- Total Value: $${portfolioData.totalValue?.toLocaleString() || 'N/A'}
- Holdings: ${portfolioData.holdingsCount || 0} positions
- Risk Score: ${portfolioData.riskScore || 0}/100
- Average Volatility: ${portfolioData.avgVolatility?.toFixed(1) || 'N/A'}%
- Top Sector: ${portfolioData.topSector || 'N/A'} (${portfolioData.sectorConcentration?.toFixed(1) || 'N/A'}% concentration)
- Top Region: ${portfolioData.topRegion || 'N/A'} (${portfolioData.regionConcentration?.toFixed(1) || 'N/A'}% concentration)

Your advice should:
1. Be specific to the user's portfolio metrics
2. Explain risk factors in simple terms
3. Provide actionable steps to improve diversification
4. Consider both sector and geographic diversification
5. Balance risk management with growth potential
6. Use clear, concise language without jargon

When discussing risk scores:
- 0-30: Low Risk - Well-diversified with stable holdings
- 31-60: Moderate Risk - Some concentration but manageable
- 61-100: High Risk - Significant concentration requiring attention`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Risk advisor error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
