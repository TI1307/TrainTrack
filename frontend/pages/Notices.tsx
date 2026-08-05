// frontend/pages/Notices.tsx
import { useEffect, useState } from 'react';
import type { Notice, Line, Station, Trip } from '../src/types';
import {getNotices ,createNotice , updateNotice , deleteNotice} from '../api/notice';
import {getLines} from '../api/line';
import {getStations} from '../api/station';
import {getTrips} from '../api/trip';
import { DataTable, type Column } from '../src/components/common/DataTable';
import { Modal } from '../src/components/common/Modal';
import { ConfirmModal } from '../src/components/common/ConfirmModal';
import { Badge } from '../src/components/common/Badge';
import { ErrorMessage } from '../src/components/common/ErrorMessage';

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  // Filter Bar state
  const [filterLineId, setFilterLineId] = useState<number | 'all'>('all');
  const [filterStationId, setFilterStationId] = useState<number | 'all'>('all');
  const [filterTripId, setFilterTripId] = useState<number | 'all'>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [attachType, setAttachType] = useState<'line' | 'station' | 'trip'>('line');
  const [formLineId, setFormLineId] = useState<number>(1);
  const [formStationId, setFormStationId] = useState<number>(1);
  const [formTripId, setFormTripId] = useState<number>(1);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDependencies = async () => {
    try {
      const [lnList, stList, trList] = await Promise.all([
        getLines(),
        getStations(),
        getTrips(1),
      ]);
      setLines(lnList);
      setStations(stList);
      setTrips(trList);

      if (lnList.length > 0) setFormLineId(lnList[0].id);
      if (stList.length > 0) setFormStationId(stList[0].id);
      if (trList.length > 0) setFormTripId(trList[0].id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل التبعيات');
    }
  };

  const fetchNotices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filter: { line_id?: number ; station_id?: number ; trip_id?: number  } = {};
      if (filterLineId !== 'all') filter.line_id = filterLineId;
      if (filterStationId !== 'all') filter.station_id = filterStationId;
      if (filterTripId !== 'all') filter.trip_id = filterTripId;

      const data = await getNotices(Object.keys(filter).length > 0 ? filter : undefined);
      setNotices(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل الإشعارات والتنبيهات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [filterLineId, filterStationId, filterTripId]);

  const handleOpenAddModal = () => {
    setEditingNotice(null);
    setMessage('');
    setAttachType('line');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setMessage(notice.message);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('نص التنبيه مطلوب');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (editingNotice) {
        await updateNotice(editingNotice.id, { message });
      } else {
        const payload: { line_id?: number ; station_id?: number ; trip_id?: number ; message: string  } = {
          message,
        };
        if (attachType === 'line') payload.line_id = formLineId;
        if (attachType === 'station') payload.station_id = formStationId;
        if (attachType === 'trip') payload.trip_id = formTripId;

        await createNotice(payload);
      }
      setIsModalOpen(false);
      await fetchNotices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حفظ الإشعار');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteNotice(deletingId);
      setDeletingId(null);
      await fetchNotices();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حذف الإشعار');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Notice>[] = [
    { key: 'id', header: 'المعرف ID' },
    {
      key: 'target',
      header: 'الجهة التابعة',
      render: (n) => {
        if (n.line_id) {
          const l = lines.find((item) => item.id === n.line_id);
          return <Badge type="primary">خط: {l ? l.name : `#${n.line_id}`}</Badge>;
        }
        if (n.station_id) {
          const s = stations.find((item) => item.id === n.station_id);
          return <Badge type="info">محطة: {s ? s.name : `#${n.station_id}`}</Badge>;
        }
        if (n.trip_id) {
          return <Badge type="warning">رحلة رقم: #{n.trip_id}</Badge>;
        }
        return <Badge type="danger">عام</Badge>;
      },
    },
    { key: 'message', header: 'محتوى التنبيه / الإشعار' },
    { key: 'created_at', header: 'تاريخ الإنشاء (created_at)', render: (n) => <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{n.created_at}</span> },
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
            الإشعارات والتنبيهات (Notices)
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
            إعلانات الخدمة والتنبيهات المربوطة بالخطوط أو المحطات أو الرحلات
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
          + إضافة تنبيه جديد
        </button>
      </div>

      <ErrorMessage error={error} onClear={() => setError(null)} />

      {/* Optional Filters */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '14px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.35rem' }}>تصفية حسب الخط:</label>
          <select
            className="tt-select"
            value={filterLineId}
            onChange={(e) => setFilterLineId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: '#0F172A', color: '#F8FAFC', fontSize: '0.85rem' }}
          >
            <option value="all">كل الخطوط</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.35rem' }}>تصفية حسب المحطة:</label>
          <select
            className="tt-select"
            value={filterStationId}
            onChange={(e) => setFilterStationId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: '#0F172A', color: '#F8FAFC', fontSize: '0.85rem' }}
          >
            <option value="all">كل المحطات</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.35rem' }}>تصفية حسب الرحلة:</label>
          <select
            className="tt-select"
            value={filterTripId}
            onChange={(e) => setFilterTripId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: '#0F172A', color: '#F8FAFC', fontSize: '0.85rem' }}
          >
            <option value="all">كل الرحلات</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>رحلة #{t.id}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={notices}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="بحث في نص الإشعارات..."
        emptyText="لا توجد إشعارات مسجلة طابق الشروط"
        actions={(notice) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleOpenEditModal(notice)}
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
              تعديل النص
            </button>
            <button
              onClick={() => setDeletingId(notice.id)}
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
        title={editingNotice ? `تعديل التنبيه #${editingNotice.id}` : 'إنشاء إشعار أو تنبيه جديد'}
      >
        <form onSubmit={handleSubmit}>
          {!editingNotice ? (
            <>
              {/* Target Type Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.5rem' }}>
                  ربط التنبيه بـ (اختر جهة واحدة):
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setAttachType('line')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: attachType === 'line' ? '2px solid #3B82F6' : '1px solid rgba(148,163,184,0.3)',
                      background: attachType === 'line' ? 'rgba(59,130,246,0.2)' : 'transparent',
                      color: attachType === 'line' ? '#60A5FA' : '#94A3B8',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    خط قطار
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachType('station')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: attachType === 'station' ? '2px solid #3B82F6' : '1px solid rgba(148,163,184,0.3)',
                      background: attachType === 'station' ? 'rgba(59,130,246,0.2)' : 'transparent',
                      color: attachType === 'station' ? '#60A5FA' : '#94A3B8',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    محطة
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttachType('trip')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: attachType === 'trip' ? '2px solid #3B82F6' : '1px solid rgba(148,163,184,0.3)',
                      background: attachType === 'trip' ? 'rgba(59,130,246,0.2)' : 'transparent',
                      color: attachType === 'trip' ? '#60A5FA' : '#94A3B8',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    رحلة
                  </button>
                </div>
              </div>

              {/* Target Entity Select */}
              <div style={{ marginBottom: '1.25rem' }}>
                {attachType === 'line' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.35rem' }}>اختر الخط (line_id)</label>
                    <select
                      className="tt-select"
                      value={formLineId}
                      onChange={(e) => setFormLineId(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: '#0F172A', color: '#F8FAFC', fontSize: '0.875rem' }}
                    >
                      {lines.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {attachType === 'station' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.35rem' }}>اختر المحطة (station_id)</label>
                    <select
                      className="tt-select"
                      value={formStationId}
                      onChange={(e) => setFormStationId(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: '#0F172A', color: '#F8FAFC', fontSize: '0.875rem' }}
                    >
                      {stations.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {attachType === 'trip' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.35rem' }}>اختر الرحلة (trip_id)</label>
                    <select
                      className="tt-select"
                      value={formTripId}
                      onChange={(e) => setFormTripId(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: '#0F172A', color: '#F8FAFC', fontSize: '0.875rem' }}
                    >
                      {trips.map((t) => (
                        <option key={t.id} value={t.id}>رحلة #{t.id}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>
              * تنبيه: التعديل يسمح فقط بتحديث محتوى نص الرسالة (message).
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              نص التنبيه والإعلان (message)
            </label>
            <textarea
              className="tt-textarea"
              required
              rows={4}
              placeholder="اكتب تفاصيل التنبيه أو الصيانة هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#F8FAFC',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
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
              {isSaving ? 'جاري الحفظ...' : editingNotice ? 'تحديث الرسالة' : 'نشر التنبيه'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف الإشعار"
        message="هل أنت تأكد من رغبتك في حذف هذا التنبيه؟"
        isLoading={isDeleting}
      />
    </div>
  );
}
