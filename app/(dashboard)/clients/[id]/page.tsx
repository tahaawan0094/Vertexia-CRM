import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Phone, MessageCircle, Calendar, Package } from 'lucide-react'
import { formatDate, buildWhatsAppUrl, buildWhatsAppMessage } from '@/lib/utils'
import ClientEditForm from '@/components/clients/ClientEditForm'
import CallTimeline from '@/components/leads/CallTimeline'
import type { Client, CallLog } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('clients').select('business_name').eq('id', id).single()
  return { title: data?.business_name ?? 'Client' }
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !client) notFound()

  // Fetch call logs from original lead if linked
  let callLogs: CallLog[] = []
  if (client.lead_id) {
    const { data: logs } = await supabase
      .from('call_logs')
      .select('*')
      .eq('lead_id', client.lead_id)
      .order('created_at', { ascending: false })
    callLogs = (logs ?? []) as CallLog[]
  }

  const waUrl = client.whatsapp_number
    ? buildWhatsAppUrl(client.whatsapp_number, buildWhatsAppMessage(client.business_name))
    : null

  const statusConfig: Record<string, { label: string; color: string }> = {
    in_progress: { label: 'In Progress', color: '#93c5fd' },
    live: { label: 'Live', color: '#4ade80' },
    on_hold: { label: 'On Hold', color: '#fb923c' },
    cancelled: { label: 'Cancelled', color: '#f87171' },
  }
  const ws = statusConfig[client.website_status ?? 'in_progress'] ?? { label: client.website_status ?? '—', color: '#64748b' }

  return (
    <div className="page-container animate-fade-in">
      {/* Back + Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          href="/clients"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--foreground-muted)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.75rem' }}
        >
          <ArrowLeft size={14} /> Back to Clients
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>{client.business_name}</h1>
              <span style={{
                fontSize: '0.7rem', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                textTransform: 'uppercase', background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                border: '1px solid rgba(34,197,94,0.3)',
              }}>Client</span>
              <span style={{
                fontSize: '0.7rem', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                background: `${ws.color}20`, color: ws.color, border: `1px solid ${ws.color}30`,
              }}>🌐 {ws.label}</span>
            </div>
            {client.contact_person && (
              <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                Contact: {client.contact_person}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                <MessageCircle size={13} /> WhatsApp
              </a>
            )}
            {client.lead_id && (
              <Link href={`/leads/${client.lead_id}`} className="btn btn-secondary btn-sm">
                View Original Lead
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left: Edit form + call history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: '600' }}>Contract Details</h3>
            <ClientEditForm client={client as Client} />
          </div>

          {callLogs.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: '600' }}>
                Pre-Sale Call History
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
                Calls logged before this lead was converted.
              </p>
              <CallTimeline callLogs={callLogs} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.125rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
              Contact Info
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={13} style={{ color: 'var(--foreground-subtle)' }} />
                <span style={{ fontSize: '0.825rem' }}>{client.phone}</span>
              </div>
              {client.whatsapp_number && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageCircle size={13} style={{ color: '#4ade80' }} />
                  <span style={{ fontSize: '0.825rem' }}>{client.whatsapp_number}</span>
                </div>
              )}
              {client.contract_start_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={13} style={{ color: 'var(--foreground-subtle)' }} />
                  <span style={{ fontSize: '0.825rem' }}>Started {formatDate(client.contract_start_date)}</span>
                </div>
              )}
              {client.plan && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={13} style={{ color: 'var(--foreground-subtle)' }} />
                  <span style={{ fontSize: '0.825rem' }}>{client.plan}</span>
                </div>
              )}
            </div>
          </div>

          {client.payment_notes && (
            <div className="card" style={{ padding: '1.125rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>
                Payment Notes
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                {client.payment_notes}
              </p>
            </div>
          )}

          <div className="card" style={{ padding: '1.125rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>
              Record Info
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--foreground-subtle)', margin: 0 }}>
              Client since {formatDate(client.created_at)}
            </p>
            {callLogs.length > 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--foreground-subtle)', margin: '0.25rem 0 0' }}>
                {callLogs.length} pre-sale call{callLogs.length !== 1 ? 's' : ''} on record
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
