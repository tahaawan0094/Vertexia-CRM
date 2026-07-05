'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { XCircle, Loader2 } from 'lucide-react'

interface Props {
  leadId: string
}

export default function MarkLostButton({ leadId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkLost = async () => {
    if (!confirm('Mark this lead as Lost? This can be changed later.')) return
    setLoading(true)

    const supabase = createClient()
    await supabase.from('leads').update({ status: 'lost' }).eq('id', leadId)

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleMarkLost}
      disabled={loading}
      className="btn btn-danger btn-sm"
      id="mark-lost-btn"
    >
      {loading
        ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
        : <XCircle size={13} />
      }
      Mark as Lost
    </button>
  )
}
