import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import TopNav from '@/components/layout/TopNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar userEmail={user.email ?? ''} profile={profile} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopNav user={user} profile={profile} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--background)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
