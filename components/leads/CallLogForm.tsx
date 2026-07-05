'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, Loader2 } from 'lucide-react'
import type { CallOutcome } from '@/types/database'

const OUTCOMES: { value: CallOutcome; label: string }[] = [
  { value: 'no_answer', label: 'No Answer' },
  { value: 'gatekeeper_blocked', label: 'Gatekeeper Blocked' },
  { value: 'spoke_to_owner', label: 'Spoke to Owner' },
  { value: 'callback_requested', label: 'Callback Requested' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'converted', label: 'Converted' },
]

interface Props {
  leadId: string
  onSuccess?: () => void
}

export default function CallLogForm({ leadId, onSuccess }: Props) {
  const [outcome, setOutcome] = useState<CallOutcome>('no_answer')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase.from('call_logs').insert({
        lead_id: leadId,
        called_by: user.id,
        call_outcome: outcome,
        notes: notes.trim() || null,
      })

      if (insertError) throw insertError

      // Auto-advance lead status
      if (['interested', 'callback_requested', 'spoke_to_owner'].includes(outcome)) {
        await supabase.from('leads').update({ status: 'follow_up' })
          .eq('id', leadId).eq('status', 'new')
      } else if (['no_answer', 'gatekeeper_blocked'].includes(outcome)) {
        await supabase.from('leads').update({ status: 'contacted' })
          .eq('id', leadId).eq('status', 'new')
      }

      setNotes('')
      setOutcome('no_answer')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onSuccess?.()
    } catch (err: any) {
      setError(err.message ?? 'Failed to log call')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="call-outcome">Call Outcome *</label>
          <select
            id="call-outcome"
            className="form-input"
            value={outcome}
            onChange={e => setOutcome(e.target.value as CallOutcome)}
          >
            {OUTCOMES.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="call-notes">Notes</label>
          <textarea
            id="call-notes"
            className="form-input"
            placeholder="What happened on the call? Any follow-up needed?"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {error && (
          <div style={{
            padding: '0.625rem 0.75rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius)',
            color: '#f87171',
            fontSize: '0.8rem',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '0.625rem 0.75rem',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 'var(--radius)',
            color: '#4ade80',
            fontSize: '0.8rem',
          }}>
            ✓ Call logged successfully!
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Logging...</>
          ) : (
            <><Phone size={14} /> Log Call</>
          )}
        </button>
      </div>
    </form>
  )
}
