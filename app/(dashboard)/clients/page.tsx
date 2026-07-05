import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserCheck, ExternalLink, MessageCircle } from 'lucide-react'
import { formatDate, buildWhatsAppUrl, buildWhatsAppMessage } from '@/lib/utils'
import type { Client } from '@/types/database'

export const metadata: Metadata = { title: 'Clients' }

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  const websiteStatusColors: Record<string, string> = {
    in_progress: 'bg-blue-500/20 text-blue-300',
    live: 'bg-green-500/20 text-green-300',
    on_hold: 'bg-orange-500/20 text-orange-300',
    cancelled: 'bg-red-500/20 text-red-300',
  }

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Clients</h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {clients?.length ?? 0} active client{(clients?.length ?? 1) !== 1 ? 's' : ''}
        </p>
      </div>

      {error ? (
        <div style={{ padding: '1rem', color: '#f87171', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius)' }}>
          Error: {error.message}
        </div>
      ) : !clients || clients.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <UserCheck size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>No clients yet</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
            Mark a lead as "Won" to convert them into a client.
          </p>
          <Link href="/leads" className="btn btn-primary btn-sm">View Leads</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {(clients as Client[]).map(client => {
            const waUrl = client.whatsapp_number
              ? buildWhatsAppUrl(client.whatsapp_number, buildWhatsAppMessage(client.business_name))
              : null

            return (
              <div
                key={client.id}
                className="card card-hover"
                style={{ padding: '1.25rem' }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div>
                    <Link
                      href={`/clients/${client.id}`}
                      style={{ textDecoration: 'none', color: 'var(--foreground)', fontWeight: '600', fontSize: '0.95rem' }}
                    >
                      {client.business_name}
                    </Link>
                    {client.contact_person && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--foreground-muted)', marginTop: '2px' }}>
                        {client.contact_person}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: '600', padding: '2px 8px',
                    borderRadius: '4px', textTransform: 'uppercase',
                    background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                    border: '1px solid rgba(34,197,94,0.3)',
                  }}>
                    Client
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.875rem' }}>
                  {client.plan && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
                      📦 {client.plan}
                    </div>
                  )}
                  {client.contract_start_date && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
                      📅 Started {formatDate(client.contract_start_date)}
                    </div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
                    📞 {client.phone}
                  </div>
                  {client.website_status && (
                    <div style={{ fontSize: '0.78rem', fontWeight: '500',
                      color: client.website_status === 'live' ? '#4ade80' : client.website_status === 'in_progress' ? '#93c5fd' : '#fb923c' }}>
                      🌐 Website: {client.website_status.replace('_', ' ')}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <Link href={`/clients/${client.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <ExternalLink size={12} /> View
                  </Link>
                  {waUrl && (
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm" title="Open WhatsApp">
                      <MessageCircle size={12} />
                    </a>
                  )}
                  {client.lead_id && (
                    <Link href={`/leads/${client.lead_id}`} className="btn btn-secondary btn-sm" title="View original lead">
                      Lead →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
