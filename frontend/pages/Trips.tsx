// frontend/pages/Trips.tsx
import { useEffect, useState } from 'react';
import type { Trip, Line, Train, TripStatus, TripType } from '../src/types';
import {getTrips ,createTrip , updateTrip , deleteTrip} from '../api/trip';
import {getLines} from '../api/line';
import {getTrains} from '../api/train';
import { DataTable, type Column } from '../src/components/common/DataTable';
import { Modal } from '../src/components/common/Modal';
import { ConfirmModal } from '../src/components/common/ConfirmModal';
import { Badge } from '../src/components/common/Badge';
import { ErrorMessage } from '../src/components/common/ErrorMessage';

export default function Trips() {
  const [lines, setLines] = useState<Line[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [form, setForm] = useState<{
    line_id: number;
    train_id: number;
    status: TripStatus;
    tripType: TripType;
  }>({
    line_id: 1,
    train_id: 1,
    status: 'working',
    tripType: 'inter_Wilaya',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [lnList, trList] = await Promise.all([getLines(), getTrains()]);
      setLines(lnList);
      setTrains(trList);
      if (lnList.length > 0 && selectedLineId === null) {
        setSelectedLineId(lnList[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل البيانات الأساسية');
    }
  };

  const fetchTripsForLine = async (lineId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTrips(lineId);
      setTrips(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل الرحلات للخط المحدد');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedLineId !== null) {
      fetchTripsForLine(selectedLineId);
    }
  }, [selectedLineId]);

  const handleOpenAddModal = () => {
    if (!selectedLineId) return;
    setEditingTrip(null);
    setForm({
      line_id: selectedLineId,
      train_id: trains[0]?.id || 1,
      status: 'working',
      tripType: 'inter_Wilaya',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (trip: Trip) => {
    setEditingTrip(trip);
    setForm({
      line_id: trip.line_id,
      train_id: trip.train_id,
      status: trip.status,
      tripType: trip.tripType,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLineId) return;
    setIsSaving(true);
    setError(null);
    try {
      if (editingTrip) {
        await updateTrip(editingTrip.id, {
          status: form.status,
          tripType: form.tripType,
        });
      } else {
        await createTrip({
          line_id: Number(form.line_id),
          train_id: Number(form.train_id),
          status: form.status,
          tripType: form.tripType,
        });
      }
      setIsModalOpen(false);
      await fetchTripsForLine(selectedLineId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حفظ الرحلة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId || !selectedLineId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTrip(deletingId);
      setDeletingId(null);
      await fetchTripsForLine(selectedLineId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حذف الرحلة');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Trip>[] = [
    { key: 'id', header: 'معرف الرحلة (ID)' },
    {
      key: 'train',
      header: 'القطار المستخدم',
      render: (t) => {
        const trainObj = trains.find((item) => item.id === t.train_id);
        return trainObj ? trainObj.serial_number : `قطار #${t.train_id}`;
      },
    },
    {
      key: 'status',
      header: 'حالة الرحلة (status)',
      render: (t) =>
        t.status === 'working' ? (
          <Badge type="success">شغالة (working)</Badge>
        ) : (
          <Badge type="danger">غير شغالة (not_working)</Badge>
        ),
    },
    {
      key: 'tripType',
      header: 'نوع الرحلة (tripType)',
      render: (t) =>
        t.tripType === 'inter_Wilaya' ? (
          <Badge type="primary">بين الولايات (inter_Wilaya)</Badge>
        ) : (
          <Badge type="info">داخل الولاية (intra_Wilaya)</Badge>
        ),
    },
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
            الرحلات المبرمجة (Trips)
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
            برمجة وتحديث حالة الرحلات لكل خط من خطوط شبكة القطارات
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          disabled={!selectedLineId}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: !selectedLineId ? '#64748B' : '#2563EB',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: !selectedLineId ? 'not-allowed' : 'pointer',
          }}
        >
          + برمجة رحلة جديدة
        </button>
      </div>

      <ErrorMessage error={error} onClear={() => setError(null)} />

      {/* Required Line Selector Bar */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '14px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <label style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.95rem' }}>
          اختر الخط لعرض الرحلات (مطلوُب query line_id):
        </label>
        <select
          className="tt-select"
          value={selectedLineId || ''}
          onChange={(e) => setSelectedLineId(Number(e.target.value))}
          style={{
            flex: 1,
            minWidth: '240px',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: '#0F172A',
            color: '#F8FAFC',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {lines.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} (ID: #{l.id})
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={trips}
        keyField="id"
        isLoading={isLoading}
        emptyText="لا توجد رحلات مبرمجة لهذا الخط حالياً"
        actions={(trip) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleOpenEditModal(trip)}
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
              تعديل الحالة/النوع
            </button>
            <button
              onClick={() => setDeletingId(trip.id)}
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
        title={editingTrip ? `تعديل الرحلة #${editingTrip.id}` : 'برمجة رحلة جديدة'}
      >
        <form onSubmit={handleSubmit}>
          {editingTrip && (
            <div
              style={{
                padding: '0.75rem',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                color: '#FBBF24',
                fontSize: '0.8rem',
                marginBottom: '1.25rem',
              }}
            >
              * تنبيه مواصفات النظام: التعديل يسمح فقط بتغيير (الحالة status / النوع tripType). لتغيير الخط أو القطار يجب حذف الرحلة وإعادة إنشائها.
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              الخط التابع للرحلة (line_id)
            </label>
            <select
              className="tt-select"
              disabled={!!editingTrip}
              value={form.line_id}
              onChange={(e) => setForm({ ...form, line_id: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: '#0F172A',
                color: '#F8FAFC',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            >
              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              القطار المخصص للرحلة (train_id)
            </label>
            <select
              className="tt-select"
              disabled={!!editingTrip}
              value={form.train_id}
              onChange={(e) => setForm({ ...form, train_id: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                background: '#0F172A',
                color: '#F8FAFC',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            >
              {trains.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.serial_number} (ID: #{t.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
                حالة الرحلة (status)
              </label>
              <select
                className="tt-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TripStatus })}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="working">شغالة (working)</option>
                <option value="not_working">غير شغالة (not_working)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
                نوع الرحلة (tripType)
              </label>
              <select
                className="tt-select"
                value={form.tripType}
                onChange={(e) => setForm({ ...form, tripType: e.target.value as TripType })}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="inter_Wilaya">بين الولايات (inter_Wilaya)</option>
                <option value="intra_Wilaya">داخل الولاية (intra_Wilaya)</option>
              </select>
            </div>
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
              {isSaving ? 'جاري الحفظ...' : editingTrip ? 'تحديث الرحلة' : 'إضافة الرحلة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف الرحلة"
        message="هل أنت تأكد من رغبتك في حذف هذه الرحلة وتواقيتها المسجلة؟"
        isLoading={isDeleting}
      />
    </div>
  );
}
