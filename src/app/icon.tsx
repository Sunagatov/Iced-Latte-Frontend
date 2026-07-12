import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// Static image generation — CSS variables unavailable, use raw value matching --color-brand-solid
const BRAND_COLOR = '#1B4332'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_COLOR,
          borderRadius: '7px',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <path
            d="M6 8.5C6 8.5 8 5 16 5C24 5 26 8.5 26 8.5L24 25C24 25 22.5 28 16 28C9.5 28 8 25 8 25L6 8.5Z"
            fill="white"
            fillOpacity="0.95"
          />
          <ellipse cx="16" cy="8.5" rx="10" ry="3.5" fill="white" />
          <path
            d="M26 12C26 12 30 12.8 30 16C30 19.2 26 20 26 20"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  )
}
