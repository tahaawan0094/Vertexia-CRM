import type { GenerateScriptsResponse } from '@/types/database'

export interface LeadContext {
  business_name: string
  industry: string
  city: string
  current_website_status: string
  contact_role: string
  notes: string | null
}

// Provider abstraction — swap AI_PROVIDER env var to switch
export async function generateScripts(
  leadContext: LeadContext
): Promise<GenerateScriptsResponse> {
  const provider = process.env.AI_PROVIDER || 'gemini'

  switch (provider) {
    case 'gemini':
      return generateWithGemini(leadContext)
    case 'openrouter':
      return generateWithOpenRouter(leadContext)
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}

function buildPrompt(ctx: LeadContext): string {
  const websiteContext =
    ctx.current_website_status === 'none'
      ? "They currently have NO website at all."
      : ctx.current_website_status === 'outdated'
      ? "They have an outdated website that needs modernization."
      : "They already have a website but may want an upgrade."

  return `You are a sales script writer for Vertexia, a web development agency based in Karachi, Pakistan.

Vertexia's offer:
- Custom small-business websites built in 7 days
- Starting at Rs. 22,000 (includes domain, hosting, and business email)
- Done-for-you service (not a DIY builder)
- 30-day money-back guarantee
- Based in Karachi, serving local Pakistani businesses

Lead details:
- Business: ${ctx.business_name}
- Industry: ${ctx.industry}
- City: ${ctx.city}
- Website situation: ${websiteContext}
- Contact role: ${ctx.contact_role}
- Notes: ${ctx.notes || 'None'}

Write TWO scripts for a cold phone call in Urdu/English (Romanized if needed, but mostly English is fine for business calls in Karachi):

1. GATEKEEPER SCRIPT: For when a receptionist or staff member answers first.
   - Short, polite, non-pushy (max 80 words)
   - Goal: get transferred to the owner/decision-maker
   - Do NOT reveal it's a sales call outright — say you're calling about "their online presence" or "a quick business proposal"
   - Sound natural and professional, mention Vertexia by name
   - Must NOT be manipulative or deceptive about who is calling

2. OWNER/DECISION-MAKER SCRIPT: For when you reach the owner/manager.
   - Opening line (hook them in 1 sentence)
   - 2-3 sentence pitch mentioning their specific industry pain points (e.g. losing customers to competitors online, no booking system, no professional email)
   - One differentiator vs DIY builders (Wix/Shopify) AND vs expensive agencies
   - Handle ONE common objection (price or "I already have a website")
   - Clear call-to-action (book a 15-min call or send WhatsApp details)
   - Conversational, spoken-language tone — this is a live phone call, NOT an email
   - Max 150 words total

CRITICAL OUTPUT INSTRUCTIONS:
- Return ONLY a valid JSON object.
- Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`.
- Inside the JSON string values, NEVER use literal double quotes ("). If you need to quote something inside the script, use single quotes (') instead.
- NEVER include literal line breaks or newlines inside the JSON text values. Keep each script on a single continuous line.

Return exactly this structure:
{
  "gatekeeper_script": "...",
  "owner_script": "..."
}`
}

// Helper function to safely clean and parse AI JSON responses
function safeParseJson(rawText: string): any {
  // Remove any accidental markdown wrapping (```json or ```)
  const cleaned = rawText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
  
  return JSON.parse(cleaned);
}

async function generateWithGemini(
  ctx: LeadContext
): Promise<GenerateScriptsResponse> {
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL || 'gemini-flash-latest'

  if (!apiKey) throw new Error('AI_API_KEY is not set')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(ctx) }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048, // Increased tokens to avoid premature truncation
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) throw new Error('Empty response from Gemini')

  try {
    const parsed = safeParseJson(text)
    if (!parsed.gatekeeper_script || !parsed.owner_script) {
      throw new Error('Invalid response structure from Gemini')
    }
    return parsed as GenerateScriptsResponse
  } catch (parseError) {
    console.error("Failed to parse Gemini response directly. Raw text:", text)
    throw new Error(`AI generated an invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Syntax Error'}`)
  }
}

async function generateWithOpenRouter(
  ctx: LeadContext
): Promise<GenerateScriptsResponse> {
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL || 'google/gemini-2.0-flash-001'

  if (!apiKey) throw new Error('AI_API_KEY is not set')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://vertexia-crm.vercel.app',
      'X-Title': 'Vertexia CRM',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: buildPrompt(ctx) }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OpenRouter API error ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content

  if (!text) throw new Error('Empty response from OpenRouter')

  try {
    const parsed = safeParseJson(text)
    if (!parsed.gatekeeper_script || !parsed.owner_script) {
      throw new Error('Invalid response structure from OpenRouter')
    }
    return parsed as GenerateScriptsResponse
  } catch (parseError) {
    console.error("Failed to parse OpenRouter response directly. Raw text:", text)
    throw new Error(`AI generated an invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Syntax Error'}`)
  }
}