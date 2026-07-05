import Link from 'next/link'
import {
  Phone,
  MessageCircle,
  Eye,
  PhoneCall,
} from 'lucide-react'
import {
  getStatusLabel,
  getOutcomeLabel,
  formatRelativeTime,
  buildWhatsAppUrl,
  buildWhatsAppMessage,
  ordinalSuffix,
} from '@/lib/utils'
import type { LeadWithCallInfo } from '@/types/database'

interface Props {
  leads: LeadWithCallInfo[]
}

const statusColors: Record<string, string> = {
  new: 'status-new',
  contacted: 'status-contacted',
  follow_up: 'status-follow_up',
  won: 'status-won',
  lost: 'status-lost',
}

export default function LeadTable({ leads }: Props) {
  if (leads.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: 'var(--foreground-muted)',
        background: 'var(--surface)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
      }}>
        <Phone size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
        <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>No leads found</p>
        <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Add your first lead to get started.</p>
        <Link href="/leads/new" className="btn btn-primary btn-sm">+ Add Lead</Link>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Business</th>
            <th>Industry</th>
            <th>Contact</th>
            <th>Phone</th>
            <th>Status</th>
            <th style={{ textAlign: 'center' }}>Calls</th>
            <th>Last Activity</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => {
            const waUrl = lead.whatsapp_number
              ? buildWhatsAppUrl(lead.whatsapp_number, buildWhatsAppMessage(lead.business_name))
              : null

            return (
              <tr key={lead.id}>
                <td>
                  <div style={{ fontWeight: '500', color: 'var(--foreground)', fontSize: '0.875rem' }}>
                    {lead.business_name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--foreground-muted)', marginTop: '1px' }}>
                    {lead.city}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
                    {lead.industry}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>
                    {lead.contact_person ?? '—'}
                  </div>
                  {lead.contact_person && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', textTransform: 'capitalize' }}>
                      {lead.contact_role}
                    </div>
                  )}
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--foreground)', fontFamily: 'monospace' }}>
                    {lead.phone}
                  </span>
                </td>
                <td>
                  <span className={`badge ${statusColors[lead.status] ?? ''}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <span className="call-count-badge">{lead.call_count ?? 0}</span>
                    {lead.last_call_outcome && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--foreground-subtle)' }}>
                        {getOutcomeLabel(lead.last_call_outcome)}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
                    {lead.last_call_at
                      ? formatRelativeTime(lead.last_call_at)
                      : lead.updated_at
                      ? formatRelativeTime(lead.updated_at)
                      : '—'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                        title="Open WhatsApp chat (opens app, not an auto-call)"
                      >
                        <MessageCircle size={13} />
                        WA
                      </a>
                    )}
                    <Link
                      href={`/leads/${lead.id}`}
                      className="btn btn-secondary btn-sm"
                      title="View lead"
                    >
                      <Eye size={13} />
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
