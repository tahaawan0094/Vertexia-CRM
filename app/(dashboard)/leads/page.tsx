import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import LeadTable from '@/components/leads/LeadTable'
import type { LeadStatus } from '@/types/database'

export const metadata: Metadata = { title: 'Leads' }

interface Props {
  searchParams: Promise<{ status?: string; search?: string; industry?: string }>
}

export default async function LeadsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('leads_with_call_info')
    .select('*')
    .order('updated_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  if (params.industry) {
    query = query.ilike('industry', `%${params.industry}%`)
  }
  if (params.search) {
    query = query.or(
      `business_name.ilike.%${params.search}%,phone.ilike.%${params.search}%,contact_person.ilike.%${params.search}%`
    )
  }

  const { data: leads, error } = await query

  const statuses: { value: string; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
  ]

  const activeStatus = params.status ?? 'all'

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Leads</h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {leads?.length ?? 0} lead{(leads?.length ?? 0) !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link href="/leads/new" className="btn btn-primary">
          <Plus size={15} />
          Add Lead
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
      }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '3px', border: '1px solid var(--border)' }}>
          {statuses.map(s => (
            <Link
              key={s.value}
              href={s.value === 'all' ? '/leads' : `/leads?status=${s.value}`}
              style={{
                padding: '0.25rem 0.625rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: '500',
                textDecoration: 'none',
                color: activeStatus === s.value ? 'white' : 'var(--foreground-muted)',
                background: activeStatus === s.value ? 'var(--accent)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form method="GET" action="/leads" style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '360px' }}>
          {params.status && <input type="hidden" name="status" value={params.status} />}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '0.625rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--foreground-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              name="search"
              className="form-input"
              placeholder="Search business, phone, contact..."
              defaultValue={params.search ?? ''}
              style={{ paddingLeft: '2rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Go</button>
        </form>
      </div>

      {/* Table */}
      {error ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#f87171',
          background: 'rgba(239,68,68,0.1)',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(239,68,68,0.2)',
        }}>
          Error loading leads: {error.message}
        </div>
      ) : (
        <LeadTable leads={leads ?? []} />
      )}
    </div>
  )
}
