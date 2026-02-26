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
    const { image_base64, text_lineup } = await req.json();

    if (!image_base64 && !text_lineup) {
      return new Response(
        JSON.stringify({ error: 'Either image_base64 or text_lineup is required' }),
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

    const systemPrompt = `You are an expert at reading music festival lineups.
Given either a festival lineup poster image or a text list of artists, extract every artist/DJ name.

Rules:
- Return ONLY a JSON object: { "artists": ["Artist 1", "Artist 2", ...] }
- Include every artist/act name you can identify
- Normalize capitalization to title case (e.g., "DEADMAU5" -> "deadmau5", "SKRILLEX" -> "Skrillex")
- Keep well-known stylizations (e.g., "deadmau5", "RÜFÜS DU SOL", "ZHU")
- Remove "b2b" pairings into separate artists (e.g., "A b2b B" -> ["A", "B"])
- Remove set times, stage names, day labels, and non-artist text
- Sort headliners first, then alphabetically
- Always respond with valid JSON only, no additional text`;

    let messages: Array<{ role: string; content: unknown }>;

    if (image_base64) {
      // Vision-based extraction
      messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${image_base64}` },
            },
            {
              type: 'text',
              text: 'Extract all artist/DJ names from this festival lineup poster.',
            },
          ],
        },
      ];
    } else {
      // Text-based extraction
      messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Extract all artist/DJ names from this festival lineup text:\n\n${text_lineup}`,
        },
      ];
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
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
        JSON.stringify({ error: 'Failed to parse lineup' }),
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

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse lineup results', raw_response: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const artists = Array.isArray(parsed.artists) ? parsed.artists : [];

    return new Response(
      JSON.stringify({ artists }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parse-festival-lineup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
