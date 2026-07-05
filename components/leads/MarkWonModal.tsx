'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trophy, X, Loader2 } from 'lucide-react'

interface Props {
  leadId: string
  businessName: string
}

export default function MarkWonModal({ leadId, businessName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [plan, setPlan] = useState('')
  const [contractDate, setContractDate] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch lead data
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single()

      if (!lead) throw new Error('Lead not found')

      // Update lead status
      await supabase.from('leads').update({ status: 'won' }).eq('id', leadId)

      // Check if client already exists
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('lead_id', leadId)
        .maybeSingle()

      if (!existing) {
        const { error: clientErr } = await supabase.from('clients').insert({
          lead_id: leadId,
          business_name: lead.business_name,
          contact_person: lead.contact_person,
          phone: lead.phone,
          whatsapp_number: lead.whatsapp_number,
          plan: plan.trim() || null,
          contract_start_date: contractDate || null,
          website_status: 'in_progress',
          payment_notes: paymentNotes.trim() || null,
        })
        if (clientErr) throw clientErr
      }

      setOpen(false)
      router.refresh()
      router.push('/clients')
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-success"
        id="mark-won-btn"
      >
        <Trophy size={14} />
        Mark as Won
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          padding: '1rem',
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: '480px',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={18} style={{ color: '#4ade80' }} />
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                  Convert to Client
                </h2>
              </div>
              <button onClick={() => setOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                <X size={14} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--foreground-muted)', marginBottom: '1.25rem' }}>
              Converting <strong style={{ color: 'var(--foreground)' }}>{businessName}</strong> to a client. Fill in contract details below (optional).
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="won-plan">Package / Plan</label>
                <input
                  id="won-plan"
                  className="form-input"
                  placeholder="e.g. Basic Website — Rs. 22,000"
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="won-date">Contract Start Date</label>
                <input
                  id="won-date"
                  type="date"
                  className="form-input"
                  value={contractDate}
                  onChange={e => setContractDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="won-payment">Payment Notes</label>
                <textarea
                  id="won-payment"
                  className="form-input"
                  placeholder="e.g. 50% advance paid, remaining on delivery"
                  rows={2}
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
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

              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? (
                    <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Converting...</>
                  ) : (
                    <><Trophy size={14} /> Confirm — Mark as Won</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
