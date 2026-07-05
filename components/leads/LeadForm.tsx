'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types/database'

interface Props {
  mode: 'create' | 'edit'
  lead?: Lead
}

const industries = [
  'Restaurant / Food & Beverage',
  'Healthcare / Medical Clinic',
  'Fashion / Clothing Boutique',
  'Electronics / Retail',
  'Education / Tutoring Center',
  'Furniture / Home Decor',
  'Automotive / Car Repair',
  'Beauty / Salon & Spa',
  'Retail / Grocery',
  'Creative Agency / Design',
  'Real Estate',
  'Construction / Contractor',
  'Law / Legal Services',
  'Accounting / Finance',
  'Travel / Tourism',
  'Photography / Videography',
  'Fitness / Gym',
  'General',
  'Other',
]

export default function LeadForm({ mode, lead }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    business_name: lead?.business_name ?? '',
    industry: lead?.industry ?? 'General',
    city: lead?.city ?? 'Karachi',
    phone: lead?.phone ?? '',
    whatsapp_number: lead?.whatsapp_number ?? '',
    contact_person: lead?.contact_person ?? '',
    contact_role: lead?.contact_role ?? 'unknown',
    current_website_status: lead?.current_website_status ?? 'none',
    source: lead?.source ?? 'cold_call',
    status: lead?.status ?? 'new',
    notes: lead?.notes ?? '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const payload = {
        ...form,
        whatsapp_number: form.whatsapp_number || null,
        contact_person: form.contact_person || null,
        notes: form.notes || null,
      }

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('leads')
          .insert({ ...payload, assigned_to: user.id })
          .select()
          .single()
        if (error) throw error
        router.push(`/leads/${data.id}`)
      } else if (lead) {
        const { error } = await supabase
          .from('leads')
          .update(payload)
          .eq('id', lead.id)
        if (error) throw error
        router.push(`/leads/${lead.id}`)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message ?? 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Business Name */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="business_name">Business Name *</label>
            <input
              id="business_name"
              className="form-input"
              placeholder="e.g. Al-Shifa Medical Clinic"
              value={form.business_name}
              onChange={e => set('business_name', e.target.value)}
              required
            />
          </div>

          {/* Industry */}
          <div className="form-group">
            <label className="form-label" htmlFor="industry">Industry *</label>
            <select
              id="industry"
              className="form-input"
              value={form.industry}
              onChange={e => set('industry', e.target.value)}
            >
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* City */}
          <div className="form-group">
            <label className="form-label" htmlFor="city">City *</label>
            <input
              id="city"
              className="form-input"
              placeholder="Karachi"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              className="form-input"
              placeholder="+92-321-1234567"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              required
            />
          </div>

          {/* WhatsApp */}
          <div className="form-group">
            <label className="form-label" htmlFor="whatsapp">WhatsApp Number</label>
            <input
              id="whatsapp"
              className="form-input"
              placeholder="+923211234567 (with country code)"
              value={form.whatsapp_number}
              onChange={e => set('whatsapp_number', e.target.value)}
            />
          </div>

          {/* Contact Person */}
          <div className="form-group">
            <label className="form-label" htmlFor="contact_person">Contact Person</label>
            <input
              id="contact_person"
              className="form-input"
              placeholder="Owner's name"
              value={form.contact_person}
              onChange={e => set('contact_person', e.target.value)}
            />
          </div>

          {/* Contact Role */}
          <div className="form-group">
            <label className="form-label" htmlFor="contact_role">Contact Role</label>
            <select
              id="contact_role"
              className="form-input"
              value={form.contact_role}
              onChange={e => set('contact_role', e.target.value)}
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Website Status */}
          <div className="form-group">
            <label className="form-label" htmlFor="website_status">Current Website</label>
            <select
              id="website_status"
              className="form-input"
              value={form.current_website_status}
              onChange={e => set('current_website_status', e.target.value)}
            >
              <option value="none">No Website</option>
              <option value="outdated">Outdated Website</option>
              <option value="has_website">Has Website</option>
            </select>
          </div>

          {/* Source */}
          <div className="form-group">
            <label className="form-label" htmlFor="source">Lead Source</label>
            <select
              id="source"
              className="form-input"
              value={form.source}
              onChange={e => set('source', e.target.value)}
            >
              <option value="cold_call">Cold Call</option>
              <option value="referral">Referral</option>
              <option value="social">Social Media</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status (only in edit mode) */}
          {mode === 'edit' && (
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                className="form-input"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="follow_up">Follow Up</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              className="form-input"
              placeholder="Any additional context about this lead..."
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 'var(--radius)',
            color: '#f87171',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: '14px', height: '14px' }} />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              mode === 'create' ? 'Create Lead' : 'Save Changes'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
