// frontend/src/components/common/ConfirmModal.tsx
import React from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="440px">
      <div style={{ marginBottom: '1.5rem', color: '#CBD5E1', fontSize: '0.95rem', lineHeight: 1.6 }}>
        {message}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            color: '#CBD5E1',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            background: '#EF4444',
            border: 'none',
            color: '#FFFFFF',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? 'جاري الحذف...' : 'تأكيد الحذف'}
        </button>
      </div>
    </Modal>
  );
};
