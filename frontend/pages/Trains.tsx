// frontend/pages/Trains.tsx
import { useEffect, useState } from 'react';
import type { Train } from '../src/types';
import {getTrains ,createTrain , updateTrain , deleteTrain} from '../api/train';
import { DataTable, type Column } from '../src/components/common/DataTable';
import { Modal } from '../src/components/common/Modal';
import { ConfirmModal } from '../src/components/common/ConfirmModal';
import { ErrorMessage } from '../src/components/common/ErrorMessage';
import { getErrorMessage, type ApiError } from '../src/utils/errors';

export default function Trains() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState<Train | null>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTrains = async () => {
    setIsLoading(true);
    try {
      const data = await getTrains();
      setTrains(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'خطأ في تحميل بيانات القطارات'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTrain(null);
    setSerialNumber('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (train: Train) => {
    setEditingTrain(train);
    setSerialNumber(train.serial_number);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) {
      setError('الرقم التسلسلي مطلوب');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (editingTrain) {
        await updateTrain(editingTrain.id, { serial_number: serialNumber });
        setSuccessMessage("لقد تم تغيير معلومات القطار بنجاح");
      } else {
        await createTrain({ serial_number: serialNumber });
        setSuccessMessage("لقد تم اضافة القطار بنجاح");
      }
      setIsModalOpen(false);
      await fetchTrains();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل حفظ القطار'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTrain(deletingId);
      setDeletingId(null);
      setSuccessMessage("لقد تم حذف القطار بنجاح");
      await fetchTrains();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل حذف القطار'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Train>[] = [
    { key: 'id', header: 'المعرف ID' },
    { key: 'serial_number', header: 'الرقم التسلسلي للقطار (Serial Number)' },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#F8FAFC' }}>
            أسطول القطارات (Trains)
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
            إدارة أرقام السلسلة وهياكل القطارات والقاطرات
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: '#2563EB',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          + إضافة قطار جديد
        </button>
      </div>

      <ErrorMessage error={error} onClear={() => setError(null)} />
          {successMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} style={{ background: 'none', border: 'none', color: '#34D399', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={trains}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="بحث عن قطار بالرقم التسلسلي..."
        actions={(tr) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleOpenEditModal(tr)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60A5FA',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              تعديل
            </button>
            <button
              onClick={() => setDeletingId(tr.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              حذف
            </button>
          </div>
        )}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTrain ? 'تعديل الرقم التسلسلي للقطار' : 'إضافة قطار جديد للأسطول'}
      >
        <form onSubmit={handleSubmit}>
           <ErrorMessage error={error} onClear={() => setError(null)} />
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              الرقم التسلسلي (serial_number)
            </label>
            <input
              type="text"
              className="tt-input"
              required
              placeholder="مثال: TR-101 (كوراديا السريع)"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#F8FAFC',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                color: '#CBD5E1',
                cursor: 'pointer',
              }}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'جاري الحفظ...' : editingTrain ? 'تحديث القطار' : 'إضافة القطار'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف القطار"
        message="هل أنت تأكد من رغبتك في حذف هذا القطار من الأسطول؟"
        isLoading={isDeleting}
      />
    </div>
  );
}
