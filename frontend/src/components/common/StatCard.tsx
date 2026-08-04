// frontend/src/components/common/StatCard.tsx
import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  subtitle?: string;
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle, color = '#3B82F6', onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        backdropFilter: 'blur(10px)',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = color;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
        }
      }}
    >
      <div>
        <div style={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.35rem' }}>{title}</div>
        <div style={{ color: '#F8FAFC', fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
        {subtitle && <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.35rem' }}>{subtitle}</div>}
      </div>
      {icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: color,
            flexShrink: 0,
            letterSpacing: '-0.5px',
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
};
