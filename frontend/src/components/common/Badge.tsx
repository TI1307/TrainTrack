// frontend/src/components/common/Badge.tsx
import React from 'react';

interface BadgeProps {
  type?: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'neutral';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ type = 'neutral', children }) => {
  const stylesMap: Record<NonNullable<BadgeProps['type']>, { bg: string; color: string; border: string }> = {
    success: { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.2)' },
    danger: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'rgba(239, 68, 68, 0.2)' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.2)' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)' },
    primary: { bg: 'rgba(148, 163, 184, 0.1)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.2)' },
    neutral: { bg: 'rgba(148, 163, 184, 0.1)', color: '#cbd5e1', border: 'rgba(148, 163, 184, 0.2)' },
  };

  const style = stylesMap[type];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {children}
    </span>
  );
};
