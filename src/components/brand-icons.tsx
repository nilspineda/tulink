import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

// 1. WhatsApp Official Icon
export function WhatsAppIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={`${className} aspect-square shrink-0`}
      style={{ minWidth: size, minHeight: size }}
    >
      <path d="M12.012 2c-5.506 0-9.98 4.472-9.98 9.978 0 1.761.458 3.479 1.328 4.996L2 22l5.178-1.357c1.472.802 3.125 1.226 4.829 1.226 5.505 0 9.979-4.471 9.979-9.977A9.985 9.985 0 0 0 12.012 2zm5.727 14.129c-.25.7-1.42 1.272-1.957 1.328-.48.05-1.107.082-1.78-.135a10.02 10.02 0 0 1-4.32-2.738 10.15 10.15 0 0 1-2.585-3.874c-.407-.69-.747-1.503-.747-2.31 0-1.637.854-2.428 1.157-2.723.25-.245.547-.369.825-.369.082 0 .164.004.238.008.21.008.41.02.583.376.216.446.742 1.81.808 1.943.065.132.106.287.016.463-.09.176-.135.286-.27.442-.135.156-.283.348-.403.468-.135.135-.276.282-.12.553.156.27.693 1.144 1.488 1.848.998.885 1.84 1.16 2.11 1.295.27.135.426.115.586-.066.156-.176.676-.79.856-1.062.18-.27.36-.225.606-.135.246.09 1.557.733 1.828.868.27.135.45.2.516.315.066.115.066.66-.184 1.36z" />
    </svg>
  )
}

// 2. TikTok Official Icon
export function TikTokIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={`${className} aspect-square shrink-0`}
      style={{ minWidth: size, minHeight: size }}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.56 4.24 1.02.97 2.37 1.5 3.77 1.52v3.76c-1.7-.02-3.37-.56-4.78-1.54-.04 2.87.04 5.75-.02 8.62-.06 2.01-.73 3.99-1.91 5.62-1.63 2.01-4.22 3.06-6.76 2.76-2.58-.23-4.9-1.89-5.91-4.32-1.3-2.92-.61-6.66 1.63-8.87 1.6-1.65 3.92-2.42 6.16-2.12v3.86c-1.39-.41-2.94-.08-4.01.88-.93.79-1.33 2.12-1.02 3.3.37 1.51 1.8 2.62 3.35 2.54 1.64.04 3.09-1.14 3.25-2.77.08-3.66.03-7.32.05-10.98.01-3.19.01-6.38.01-9.57z" />
    </svg>
  )
}

// 3. YouTube Official Icon
export function YouTubeIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={`${className} aspect-square shrink-0`}
      style={{ minWidth: size, minHeight: size }}
    >
      <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

// 4. Instagram Official Icon
export function InstagramIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={`${className} aspect-square shrink-0`}
      style={{ minWidth: size, minHeight: size }}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

// 5. Facebook Official Icon
export function FacebookIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={`${className} aspect-square shrink-0`}
      style={{ minWidth: size, minHeight: size }}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

// 6. LinkedIn Official Icon
export function LinkedInIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={`${className} aspect-square shrink-0`}
      style={{ minWidth: size, minHeight: size }}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

// 7. Twitter / X Official Icon
export function TwitterIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={`${className} aspect-square shrink-0`}
      style={{ minWidth: size, minHeight: size }}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// 8. Amazon / Store Icon
export function AmazonIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={`${className} aspect-square shrink-0`}
      style={{ minWidth: size, minHeight: size }}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.882 17.587c-1.39.814-3.142 1.25-4.882 1.25-2.73 0-5.11-1.07-6.527-2.793-.19-.23-.01-.527.276-.445.694.198 1.558.293 2.11.293 1.64 0 3.09-.34 3.25-1.97.08-3.66.03-7.32.05-10.98.01-1.19.01-2.38.01-3.57 0-.585-.563-1.04-1.138-1.04H7.433c-.586 0-1.063-.478-1.063-1.064s.477-1.063 1.063-1.063h6.814c.585 0 1.063.477 1.063 1.063v12.441c0 .245.18.44.425.44.384 0 1.11-.295 1.55-.58.195-.125.418-.088.468.136.082.355.222.756.136.953-.082.19-.232.32-.47.458z" />
    </svg>
  )
}
