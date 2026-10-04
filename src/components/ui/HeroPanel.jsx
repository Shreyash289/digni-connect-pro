import React, { useId } from 'react';

export default function HeroPanel({
  title,
  subtitle,
  image,
  small = false,
}) {
  const id = useId().replace(/:/g, '');

  return (
    <section className={`cv-hero${small ? ' small' : ''}`}>
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
        }}
      >
        <h1>{title}</h1>

        {subtitle && <p>{subtitle}</p>}
      </div>

      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          style={{
            zIndex: 1,
          }}
        />
      ) : (
        <svg
          viewBox="0 0 1200 500"
          aria-hidden="true"
          style={{
            width: '100%',
            height: '100%',
            bottom: 0,
            left: 0,
            transform: 'none',
            zIndex: 1,
          }}
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id={`cv-pattern-${id}`}
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1"
                fill="rgba(15,34,80,0.08)"
              />
            </pattern>

            <linearGradient
              id={`cv-hill-${id}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#BFD0FA" stopOpacity="0.18" />
            </linearGradient>

            <radialGradient
              id={`cv-orb-${id}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect
            width="1200"
            height="500"
            fill={`url(#cv-pattern-${id})`}
          />

          <circle
            cx="600"
            cy="130"
            r="170"
            fill={`url(#cv-orb-${id})`}
          />

          <g className="cv-coin">
            <circle
              cx="180"
              cy="150"
              r="30"
              fill="#FFFFFF"
              fillOpacity="0.75"
            />
            <circle
              cx="180"
              cy="150"
              r="19"
              fill="#BFD0FA"
              fillOpacity="0.8"
            />
          </g>

          <g
            className="cv-coin"
            style={{
              animationDelay: '-2.2s',
            }}
          >
            <circle
              cx="1020"
              cy="180"
              r="24"
              fill="#FFFFFF"
              fillOpacity="0.7"
            />
            <circle
              cx="1020"
              cy="180"
              r="14"
              fill="#BFD0FA"
              fillOpacity="0.75"
            />
          </g>

          <path
            d="M0 370 C180 300 300 430 500 350 C690 275 820 410 1200 300 L1200 500 L0 500 Z"
            fill={`url(#cv-hill-${id})`}
          />

          <path
            d="M0 415 C220 350 350 470 570 390 C760 320 940 430 1200 350 L1200 500 L0 500 Z"
            fill="#7E9BEA"
            fillOpacity="0.18"
          />
        </svg>
      )}
    </section>
  );
}
