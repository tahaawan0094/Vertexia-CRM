import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings, Key, Database, Bot, Users, Info } from 'lucide-react'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at')

  const isAdmin = profile?.role === 'admin'

  const aiProvider = process.env.AI_PROVIDER ?? 'gemini'
  const aiModel = process.env.AI_MODEL ?? 'gemini-flash-latest'

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Settings</h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Configuration and team management
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Agency Info */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Info size={16} style={{ color: 'var(--accent)' }} />
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>Agency Info</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <InfoField label="Agency Name" value="Vertexia" />
            <InfoField label="Location" value="Karachi, Pakistan" />
            <InfoField label="Offer" value="Custom websites in 7 days" />
            <InfoField label="Starting Price" value="Rs. 22,000" />
            <InfoField label="Guarantee" value="30-day money-back" />
            <InfoField label="Includes" value="Domain, hosting, business email" />
          </div>
          <p style={{ margin: '1rem 0 0', fontSize: '0.78rem', color: 'var(--foreground-subtle)', padding: '0.625rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            ℹ️ These values are baked into the AI script generator prompt. To change them, edit <code style={{ color: 'var(--accent)' }}>lib/ai/provider.ts</code>.
          </p>
        </div>

        {/* AI Configuration */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Bot size={16} style={{ color: 'var(--accent)' }} />
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>AI Script Generator</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <InfoField label="Provider" value={aiProvider.charAt(0).toUpperCase() + aiProvider.slice(1)} />
            <InfoField label="Model" value={aiModel} />
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--foreground-muted)', lineHeight: '1.6' }}>
              <strong style={{ color: 'var(--foreground)' }}>To change the AI provider:</strong> update the <code style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>AI_PROVIDER</code>, <code style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>AI_API_KEY</code>, and <code style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>AI_MODEL</code> environment variables in your <code style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>.env.local</code> file (or Vercel dashboard), then restart the server. No code changes needed.
            </p>
          </div>
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(59,130,246,0.08)', borderRadius: 'var(--radius)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.78rem', color: 'var(--foreground-muted)' }}>
            ✅ <strong>Free tier available:</strong> Get a free Gemini API key at{' '}
            <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              aistudio.google.com
            </a>
            . The <code>gemini-flash-latest</code> model is free with generous rate limits.
          </div>
        </div>

        {/* WhatsApp Info */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
            <Key size={16} style={{ color: '#4ade80' }} />
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>WhatsApp Integration</h2>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius)', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.82rem', color: 'var(--foreground-muted)', lineHeight: '1.6' }}>
            <strong style={{ color: 'var(--foreground)' }}>How it works:</strong> The "Open WhatsApp Chat" button uses a <code style={{ color: '#4ade80' }}>wa.me</code> deep link that opens WhatsApp (mobile app or web) with a pre-filled message. The rep then taps the call icon inside WhatsApp to start the voice call manually.<br /><br />
            <strong>Note:</strong> Auto-dialing via WhatsApp is not possible with a free API. A paid Meta Business Cloud API integration (Phase 2) would enable click-to-call templates.
          </div>
        </div>

        {/* Team / Users */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Users size={16} style={{ color: 'var(--accent)' }} />
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600' }}>Team Members</h2>
          </div>

          {!isAdmin && (
            <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1rem', padding: '0.625rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              ⚠️ You need admin role to manage team members. Contact your admin.
            </p>
          )}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {(profiles ?? []).map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '500' }}>{p.full_name ?? '—'}</td>
                    <td style={{ color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>{p.email}</td>
                    <td>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize',
                        background: p.role === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)',
                        color: p.role === 'admin' ? '#a78bfa' : '#93c5fd',
                        border: `1px solid ${p.role === 'admin' ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.3)'}`,
                      }}>
                        {p.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--foreground-muted)', fontSize: '0.78rem' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ margin: '0.875rem 0 0', fontSize: '0.78rem', color: 'var(--foreground-subtle)' }}>
            To add a team member, have them sign up at <strong>/signup</strong>. To grant admin role, update their <code>role</code> in Supabase Table Editor.
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--foreground-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--foreground)', fontWeight: '500' }}>{value}</div>
    </div>
  )
}
