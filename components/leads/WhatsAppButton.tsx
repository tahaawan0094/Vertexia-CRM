import { MessageCircle, Info } from 'lucide-react'
import { buildWhatsAppUrl, buildWhatsAppMessage } from '@/lib/utils'

interface Props {
  phone: string
  businessName: string
  size?: 'sm' | 'md'
}

export default function WhatsAppButton({ phone, businessName, size = 'md' }: Props) {
  const url = buildWhatsAppUrl(phone, buildWhatsAppMessage(businessName))

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-whatsapp ${size === 'sm' ? 'btn-sm' : ''}`}
        id={`whatsapp-btn-${phone.replace(/\D/g, '')}`}
      >
        <MessageCircle size={size === 'sm' ? 13 : 15} />
        Open WhatsApp Chat
      </a>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.25rem',
        fontSize: '0.68rem',
        color: 'var(--foreground-subtle)',
        maxWidth: '240px',
        lineHeight: '1.4',
      }}>
        <Info size={10} style={{ flexShrink: 0, marginTop: '1px' }} />
        <span>Opens WhatsApp chat — tap the call icon inside WhatsApp to start a voice call.</span>
      </div>
    </div>
  )
}
