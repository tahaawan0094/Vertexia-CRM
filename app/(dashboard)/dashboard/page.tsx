'use client'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Users,
  Phone,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  MessageCircle,
} from 'lucide-react'
import { formatRelativeTime, getOutcomeLabel } from '@/lib/utils'
import type { LeadStatus, CallOutcome } from '@/types/database'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()

  // Aggregate lead counts by status
  const { data: leads } = await supabase
    .from('leads')
    .select('id, status, business_name, created_at, updated_at')

  // Call logs this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { data: weekCalls } = await supabase
    .from('call_logs')
    .select('id, call_outcome, lead_id, created_at')
    .gte('created_at', weekAgo.toISOString())
    .order('created_at', { ascending: false })

  // Recent activity: latest call logs with lead info
  const { data: recentLogs } = await supabase
    .from('call_logs')
    .select('*, leads(business_name, id)')
    .order('created_at', { ascending: false })
    .limit(8)

  const statusCounts = {
    new: 0, contacted: 0, follow_up: 0, won: 0, lost: 0,
  } as Record<LeadStatus, number>

  leads?.forEach(l => {
    if (l.status in statusCounts) statusCounts[l.status as LeadStatus]++
  })

  const total = leads?.length ?? 0
  const wonCount = statusCounts.won
  const conversionRate = total > 0 ? Math.round((wonCount / total) * 100) : 0

  const pipeline = [
    { status: 'new' as LeadStatus, label: 'New', color: '#3b82f6', icon: Star },
    { status: 'contacted' as LeadStatus, label: 'Contacted', color: '#eab308', icon: Phone },
    { status: 'follow_up' as LeadStatus, label: 'Follow Up', color: '#f97316', icon: Clock },
    { status: 'won' as LeadStatus, label: 'Won', color: '#22c55e', icon: CheckCircle },
    { status: 'lost' as LeadStatus, label: 'Lost', color: '#ef4444', icon: XCircle },
  ]

  const maxCount = Math.max(...Object.values(statusCounts), 1)

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--foreground)', margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--foreground-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
          Sales pipeline overview for Vertexia Web Agency
        </p>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          label="Total Leads"
          value={total}
          icon={<Users size={18} color="#3b82f6" />}
          accent="#3b82f6"
        />
        <StatCard
          label="Calls This Week"
          value={weekCalls?.length ?? 0}
          icon={<Phone size={18} color="#8b5cf6" />}
          accent="#8b5cf6"
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<TrendingUp size={18} color="#22c55e" />}
          accent="#22c55e"
        />
        <StatCard
          label="Won Deals"
          value={wonCount}
          icon={<CheckCircle size={18} color="#22c55e" />}
          accent="#22c55e"
        />
        <StatCard
          label="Follow-Ups Due"
          value={statusCounts.follow_up}
          icon={<Clock size={18} color="#f97316" />}
          accent="#f97316"
        />
      </div>

      {/* Pipeline + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Pipeline Funnel */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'var(--foreground-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}>
            Sales Pipeline
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pipeline.map(({ status, label, color, icon: Icon }) => {
              const count = statusCounts[status]
              const pct = Math.round((count / maxCount) * 100)
              return (
                <Link
                  key={status}
                  href={`/leads?status=${status}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <Icon size={13} color={color} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', width: '80px' }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground)', minWidth: '24px' }}>{count}</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'var(--surface-2)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginLeft: '21px',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                      borderRadius: '4px',
                      transition: 'width 0.6s ease',
                      minWidth: count > 0 ? '12px' : '0',
                    }} />
                  </div>
                </Link>
              )
            })}
          </div>

          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
              Total: {total} leads
            </span>
            <Link href="/leads/new" className="btn btn-primary btn-sm">
              + Add Lead
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'var(--foreground-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
          }}>
            Recent Call Activity
          </div>

          {!recentLogs || recentLogs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--foreground-muted)',
              fontSize: '0.875rem',
            }}>
              <MessageCircle size={24} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p>No calls logged yet.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Add leads and start logging calls to see activity here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentLogs.map((log: any) => (
                <Link
                  key={log.id}
                  href={`/leads/${log.lead_id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getOutcomeColor(log.call_outcome),
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      color: 'var(--foreground)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {log.leads?.business_name ?? 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--foreground-muted)' }}>
                      {getOutcomeLabel(log.call_outcome as CallOutcome)}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--foreground-subtle)', flexShrink: 0 }}>
                    {formatRelativeTime(log.created_at)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  accent: string
}) {
  return (
    <div className="stat-card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.625rem',
      }}>
        <div style={{
          padding: '0.4rem',
          borderRadius: '6px',
          background: `${accent}20`,
          border: `1px solid ${accent}30`,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--foreground)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.125rem' }}>
        {label}
      </div>
    </div>
  )
}

function getOutcomeColor(outcome: string): string {
  const m: Record<string, string> = {
    no_answer: '#64748b',
    gatekeeper_blocked: '#f97316',
    spoke_to_owner: '#3b82f6',
    callback_requested: '#eab308',
    not_interested: '#ef4444',
    interested: '#22c55e',
    converted: '#10b981',
  }
  return m[outcome] ?? '#64748b'
}
