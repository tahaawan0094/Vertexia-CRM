'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Bell } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface TopNavProps {
  user: User
  profile: Profile | null
}

export default function TopNav({ user, profile }: TopNavProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header style={{
      height: '52px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
        Vertexia Web Development Agency · Karachi
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--foreground-muted)',
          display: 'none',
        }}>
          {user.email}
        </span>

        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
          title="Sign out"
          style={{ gap: '0.375rem' }}
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </header>
  )
}
