import { useState, useEffect } from 'react'
import logoNavy from '../../assets/carevia-logo-navy.png'

// Module-level flag: resets on browser reloads/refreshes, but persists across in-app route changes
let hasPlayed = false

export default function LaunchScreen() {
  const [mounted, setMounted] = useState(() => !hasPlayed)
  const [exitState, setExitState] = useState(null) // null | 'normal' | 'skip' | 'reduced'

  useEffect(() => {
    if (!mounted) return

    // Mark as played so subsequent in-app navigation will not replay it
    hasPlayed = true

    // Lock page scrolling while launch screen is mounted
    const originalOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    const isReduced = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isReduced) {
      const t1 = setTimeout(() => {
        setExitState('reduced')
      }, 1200)

      const t2 = setTimeout(() => {
        document.documentElement.style.overflow = originalOverflow
        setMounted(false)
      }, 1600)

      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        document.documentElement.style.overflow = originalOverflow
      }
    }

    // Normal sequence: content 0-3.1s, exit lift 3.1-4.0s
    const tLift = setTimeout(() => {
      setExitState('normal')
    }, 3100)

    const tUnmount = setTimeout(() => {
      document.documentElement.style.overflow = originalOverflow
      setMounted(false)
    }, 4000)

    return () => {
      clearTimeout(tLift)
      clearTimeout(tUnmount)
      document.documentElement.style.overflow = originalOverflow
    }
  }, [mounted])

  const handleSkip = () => {
    if (exitState) return
    setExitState('skip')
    setTimeout(() => {
      document.documentElement.style.overflow = ''
      setMounted(false)
    }, 700)
  }

  if (!mounted) return null

  let exitClass = ''
  if (exitState === 'normal') exitClass = 'exiting'
  else if (exitState === 'skip') exitClass = 'exiting-skip'
  else if (exitState === 'reduced') exitClass = 'reduced-motion-fade'

  return (
    <div
      className={`carevia-launch ${exitClass}`}
      role="img"
      aria-label="CAREVIA is loading"
    >
      {/* Decorative Rising Hills Background SVG */}
      <svg
        className="launch-hills"
        viewBox="0 0 1440 460"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="carevia-back-hill-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5B7FE6" />
            <stop offset="100%" stopColor="#1A2F78" />
          </linearGradient>

          <linearGradient id="carevia-front-hill-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2F4FC2" />
            <stop offset="100%" stopColor="#0F2250" />
          </linearGradient>

          <pattern
            id="carevia-launch-dots"
            x="0"
            y="0"
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2.5" cy="2.5" r="1.4" fill="#9DB4F5" />
            <circle cx="7" cy="7" r="1" fill="#DCE6FF" />
          </pattern>
        </defs>

        <g className="launch-hill-back">
          <path
            d="M 0,210 Q 360,90 760,190 T 1440,160 L 1440,460 L 0,460 Z"
            fill="url(#carevia-back-hill-grad)"
          />
          <path
            d="M 0,210 Q 360,90 760,190 T 1440,160 L 1440,460 L 0,460 Z"
            fill="url(#carevia-launch-dots)"
            opacity="0.7"
          />
        </g>

        <g className="launch-hill-front">
          <path
            d="M 0,310 Q 420,180 900,280 T 1440,240 L 1440,460 L 0,460 Z"
            fill="url(#carevia-front-hill-grad)"
          />
          <path
            d="M 0,310 Q 420,180 900,280 T 1440,240 L 1440,460 L 0,460 Z"
            fill="url(#carevia-launch-dots)"
            opacity="0.35"
          />
        </g>
      </svg>

      {/* Two Separate Absolutely Positioned Floating Orbs / Coins */}
      <div className="launch-coin-left-wrapper" aria-hidden="true">
        <div className="launch-coin-left" />
      </div>

      <div className="launch-coin-right-wrapper" aria-hidden="true">
        <div className="launch-coin-right" />
      </div>

      {/* Center Branding */}
      <div className="launch-center-content">
        <img
          src={logoNavy}
          alt="CareVia"
          className="launch-logo"
        />
        <h1 className="launch-wordmark">CAREVIA</h1>
        <p className="launch-tagline">Where careers begin again</p>
      </div>

      {/* Bottom Progress Bar */}
      <div className="launch-progress-track" aria-hidden="true">
        <div className="launch-progress-fill" />
      </div>

      {/* Accessible Skip Button */}
      <button
        type="button"
        className="launch-skip-btn"
        onClick={handleSkip}
        aria-label="Skip launch screen"
      >
        Skip
      </button>
    </div>
  )
}
