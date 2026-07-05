'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { LeadStatus } from '@/types/database'
import { z } from 'zod'

const leadSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  industry: z.string().min(1, 'Industry is required'),
  city: z.string().min(1, 'City is required'),
  phone: z.string().min(1, 'Phone is required'),
  whatsapp_number: z.string().optional().nullable(),
  contact_person: z.string().optional().nullable(),
  contact_role: z.enum(['owner', 'manager', 'staff', 'unknown']),
  current_website_status: z.enum(['none', 'outdated', 'has_website']),
  source: z.enum(['cold_call', 'referral', 'social', 'other']),
  status: z.enum(['new', 'contacted', 'follow_up', 'won', 'lost']),
  notes: z.string().optional().nullable(),
})

export type LeadFormData = z.infer<typeof leadSchema>

export async function createLead(formData: LeadFormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const validated = leadSchema.parse(formData)

  const { data, error } = await supabase
    .from('leads')
    .insert({ ...validated, assigned_to: user.id })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/leads')
  redirect(`/leads/${data.id}`)
}

export async function updateLead(id: string, formData: Partial<LeadFormData>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('leads')
    .update(formData)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/leads/${id}`)
  revalidatePath('/leads')
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/leads/${id}`)
  revalidatePath('/leads')
  revalidatePath('/')
}

export async function deleteLead(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('leads').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/leads')
  redirect('/leads')
}

export async function markLeadAsWon(leadId: string, clientData: {
  plan?: string
  contract_start_date?: string
  payment_notes?: string
}) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single()

  if (leadError || !lead) throw new Error('Lead not found')

  // Update lead status
  const { error: updateError } = await supabase
    .from('leads')
    .update({ status: 'won' })
    .eq('id', leadId)

  if (updateError) throw new Error(updateError.message)

  // Check if client record already exists
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('lead_id', leadId)
    .single()

  if (!existingClient) {
    // Create client record
    const { error: clientError } = await adminClient.from('clients').insert({
      lead_id: leadId,
      business_name: lead.business_name,
      contact_person: lead.contact_person,
      phone: lead.phone,
      whatsapp_number: lead.whatsapp_number,
      plan: clientData.plan || null,
      contract_start_date: clientData.contract_start_date || null,
      website_status: 'in_progress',
      payment_notes: clientData.payment_notes || null,
    })

    if (clientError) throw new Error(clientError.message)
  }

  revalidatePath(`/leads/${leadId}`)
  revalidatePath('/leads')
  revalidatePath('/clients')
  revalidatePath('/')
}
