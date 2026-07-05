'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const clientUpdateSchema = z.object({
  plan: z.string().optional().nullable(),
  contract_start_date: z.string().optional().nullable(),
  website_status: z.string().optional().nullable(),
  payment_notes: z.string().optional().nullable(),
})

export type ClientUpdateData = z.infer<typeof clientUpdateSchema>

export async function updateClient(id: string, data: ClientUpdateData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const validated = clientUpdateSchema.parse(data)

  const { error } = await supabase
    .from('clients')
    .update(validated)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath(`/clients/${id}`)
  revalidatePath('/clients')
}
