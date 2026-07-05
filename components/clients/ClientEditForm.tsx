'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'
import type { Client } from '@/types/database'

interface Props {
  client: Client
}

const WEBSITE_STATUSES = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'live', label: 'Live' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function ClientEditForm({ client }: Props) {
  const router = useRouter()
  const [plan, setPlan] = useState(client.plan ?? '')
  const [contractDate, setContractDate] = useState(client.contract_start_date ?? '')
  const [websiteStatus, setWebsiteStatus] = useState(client.website_status ?? 'in_progress')
  const [paymentNotes, setPaymentNotes] = useState(client.payment_notes ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        plan: plan.trim() || null,
        contract_start_date: contractDate || null,
        website_status: websiteStatus,
        payment_notes: paymentNotes.trim() || null,
      })
      .eq('id', client.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div className="form-group">
        <label className="form-label" htmlFor="client-plan">Package / Plan</label>
        <input
          id="client-plan"
          className="form-input"
          placeholder="e.g. Basic Website — Rs. 22,000"
          value={plan}
          onChange={e => setPlan(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="client-date">Contract Start Date</label>
        <input
          id="client-date"
          type="date"
          className="form-input"
          value={contractDate}
          onChange={e => setContractDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="client-website-status">Website Status</label>
        <select
          id="client-website-status"
          className="form-input"
          value={websiteStatus}
          onChange={e => setWebsiteStatus(e.target.value)}
        >
          {WEBSITE_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="client-payment">Payment Notes</label>
        <textarea
          id="client-payment"
          className="form-input"
          placeholder="e.g. 50% advance received, balance due on delivery"
          rows={3}
          value={paymentNotes}
          onChange={e => setPaymentNotes(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      {error && (
        <div style={{ padding: '0.625rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', color: '#f87171', fontSize: '0.8rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '0.625rem 0.75rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius)', color: '#4ade80', fontSize: '0.8rem' }}>
          ✓ Saved successfully!
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save Changes</>}
      </button>
    </form>
  )
}
