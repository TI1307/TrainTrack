// frontend/pages/AdminUsers.tsx
import { useEffect, useState } from 'react';
import type { AdminUser } from '../src/types';
import {getAdminUsers , createAdminUser ,deleteAdminUser} from'../api/adminUsers';
import { DataTable, type Column } from '../src/components/common/DataTable';
import { Modal } from '../src/components/common/Modal';
import { ConfirmModal } from '../src/components/common/ConfirmModal';
import { ErrorMessage } from '../src/components/common/ErrorMessage';
import { getErrorMessage, type ApiError } from '../src/utils/errors';
export default function AdminUsers() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Invite Admin Modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ username: '', email: '' });
  const [isInviting, setIsInviting] = useState(false);

  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsers();
      setAdmins(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err,'خطأ في تحميل حسابات الأدمن'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.username.trim() || !inviteForm.email.trim()) {
      setError('اسم المستخدم والبريد الإلكتروني مطلوبان');
      return;
    }
    setIsInviting(true);
    setError(null);
    try {
      await createAdminUser(inviteForm);
      setIsInviteModalOpen(false);
      setInviteForm({ username: '', email: '' });
      setSuccessMessage('تم دعوة المشرف وإضافته بنجاح');
      await fetchAdmins();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل إرسال الدعوة'));
    } finally {
    setIsInviting(false);
  }
  };



  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAdminUser(deletingId);
      setDeletingId(null);
      setSuccessMessage('تم حذف حساب الأدمن بنجاح');
      await fetchAdmins();
    } catch (err: unknown) {
      setError(getErrorMessage(err,'فشل حذف حساب الأدمن'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<AdminUser>[] = [
    { key: 'id', header: 'المعرف ID' },
    { key: 'username', header: 'اسم المستخدم (Username)' },
    { key: 'email', header: 'البريد الإلكتروني (Email)' },
    { key: 'status', header: 'حالة المستخدم (Status)' },
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
            حسابات المسؤولين (Admin Users)
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
            دعوة مسؤولين جديد وإدارة صلاحيات كلمة المرور وحذف الحسابات
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsInviteModalOpen(true)}
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
            + دعوة مسؤول جديد (Invite Admin)
          </button>
        </div>
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
        data={admins}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="بحث عن أدمن بالاسم أو البريد..."
        actions={(admin) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            
            <button
              onClick={() => setDeletingId(admin.id)}
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

      {/* Invite Admin Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="دعوة مسؤول جديد (Invite Admin)">
        <form onSubmit={handleInviteSubmit}>
          <ErrorMessage error={error} onClear={() => setError(null)} />
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              اسم المستخدم (username)
            </label>
            <input
              type="text"
              className="tt-input"
              required
              placeholder="مثال: supervisor_annaba"
              value={inviteForm.username}
              onChange={(e) => setInviteForm({ ...inviteForm, username: e.target.value })}
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              البريد الإلكتروني (email)
            </label>
            <input
              type="email"
              className="tt-input"
              required
              placeholder="مثال: admin@traintrack.dz"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
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
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.35rem' }}>
              * ملاحظة: لا يوجد حقل كلمة مرور عند الإنشاء، حيث يتم تعيين كلمة المرور لاحقاً عبر رمز الدعوة.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              disabled={isInviting}
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
              disabled={isInviting}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 600,
                cursor: isInviting ? 'not-allowed' : 'pointer',
              }}
            >
              {isInviting ? 'جاري الإرسال...' : 'إرسال الدعوة'}
            </button>
          </div>
        </form>
      </Modal>

      
      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف حساب الأدمن"
        message="هل أنت تأكد من رغبتك في حذف حساب هذا المسؤول؟"
        isLoading={isDeleting}
      />
    </div>
  );
}
