// frontend/pages/Scheduler.tsx
import { useEffect, useState } from 'react';
import type { Scheduler, Line, Trip, Station, Train } from '../src/types';
import {getSchedulers ,createScheduler , updateScheduler , deleteScheduler} from '../api/scheduler';
import {getLines} from '../api/line';
import {getStations} from '../api/station';
import {getTrains} from '../api/train';
import {getTrips} from '../api/trip';

import { DataTable, type Column } from '../src/components/common/DataTable';
import { Modal } from '../src/components/common/Modal';
import { ConfirmModal } from '../src/components/common/ConfirmModal';
import { ErrorMessage } from '../src/components/common/ErrorMessage';

export default function SchedulerPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);

  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const [tripsForLine, setTripsForLine] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  const [schedulers, setSchedulers] = useState<Scheduler[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheduler, setEditingScheduler] = useState<Scheduler | null>(null);
  const [form, setForm] = useState({
    station_id: 1,
    order: 1,
    arrival_time: '08:00:00',
    departure_time: '08:10:00',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [lnList, stList, trList] = await Promise.all([
        getLines(),
        getStations(),
        getTrains(),
      ]);
      setLines(lnList);
      setStations(stList);
      setTrains(trList);

      if (lnList.length > 0 && selectedLineId === null) {
        setSelectedLineId(lnList[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل بيانات الجدولة الأساسية');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // When line changes, fetch its trips and set default trip
  useEffect(() => {
    async function updateTrips() {
      if (selectedLineId !== null) {
        const trps = await getTrips(selectedLineId);
        setTripsForLine(trps);
        if (trps.length > 0) {
          setSelectedTripId(trps[0].id);
        } else {
          setSelectedTripId(null);
          setSchedulers([]);
        }
      }
    }
    updateTrips();
  }, [selectedLineId]);

  // Fetch scheduler table whenever selectedTripId changes
  const fetchSchedulers = async (tripId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSchedulers(tripId);
      setSchedulers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل مواعيد الرحلة');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTripId !== null) {
      fetchSchedulers(selectedTripId);
    } else {
      setSchedulers([]);
    }
  }, [selectedTripId]);

  const handleOpenAddModal = () => {
    if (!selectedTripId) return;
    setEditingScheduler(null);
    setForm({
      station_id: stations[0]?.id || 1,
      order: schedulers.length + 1,
      arrival_time: '08:00:00',
      departure_time: '08:10:00',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sch: Scheduler) => {
    setEditingScheduler(sch);
    setForm({
      station_id: sch.station_id,
      order: sch.order,
      arrival_time: sch.arrival_time,
      departure_time: sch.departure_time,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) return;
    setIsSaving(true);
    setError(null);

    const formatTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

    try {
      if (editingScheduler) {
        await updateScheduler(editingScheduler.id, {
          order: Number(form.order),
          arrival_time: formatTime(form.arrival_time),
          departure_time: formatTime(form.departure_time),
        });
      } else {
        await createScheduler({
          trip_id: selectedTripId,
          station_id: Number(form.station_id),
          order: Number(form.order),
          arrival_time: formatTime(form.arrival_time),
          departure_time: formatTime(form.departure_time),
        });
      }
      setIsModalOpen(false);
      await fetchSchedulers(selectedTripId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حفظ التوقيت');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId || !selectedTripId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteScheduler(deletingId);
      setDeletingId(null);
      await fetchSchedulers(selectedTripId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حذف التوقيت');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Scheduler>[] = [
    { key: 'order', header: 'الترتيب (Order)', render: (s) => <span style={{ fontWeight: 700, color: '#38BDF8' }}>#{s.order}</span> },
    {
      key: 'station',
      header: 'اسم المحطة',
      render: (s) => {
        const st = stations.find((item) => item.id === s.station_id);
        return st ? st.name : `محطة #${s.station_id}`;
      },
    },
    { key: 'arrival_time', header: 'توقيت الوصول (arrival_time)', render: (s) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.arrival_time}</span> },
    { key: 'departure_time', header: 'توقيت المغادرة (departure_time)', render: (s) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.departure_time}</span> },
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
            جدول مواعيد الرحلات (Scheduler)
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
            تحديد أوقات الوصول والمغادرة لكل محطة بالترتيب لضبط الرحلة
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          disabled={!selectedTripId}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            background: !selectedTripId ? '#64748B' : '#2563EB',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: !selectedTripId ? 'not-allowed' : 'pointer',
          }}
        >
          + إضافة موعد محطة للرحلة
        </button>
      </div>

      <ErrorMessage error={error} onClear={() => setError(null)} />

      {/* Selectors Bar */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '14px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            1. اختر الخط:
          </label>
          <select
            className="tt-select"
            value={selectedLineId || ''}
            onChange={(e) => setSelectedLineId(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
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

        <div>
          <label style={{ display: 'block', fontWeight: 600, color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            2. اختر الرحلة (مطلوب query trip_id):
          </label>
          <select
            className="tt-select"
            value={selectedTripId || ''}
            disabled={tripsForLine.length === 0}
            onChange={(e) => setSelectedTripId(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: '#0F172A',
              color: '#F8FAFC',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          >
            {tripsForLine.length === 0 ? (
              <option value="">لا توجد رحلات لهذا الخط</option>
            ) : (
              tripsForLine.map((t) => {
                const tr = trains.find((item) => item.id === t.train_id);
                return (
                  <option key={t.id} value={t.id}>
                    رحلة #{t.id} - قطار ({tr ? tr.serial_number : t.train_id})
                  </option>
                );
              })
            )}
          </select>
        </div>
      </div>

      {!selectedTripId ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
          يرجى اختيار رحلة لعرض وإدارة مواعيد توقف المحطات
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={schedulers}
          keyField="id"
          isLoading={isLoading}
          searchPlaceholder="بحث في مواعيد المحطات..."
          emptyText="لا توجد مواعيد مبرمجة لهذه الرحلة بعد"
          actions={(sch) => (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={() => handleOpenEditModal(sch)}
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
                تعديل الموعد
              </button>
              <button
                onClick={() => setDeletingId(sch.id)}
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
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingScheduler ? 'تعديل توقيت المحطة' : 'إضافة موعد محطة للرحلة'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              المحطة (station_id)
            </label>
            <select
              className="tt-select"
              disabled={!!editingScheduler}
              value={form.station_id}
              onChange={(e) => setForm({ ...form, station_id: Number(e.target.value) })}
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
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              ترتيب التوقف (order)
            </label>
            <input
              type="number"
              className="tt-input"
              required
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
                توقيت الوصول (arrival_time)
              </label>
              <input
                type="text"
                className="tt-input"
                required
                placeholder="08:00:00"
                value={form.arrival_time}
                onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
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

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
                توقيت المغادرة (departure_time)
              </label>
              <input
                type="text"
                className="tt-input"
                required
                placeholder="08:10:00"
                value={form.departure_time}
                onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
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
              {isSaving ? 'جاري الحفظ...' : editingScheduler ? 'تحديث الموعد' : 'حفظ الموعد'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف توقيت المحطة"
        message="هل أنت تأكد من رغبتك في حذف هذا التوقيت من جدول الرحلة؟"
        isLoading={isDeleting}
      />
    </div>
  );
}
