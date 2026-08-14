// frontend/pages/Stations.tsx
import { useEffect, useState } from 'react';
import type { Station, Wilaya } from '../src/types';
import {getWilayas } from '../api/wilaya';
import {getStations ,createStation , updateStation , deleteStation} from '../api/station';
import { DataTable, type Column } from '../src/components/common/DataTable';
import { Modal } from '../src/components/common/Modal';
import { ConfirmModal } from '../src/components/common/ConfirmModal';
import { ErrorMessage } from '../src/components/common/ErrorMessage';
import { getErrorMessage, type ApiError } from '../src/utils/errors';

export default function Stations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState<number | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState({ name: '', latitude: 36.75, longitude: 3.05, wilaya_id: 16 });
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [stList, wlList] = await Promise.all([getStations(), getWilayas()]);
      setStations(stList);
      setWilayas(wlList);
      if (wlList.length > 0 && !editingStation) {
        setFormData((prev) => ({ ...prev, wilaya_id: wlList[0].id }));
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'خطأ في تحميل البيانات'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStation(null);
    setFormData({ name: '', latitude: 36.75, longitude: 3.05, wilaya_id: wilayas[0]?.id || 16 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (station: Station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      wilaya_id: station.wilaya_id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('اسم المحطة مطلوب');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      if (editingStation) {
        await updateStation(editingStation.id, {
          name: formData.name,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          wilaya_id: Number(formData.wilaya_id),
        });
      } else {
        await createStation({
          name: formData.name,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          wilaya_id: Number(formData.wilaya_id),
        });
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل حفظ المحطة'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteStation(deletingId);
      setDeletingId(null);
      await fetchData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل حذف المحطة'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStations = stations.filter((s) => {
    if (selectedWilayaFilter === 'all') return true;
    return s.wilaya_id === Number(selectedWilayaFilter);
  });

  const columns: Column<Station>[] = [
    { key: 'id', header: 'المعرف ID' },
    { key: 'name', header: 'اسم المحطة' },
    {
      key: 'wilaya',
      header: 'الولاية',
      render: (st) => {
        const w = wilayas.find((item) => item.id === st.wilaya_id);
        return w ? `${w.name} (${w.id})` : `ولاية #${st.wilaya_id}`;
      },
      searchValue: (st) => wilayas.find((w) => w.id === st.wilaya_id)?.name || '',
    },
    {
      key: 'coords',
      header: 'الإحداثيات الجغرافية (Lat, Lng)',
      render: (st) => `${st.latitude.toFixed(4)}, ${st.longitude.toFixed(4)}`,
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
            إدارة المحطات (Stations)
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
            عرض، إضافة، تعديل وحذف محطات قطارات الشبكة الوطنية
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="tt-select"
            value={selectedWilayaFilter}
            onChange={(e) =>
              setSelectedWilayaFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              background: '#0F172A',
              color: '#F8FAFC',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">كل الولايات</option>
            {wilayas.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.id})
              </option>
            ))}
          </select>

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
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            + إضافة محطة جديدة
          </button>
        </div>
      </div>

      <ErrorMessage error={error} onClear={() => setError(null)} />

      <DataTable
        columns={columns}
        data={filteredStations}
        keyField="id"
        isLoading={isLoading}
        searchPlaceholder="بحث عن محطة بالاسم..."
        actions={(st) => (
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => handleOpenEditModal(st)}
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
              onClick={() => setDeletingId(st.id)}
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
        title={editingStation ? 'تعديل بيانات المحطة' : 'إضافة محطة جديدة'}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              اسم المحطة
            </label>
            <input
              type="text"
              className="tt-input"
              required
              placeholder="مثال: محطة وهران المركزية"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
              الولاية
            </label>
            <select
              className="tt-select"
              value={formData.wilaya_id}
              onChange={(e) => setFormData({ ...formData, wilaya_id: Number(e.target.value) })}
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
              {wilayas.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.id})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>
                خط العرض Latitude
              </label>
              <input
                type="number"
                step="any"
                className="tt-input"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
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
                خط الطول Longitude
              </label>
              <input
                type="number"
                step="any"
                className="tt-input"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
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
              {isSaving ? 'جاري الحفظ...' : editingStation ? 'تحديث البيانات' : 'إضافة المحطة'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="تأكيد حذف المحطة"
        message="هل أنت تأكد من رغبتك في حذف هذه المحطة؟ قد يؤثر ذلك على الرحلات المبرمجة بالخطوط."
        isLoading={isDeleting}
      />
    </div>
  );
}
