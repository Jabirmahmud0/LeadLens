import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

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
          background: '#16352a',
          borderRadius: '24%',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dotted Optical Lens Ring */}
          <circle
            cx="16"
            cy="16"
            r="7.5"
            stroke="white"
            strokeWidth="1"
            strokeDasharray="2 2"
            style={{ opacity: 0.15 }}
          />
          {/* L-bracket 1 (Top-Left) */}
          <path
            d="M10 6v14a2 2 0 002 2h14"
            stroke="url(#ll-logo-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* L-bracket 2 (Bottom-Right) */}
          <path
            d="M22 26V12a2 2 0 00-2-2H6"
            stroke="url(#ll-logo-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Intelligence Spark */}
          <path
            d="M16 11c0 2.5-2.5 5-5 5 2.5 0 5 2.5 5 5 0-2.5 2.5-5 5-5-2.5 0-5-2.5-5-5z"
            fill="#10b981"
          />
          <defs>
            <linearGradient id="ll-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
