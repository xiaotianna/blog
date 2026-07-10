type OgCardProps = {
  description?: string
  label: string
  tags: string[]
  title: string
}

export function OgCard({ description, label, tags, title }: OgCardProps) {
  return (
    <div
      style={{
        alignItems: 'center',
        background: '#ffffff',
        color: '#111111',
        display: 'flex',
        fontFamily: 'Noto Sans SC',
        height: '100%',
        justifyContent: 'center',
        padding: 32,
        width: '100%'
      }}
    >
      <div
        style={{
          alignItems: 'center',
          backgroundColor: '#fdfdfd',
          backgroundImage:
            'radial-gradient(circle, rgba(17, 24, 39, 0.10) 1.5px, transparent 1.5px)',
          backgroundPosition: '0 0',
          backgroundSize: '28px 28px',
          border: '2px solid #e4e4e7',
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '64px 92px',
          position: 'relative',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <div
          style={{
            background:
              'radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.94) 45%, rgba(255, 255, 255, 0) 76%)',
            height: 430,
            left: '50%',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 820
          }}
        />

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 900,
            position: 'relative'
          }}
        >
          <div
            style={{
              color: '#71717a',
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: '0.08em',
              lineHeight: 1,
              textTransform: 'uppercase'
            }}
          >
            {label}
          </div>

          <div
            style={{
              fontSize: getTitleFontSize(title),
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              marginTop: 28,
              maxWidth: 920
            }}
          >
            {title}
          </div>

          {description ? (
            <div
              style={{
                color: '#52525b',
                fontSize: 25,
                lineHeight: 1.45,
                marginTop: 24,
                maxWidth: 800
              }}
            >
              {description}
            </div>
          ) : null}

          {tags.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                justifyContent: 'center',
                marginTop: 28
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: 'rgba(255, 255, 255, 0.82)',
                    border: '1px solid #d4d4d8',
                    borderRadius: 999,
                    color: '#52525b',
                    fontSize: 18,
                    padding: '7px 14px'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div
          style={{
            bottom: 28,
            color: '#a1a1aa',
            fontSize: 18,
            left: 0,
            letterSpacing: '0.02em',
            position: 'absolute',
            textAlign: 'center',
            width: '100%'
          }}
        >
          小T1an&apos;s Blog
        </div>
      </div>
    </div>
  )
}

function getTitleFontSize(title: string) {
  if (title.length > 54) {
    return 44
  }

  if (title.length > 30) {
    return 54
  }

  return 66
}
