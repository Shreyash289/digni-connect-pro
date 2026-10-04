import React from 'react';
import careviaLogoNavy from '../../assets/carevia-logo-navy.png';
import careviaLogoWhite from '../../assets/carevia-logo-white.png';

const logoFiles = import.meta.glob('../../assets/carevia-logo*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const logoSrc =
  Object.values(logoFiles)[0] ||
  careviaLogoNavy ||
  '';

export default function Logo({ size = 30, withWordmark = true, variant = 'navy' }) {
  const imageSrc = variant === 'white' ? careviaLogoWhite : (careviaLogoNavy || logoSrc);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="CareVia"
          style={{
            width: size,
            height: 'auto',
            maxHeight: size,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: 10,
            background: 'var(--grad-logo)',
            flexShrink: 0,
          }}
        />
      )}

      {withWordmark && (
        <span
          style={{
            color: variant === 'white' ? '#ffffff' : 'var(--ink)',
            fontFamily: 'var(--font)',
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          CAREVIA
        </span>
      )}
    </div>
  );
}
