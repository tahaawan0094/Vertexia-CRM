import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowLeft, Edit, Globe, Phone, MapPin, User,
  Building2, Tag, Calendar, XCircle,
} from 'lucide-react'
import {
  getStatusLabel, getWebsiteStatusLabel, formatDate, formatRelativeTime,
} from '@/lib/utils'
import CallTimeline from '@/components/leads/CallTimeline'
import CallLogForm from '@/components/leads/CallLogForm'
import ScriptsPanel from '@/components/leads/ScriptsPanel'
import WhatsAppButton from '@/components/leads/WhatsAppButton'
import MarkWonModal from '@/components/leads/MarkWonModal'
import MarkLostButton from '@/components/leads/MarkLostButton'
import type { CallLog, Script } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('business_name').eq('id', id).single()
  return { title: data?.business_name ?? 'Lead Detail' }
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch lead
  const { data: lead, error } = await supabase
    .from('leads_with_call_info')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !lead) notFound()

  // Fetch call logs
  const { data: callLogs } = await supabase
    .from('call_logs')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })

  // Fetch scripts
  const { data: scripts } = await supabase
    .from('scripts')
    .select('*')
    .eq('lead_id', id)
    .order('version', { ascending: false })

  // Check if client exists
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('lead_id', id)
    .maybeSingle()

  const statusColors: Record<string, string> = {
    new: 'status-new', contacted: 'status-contacted',
    follow_up: 'status-follow_up', won: 'status-won', lost: 'status-lost',
  }

  const sourceLabels: Record<string, string> = {
    cold_call: 'Cold Call', referral: 'Referral', social: 'Social Media', other: 'Other',
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Back + Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          href="/leads"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--foreground-muted)', textDecoration: 'none', fontSize: '0.8rem', marginBottom: '0.75rem' }}
        >
          <ArrowLeft size={14} /> Back to Leads
        </Link>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>{lead.business_name}</h1>
              <span className={`badge ${statusColors[lead.status] ?? ''}`}>{getStatusLabel(lead.status)}</span>
              {(lead.call_count ?? 0) > 0 && (
                <span className="call-count-badge" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                  📞 {lead.call_count} {lead.call_count === 1 ? 'call' : 'calls'}
                </span>
              )}
            </div>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              {lead.industry} · {lead.city}
              {lead.last_call_at && (
                <> · Last call {formatRelativeTime(lead.last_call_at)}</>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {lead.whatsapp_number && (
              <WhatsAppButton phone={lead.whatsapp_number} businessName={lead.business_name} size="sm" />
            )}
            <Link href={`/leads/${id}/edit`} className="btn btn-secondary btn-sm">
              <Edit size={13} /> Edit
            </Link>
            {lead.status !== 'won' && lead.status !== 'lost' && (
              <MarkWonModal leadId={id} businessName={lead.business_name} />
            )}
            {lead.status !== 'lost' && lead.status !== 'won' && (
              <MarkLostButton leadId={id} />
            )}
            {lead.status === 'won' && client && (
              <Link href={`/clients/${client.id}`} className="btn btn-success btn-sm">
                View Client Record →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Call Scripts */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <ScriptsPanel leadId={id} initialScripts={(scripts ?? []) as Script[]} />
          </div>

          {/* Call History */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: '600' }}>
              Call History
            </h3>
            <CallTimeline callLogs={(callLogs ?? []) as CallLog[]} />
          </div>

          {/* Log a Call */}
          {lead.status !== 'won' && lead.status !== 'lost' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: '600' }}>
                Log a Call
              </h3>
              <CallLogForm leadId={id} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Business Info */}
          <div className="card" style={{ padding: '1.125rem' }}>
            <div style={{
              fontSize: '0.72rem', fontWeight: '600', color: 'var(--foreground-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem',
            }}>
              Business Info
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <InfoRow icon={<Phone size={13} />} label="Phone" value={lead.phone} />
              {lead.whatsapp_number && (
                <InfoRow icon={<Phone size={13} />} label="WhatsApp" value={lead.whatsapp_number} />
              )}
              <InfoRow icon={<MapPin size={13} />} label="City" value={lead.city} />
              <InfoRow icon={<Building2 size={13} />} label="Industry" value={lead.industry} />
              <InfoRow icon={<Globe size={13} />} label="Website" value={getWebsiteStatusLabel(lead.current_website_status)} />
              {lead.contact_person && (
                <InfoRow icon={<User size={13} />} label="Contact" value={`${lead.contact_person} (${lead.contact_role})`} />
              )}
              <InfoRow icon={<Tag size={13} />} label="Source" value={sourceLabels[lead.source] ?? lead.source} />
              <InfoRow icon={<Calendar size={13} />} label="Added" value={formatDate(lead.created_at)} />
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="card" style={{ padding: '1.125rem' }}>
              <div style={{
                fontSize: '0.72rem', fontWeight: '600', color: 'var(--foreground-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem',
              }}>
                Notes
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                {lead.notes}
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="card" style={{ padding: '1.125rem' }}>
            <div style={{
              fontSize: '0.72rem', fontWeight: '600', color: 'var(--foreground-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem',
            }}>
              Quick Stats
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <MiniStat label="Total Calls" value={lead.call_count ?? 0} color="#3b82f6" />
              <MiniStat label="Scripts" value={(scripts ?? []).length > 0 ? Math.max(...(scripts ?? []).map((s: any) => s.version)) : 0} color="#8b5cf6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
      <span style={{ color: 'var(--foreground-subtle)', marginTop: '1px', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '0.68rem', color: 'var(--foreground-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: '0.825rem', color: 'var(--foreground)' }}>{value}</div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: '1.25rem', fontWeight: '700', color }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: 'var(--foreground-muted)' }}>{label}</div>
    </div>
  )
}
