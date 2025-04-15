import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Le contenu de votre SVG */}
        <circle cx="12" cy="12" r="10" fill="#0A0A22" />
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" fill="#0A0A22" stroke="#ffffff" />
        <path d="M15 9l-3 3-3-3" stroke="#ffffff" />
      </svg>
    ),
    { ...size }
  )
}