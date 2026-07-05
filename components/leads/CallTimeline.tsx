import { Phone, PhoneOff, PhoneCall, PhoneMissed, PhoneIncoming } from 'lucide-react'
import { formatDateTime, getOutcomeColor, getOutcomeLabel, ordinalSuffix } from '@/lib/utils'
import type { CallLog, CallOutcome } from '@/types/database'

interface Props {
  callLogs: CallLog[]
}

function OutcomeIcon({ outcome }: { outcome: CallOutcome }) {
  const iconProps = { size: 13 }
  switch (outcome) {
    case 'no_answer': return <PhoneMissed {...iconProps} />
    case 'gatekeeper_blocked': return <PhoneOff {...iconProps} />
    case 'spoke_to_owner': return <PhoneIncoming {...iconProps} />
    case 'callback_requested': return <PhoneCall {...iconProps} />
    case 'interested': return <PhoneIncoming {...iconProps} />
    case 'not_interested': return <PhoneOff {...iconProps} />
    case 'converted': return <PhoneCall {...iconProps} />
    default: return <Phone {...iconProps} />
  }
}

const outcomeColors: Record<CallOutcome, string> = {
  no_answer: '#64748b',
  gatekeeper_blocked: '#f97316',
  spoke_to_owner: '#3b82f6',
  callback_requested: '#eab308',
  interested: '#22c55e',
  not_interested: '#ef4444',
  converted: '#10b981',
}

export default function CallTimeline({ callLogs }: Props) {
  if (callLogs.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--foreground-muted)',
        fontSize: '0.875rem',
      }}>
        <Phone size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
        <p>No calls logged yet.</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--foreground-subtle)' }}>
          Use the form below to log your first call.
        </p>
      </div>
    )
  }

  const sorted = [...callLogs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {sorted.map((log, idx) => {
        const color = outcomeColors[log.call_outcome] ?? '#64748b'
        return (
          <div key={log.id} className="timeline-item" style={{ paddingBottom: idx < sorted.length - 1 ? '0.5rem' : 0 }}>
            {/* Timeline dot */}
            <div
              className="timeline-dot"
              style={{
                background: `${color}20`,
                borderColor: `${color}40`,
                color,
              }}
            >
              <OutcomeIcon outcome={log.call_outcome} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color,
                  padding: '1px 6px',
                  background: `${color}18`,
                  borderRadius: '4px',
                  border: `1px solid ${color}30`,
                }}>
                  {getOutcomeLabel(log.call_outcome)}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--foreground-muted)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '1px 6px',
                }}>
                  {ordinalSuffix(log.call_number)} call
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--foreground-subtle)', marginLeft: 'auto' }}>
                  {formatDateTime(log.created_at)}
                </span>
              </div>
              {log.notes && (
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--foreground-muted)',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem 0.75rem',
                  margin: '0.25rem 0 0',
                  lineHeight: '1.5',
                }}>
                  {log.notes}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
