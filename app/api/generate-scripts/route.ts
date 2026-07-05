import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateScripts } from '@/lib/ai/provider'
import type { Lead } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { lead_id } = body as { lead_id: string }

    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 })
    }

    // Fetch lead details
    const adminClient = createAdminClient()
    const { data: lead, error: leadError } = await adminClient
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const leadData = lead as Lead

    const leadContext = {
      business_name: leadData.business_name,
      industry: leadData.industry,
      city: leadData.city,
      current_website_status: leadData.current_website_status,
      contact_role: leadData.contact_role,
      notes: leadData.notes,
    }

    // Generate scripts via AI
    const scripts = await generateScripts(leadContext)

    // Get current max version for this lead
    const { data: existingScripts } = await adminClient
      .from('scripts')
      .select('version')
      .eq('lead_id', lead_id)
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existingScripts && existingScripts.length > 0
      ? (existingScripts[0].version || 0) + 1
      : 1

    const modelUsed = `${process.env.AI_PROVIDER || 'gemini'}/${process.env.AI_MODEL || 'gemini-1.5-flash'}`

    // Save both scripts to DB
    const { error: insertError } = await adminClient.from('scripts').insert([
      {
        lead_id,
        script_type: 'gatekeeper',
        content: scripts.gatekeeper_script,
        business_context_used: leadContext,
        model_used: modelUsed,
        version: nextVersion,
      },
      {
        lead_id,
        script_type: 'owner',
        content: scripts.owner_script,
        business_context_used: leadContext,
        model_used: modelUsed,
        version: nextVersion,
      },
    ])

    if (insertError) {
      console.error('Error saving scripts:', insertError)
      return NextResponse.json(
        { error: 'Failed to save scripts to database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      version: nextVersion,
      gatekeeper_script: scripts.gatekeeper_script,
      owner_script: scripts.owner_script,
    })
  } catch (err) {
    console.error('Script generation error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
