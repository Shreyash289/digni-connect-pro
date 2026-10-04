import React from 'react';

export default function StatTile({
  value,
  label,
  note,
  light = false,
  flower = false,
}) {
  return (
    <article className={`cv-tile ${light ? 'light' : 'dark'}`}>
      <div>
        <div className="cv-num">{value}</div>

        {label && <h3>{label}</h3>}

        {note && <p>{note}</p>}
      </div>

      {flower && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 20,
            bottom: 18,
            width: 76,
            height: 76,
            borderRadius: '50%',
            border: '1px solid currentColor',
            opacity: 0.14,
          }}
        />
      )}
    </article>
  );
}
