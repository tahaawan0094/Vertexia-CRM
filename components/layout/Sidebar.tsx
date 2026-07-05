'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  Zap,
} from 'lucide-react'
import type { Profile } from '@/types/database'

interface SidebarProps {
  userEmail: string
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/clients', label: 'Clients', icon: UserCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ userEmail, profile }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="sidebar" style={{ position: 'sticky', top: 0, height: '100vh' }}>
      {/* Logo */}
      <div style={{
        padding: '1.25rem 1rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          color: 'white',
          fontSize: '0.9rem',
          flexShrink: 0,
        }}>V</div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--foreground)' }}>
            Vertexia
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)', marginTop: '-1px' }}>
            CRM
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? 'var(--accent)' : 'var(--foreground-muted)',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(59,130,246,0.2)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: '700',
            color: 'white',
            flexShrink: 0,
          }}>
            {(profile?.full_name || userEmail)?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: '500',
              color: 'var(--foreground)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {profile?.full_name || userEmail}
            </div>
            <div style={{
              fontSize: '0.65rem',
              color: 'var(--foreground-muted)',
              textTransform: 'capitalize',
            }}>
              {profile?.role?.replace('_', ' ') ?? 'Sales Rep'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
