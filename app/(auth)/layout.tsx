export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        {children}
      </div>
    </div>
  )
}
