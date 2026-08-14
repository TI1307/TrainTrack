// frontend/pages/Wilayas.tsx
import { useEffect, useState } from 'react';
import type { Wilaya } from '../src/types';
import {getWilayas ,createWilaya , updateWilaya , deleteWilaya} from '../api/wilaya';
import { DataTable, type Column } from '../src/components/common/DataTable';
import { Modal } from '../src/components/common/Modal';
import { ConfirmModal } from '../src/components/common/ConfirmModal';
import { ErrorMessage } from '../src/components/common/ErrorMessage';
import { getErrorMessage, type ApiError } from '../src/utils/errors';
export default function Wilayas() {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWilaya, setEditingWilaya] = useState<Wilaya | null>(null);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWilayas = async () => {
    setIsLoading(true);
    try {
      const data = await getWilayas();
      setWilayas(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'خطأ في تحميل بيانات الولايات'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWilayas();
  }, []);

  const handleOpenAddModal = () => {
    setEditingWilaya(null);
    setName('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (wilaya: Wilaya) => {
    setEditingWilaya(wilaya);
    setName(wilaya.name);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('اسم الولاية مطلوب');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (editingWilaya) {
        await updateWilaya(editingWilaya.id, { name });
        setSuccessMessage("لقد تم  تغير اسم الولاية بنجاح");
      } else {
        await createWilaya({ name });
        setSuccessMessage("لقد تم اضافة الولاية بنجاح");
      }
      setIsModalOpen(false);
      await fetchWilayas();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل حفظ الولاية'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteWilaya(deletingId);
      setDeletingId(null);
      setSuccessMessage("لقد تم حذف الولاية بنجاح");
      await fetchWilayas();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل حذف الولاية'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Wilaya>[] = [
    { key: 'id', header: 'رقم / رمز الولاية (ID)' },
    { key: 'name', header: 'اسم الولاية' },
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
            إدارة الولايات (Wilayas)
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
            الولايات والمناطق الجغرافية المستخدمة لربط وتصفية المحطات
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
          + إضافة ولاية جديدة
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
        data={wilayas}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="بحث عن ولاية..."
        actions={(w) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleOpenEditModal(w)}
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
              onClick={() => setDeletingId(w.id)}
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
        title={editingWilaya ? 'تعديل اسم الولاية' : 'إضافة ولاية جديدة'}
      >
        <form onSubmit={handleSubmit}>
          <ErrorMessage error={error} onClear={() => setError(null)} />
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              اسم الولاية (name)
            </label>
            <input
              type="text"
              className="tt-input"
              required
              placeholder="مثال: وهران"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              {isSaving ? 'جاري الحفظ...' : editingWilaya ? 'تحديث البيانات' : 'إضافة الولاية'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف الولاية"
        message="هل أنت تأكد من رغبتك في حذف هذه الولاية؟"
        isLoading={isDeleting}
      />
    </div>
  );
}
