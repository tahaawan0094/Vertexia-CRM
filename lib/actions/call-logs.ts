'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { CallOutcome } from '@/types/database'

const callLogSchema = z.object({
  lead_id: z.string().uuid(),
  call_outcome: z.enum([
    'no_answer',
    'gatekeeper_blocked',
    'spoke_to_owner',
    'callback_requested',
    'not_interested',
    'interested',
    'converted',
  ]),
  notes: z.string().optional().nullable(),
})

export type CallLogFormData = z.infer<typeof callLogSchema>

export async function createCallLog(formData: CallLogFormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const validated = callLogSchema.parse(formData)

  const { error } = await supabase.from('call_logs').insert({
    ...validated,
    called_by: user.id,
  })

  if (error) throw new Error(error.message)

  // Auto-update lead status based on outcome
  if (
    validated.call_outcome === 'interested' ||
    validated.call_outcome === 'callback_requested' ||
    validated.call_outcome === 'spoke_to_owner'
  ) {
    await supabase
      .from('leads')
      .update({ status: 'follow_up' })
      .eq('id', validated.lead_id)
      .eq('status', 'new') // only auto-advance from 'new'
  } else if (validated.call_outcome === 'converted') {
    await supabase
      .from('leads')
      .update({ status: 'won' })
      .eq('id', validated.lead_id)
  } else if (
    (validated.call_outcome === 'no_answer' ||
      validated.call_outcome === 'gatekeeper_blocked') &&
    true
  ) {
    // If lead is still 'new', move to 'contacted'
    await supabase
      .from('leads')
      .update({ status: 'contacted' })
      .eq('id', validated.lead_id)
      .eq('status', 'new')
  }

  revalidatePath(`/leads/${validated.lead_id}`)
  revalidatePath('/leads')
  revalidatePath('/')
}
