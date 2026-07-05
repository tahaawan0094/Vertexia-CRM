import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LeadForm from '@/components/leads/LeadForm'

export const metadata: Metadata = { title: 'Add Lead' }

export default async function NewLeadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Add New Lead</h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Enter the business details for the new lead.
        </p>
      </div>
      <LeadForm mode="create" />
    </div>
  )
}
