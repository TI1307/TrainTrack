// frontend/pages/TicketConfig.tsx
import { useEffect, useState } from 'react';
import type { TicketClass, TicketClassType, Station, PriceResponse } from '../src/types';
import { DataTable, type Column } from '../src/components/common/DataTable';
import { Modal } from '../src/components/common/Modal';
import { ConfirmModal } from '../src/components/common/ConfirmModal';
import { Badge } from '../src/components/common/Badge';
import { ErrorMessage } from '../src/components/common/ErrorMessage';
import { getTicketClasses, createTicketClass, updateTicketClass, deleteTicketClass, calculatePrice } from '../api/ticketConfig';
import { getStations } from '../api/station';


export default function TicketConfig() {
  const [ticketClasses, setTicketClasses] = useState<TicketClass[]>([]);
  const [stations, setStations] = useState<Station[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ticket Class Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TicketClass | null>(null);
  const [form, setForm] = useState<{ classtype: TicketClassType; Rate_Per_Km: number }>({
    classtype: 'first_class',
    Rate_Per_Km: 4.5,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Price Calculator State
  const [calcFromStationId, setCalcFromStationId] = useState<number>(1);
  const [calcToStationId, setCalcToStationId] = useState<number>(5);
  const [calcTicketClassId, setCalcTicketClassId] = useState<number>(1);
  const [calcResult, setCalcResult] = useState<PriceResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [tcList, stList] = await Promise.all([getTicketClasses(), getStations()]);
      setTicketClasses(tcList);
      setStations(stList);

      if (stList.length > 1) {
        setCalcFromStationId(stList[0].id);
        setCalcToStationId(stList[stList.length - 1].id);
      }
      if (tcList.length > 0) {
        setCalcTicketClassId(tcList[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل بيانات فئات التذاكر');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setForm({ classtype: 'economy', Rate_Per_Km: 3.0 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tc: TicketClass) => {
    setEditingClass(tc);
    setForm({ classtype: tc.classtype, Rate_Per_Km: tc.Rate_Per_Km });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (editingClass) {
        await updateTicketClass(editingClass.id, { classtype: form.classtype, Rate_Per_Km: Number(form.Rate_Per_Km) });
      } else {
        await createTicketClass({
          classtype: form.classtype,
          Rate_Per_Km: Number(form.Rate_Per_Km),
        });
      }
      setIsModalOpen(false);
      await fetchInitialData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حفظ فئة التذكرة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTicketClass(deletingId);
      setDeletingId(null);
      await fetchInitialData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حذف فئة التذكرة');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCalculatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calcFromStationId === calcToStationId) {
      setCalcError('يرجى اختيار محطتين مختلفين للحساب');
      return;
    }
    setIsCalculating(true);
    setCalcError(null);
    try {
      const res = await calculatePrice({
        from_station_id: calcFromStationId,
        to_station_id: calcToStationId,
        ticket_class_id: calcTicketClassId,
      });
      setCalcResult(res);
    } catch (err: unknown) {
      setCalcError(err instanceof Error ? err.message : 'فشل حساب سعر التذكرة');
    } finally {
      setIsCalculating(false);
    }
  };

  const columns: Column<TicketClass>[] = [
    { key: 'id', header: 'المعرف ID' },
    {
      key: 'classtype',
      header: 'درجة التذكرة (classtype)',
      render: (tc) =>
        tc.classtype === 'first_class' ? (
          <Badge type="primary">الدرجة الأولى (first_class)</Badge>
        ) : (
          <Badge type="info">الدرجة الاقتصادية (economy)</Badge>
        ),
    },
    {
      key: 'Rate_Per_Km',
      header: 'السعر للكلم (Rate_Per_Km)',
      render: (tc) => <span style={{ fontWeight: 700, color: '#34D399' }}>{tc.Rate_Per_Km} د.ج / كم</span>,
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
            إعدادات التذاكر والأسعار (Ticket Config)
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
            تحديد فئات التذاكر وسعر الكيلومتر بالإضافة إلى حاسبة تسعير المسافات
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
          + إضافة درجة تذكرة جديدة
        </button>
      </div>

      <ErrorMessage error={error} onClear={() => setError(null)} />

      {/* Grid Layout: Panel A = Ticket Classes, Panel B = Price Calculator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Panel A: Ticket Classes Table */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#CBD5E1' }}>
            فئات الدرجات المسجلة
          </h3>
          <DataTable
            columns={columns}
            data={ticketClasses}
            keyField="id"
            isLoading={isLoading}
            searchPlaceholder="بحث في الفئات..."
            actions={(tc) => (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  onClick={() => handleOpenEditModal(tc)}
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
                  onClick={() => setDeletingId(tc.id)}
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
        </div>

        {/* Panel B: Fare Calculator */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '16px',
            padding: '1.75rem',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.35rem 0', color: '#CBD5E1' }}>
            حاسبة أسعار التذاكر (Price Calculator)
          </h3>
          <p style={{ color: '#94A3B8', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
            اختبر وحسب السعر التقديري بين محطتين حسَب مسافة السكة وفئة التذكرة
          </p>

          <ErrorMessage error={calcError} onClear={() => setCalcError(null)} />

          <form onSubmit={handleCalculatePrice}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                محطة الانطلاق (from_station_id)
              </label>
              <select
                className="tt-select"
                value={calcFromStationId}
                onChange={(e) => setCalcFromStationId(Number(e.target.value))}
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
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                محطة الوصول (to_station_id)
              </label>
              <select
                className="tt-select"
                value={calcToStationId}
                onChange={(e) => setCalcToStationId(Number(e.target.value))}
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

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '0.35rem' }}>
                فئة التذكرة (ticket_class_id)
              </label>
              <select
                className="tt-select"
                value={calcTicketClassId}
                onChange={(e) => setCalcTicketClassId(Number(e.target.value))}
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
                {ticketClasses.map((tc) => (
                  <option key={tc.id} value={tc.id}>
                    {tc.classtype === 'first_class' ? 'الدرجة الأولى' : 'الدرجة الاقتصادية'} ({tc.Rate_Per_Km} د.ج/كم)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isCalculating}
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '8px',
                background: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: isCalculating ? 'not-allowed' : 'pointer',
              }}
            >
              {isCalculating ? 'جاري حساب السعر...' : 'أحسب السعر والتكلفة'}
            </button>
          </form>

          {/* Calculator Output Result Card */}
          {calcResult && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                animation: 'slideDown 0.3s ease-out',
              }}
            >
              <div style={{ color: '#34D399', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                نتيجة حساب سعر التذكرة:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.775rem', color: '#94A3B8' }}>المسافة المقطوعة (distance_km)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>
                    {calcResult.distance_km} كم
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.775rem', color: '#94A3B8' }}>السعر الإجمالي (price)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>
                    {calcResult.price} د.ج
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'تعديل سعر فئة التذكرة' : 'إضافة درجة تذكرة جديدة'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              نوع الدرجة (classtype)
            </label>
            <select
              className="tt-select"
              value={form.classtype}
              onChange={(e) => setForm({ ...form, classtype: e.target.value as TicketClassType })}
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
              <option value="first_class">الدرجة الأولى (first_class)</option>
              <option value="economy">الدرجة الاقتصادية (economy)</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              السعر لكل كيلومتر (Rate_Per_Km بالدينار)
            </label>
            <input
              type="number"
              step="any"
              className="tt-input"
              required
              value={form.Rate_Per_Km}
              onChange={(e) => setForm({ ...form, Rate_Per_Km: parseFloat(e.target.value) || 0 })}
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
              {isSaving ? 'جاري الحفظ...' : editingClass ? 'تحديث الفئة' : 'إضافة الفئة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف فئة التذكرة"
        message="هل أنت تأكد من رغبتك في حذف هذه الفئة من نظام التسعير؟"
        isLoading={isDeleting}
      />
    </div>
  );
}
