import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist_name } = await req.json();

    if (!artist_name || typeof artist_name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'artist_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert on DJs and electronic music artists worldwide.
Given an artist name (possibly misspelled from a lineup poster), provide accurate information.

Respond ONLY with a JSON object in this exact format:
{
  "stage_name": "Correctly spelled/capitalized stage name",
  "genre": "Primary electronic music genre (e.g., Techno, House, Trance, Drum & Bass, Dubstep, EDM, Progressive House, Tech House, Deep House, Hardstyle, etc.)",
  "home_city": "City they're most associated with, or null if unknown",
  "confidence": "high" | "medium" | "low"
}

Rules:
- Preserve well-known stylizations (e.g., deadmau5, RÜFÜS DU SOL, ZHU)
- For genre, use the most specific common genre label
- If the artist is not primarily electronic/DJ, still classify their closest genre
- Set confidence to "low" if you're unsure about the artist
- Always respond with valid JSON only`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Provide information about this DJ/artist: "${artist_name}"` },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to enrich artist' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let enriched;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      enriched = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({
          stage_name: artist_name,
          genre: 'EDM',
          home_city: null,
          confidence: 'low',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        stage_name: enriched.stage_name || artist_name,
        genre: enriched.genre || 'EDM',
        home_city: enriched.home_city || null,
        confidence: enriched.confidence || 'low',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enrich-artist:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
