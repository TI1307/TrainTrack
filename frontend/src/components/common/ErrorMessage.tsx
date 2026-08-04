// frontend/src/components/common/ErrorMessage.tsx
import React from 'react';

interface ValidationErrorItem {
  loc?: (string | number)[];
  msg: string;
  type?: string;
}

interface ErrorMessageProps {
  error: string | ValidationErrorItem[] | null;
  onClear?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onClear }) => {
  if (!error) return null;

  return (
    <div
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '10px',
        padding: '0.875rem 1rem',
        marginBottom: '1.25rem',
        color: '#F87171',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        animation: 'slideDown 0.2s ease-out',
      }}
    >
      <div style={{ flex: 1 }}>
        {typeof error === 'string' ? (
          <div>{error}</div>
        ) : Array.isArray(error) ? (
          <ul style={{ margin: 0, paddingRight: '1.25rem' }}>
            {error.map((err, idx) => (
              <li key={idx}>
                {err.loc && err.loc.length > 0 ? `${err.loc.join(' ➔ ')}: ` : ''}
                {err.msg}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {onClear && (
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: '#F87171',
            cursor: 'pointer',
            fontSize: '1.125rem',
            padding: '0 0 0 0.5rem',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
