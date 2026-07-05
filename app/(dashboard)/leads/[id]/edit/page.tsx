import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import LeadForm from '@/components/leads/LeadForm'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Edit Lead' }

export default async function EditLeadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) notFound()

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          href={`/leads/${id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--foreground-muted)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.75rem' }}
        >
          <ArrowLeft size={14} /> Back to Lead
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Edit Lead</h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Editing: <strong style={{ color: 'var(--foreground)' }}>{lead.business_name}</strong>
        </p>
      </div>
      <LeadForm mode="edit" lead={lead as any} />
    </div>
  )
}
