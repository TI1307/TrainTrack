// frontend/pages/Lines.tsx
import { useEffect, useState } from 'react';
import type { Line, LineStation, LineGeometry, Station } from '../src/types';
import { getStations } from '../api/station';
import { getLineGeometry, createLineGeometry, updateLineGeometry, deleteLineGeometry } from '../api/line_geometry';
import { getLineStations, createLineStation, updateLineStation, deleteLineStation } from '../api/line_station';
import { getLines, createLine, updateLine, deleteLine } from '../api/line';

import { Modal } from '../src/components/common/Modal';
import { ConfirmModal } from '../src/components/common/ConfirmModal';
import { ErrorMessage } from '../src/components/common/ErrorMessage';
import { GeometryMapPicker } from '../src/components/common/GeometryMapPicker';
import { getErrorMessage, type ApiError } from '../src/utils/errors';


export default function Lines() {
  const [lines, setLines] = useState<Line[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'stations' | 'geometry'>('details');

  const [lineStations, setLineStations] = useState<LineStation[]>([]);
  const [lineGeometry, setLineGeometry] = useState<LineGeometry[]>([]);

  const [error, setError] = useState<ApiError | null>(null);

  // Line Modal
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);
  const [lineForm, setLineForm] = useState({ name: '', length: 100.0 });

  // Station Link Modal
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [editingStationLink, setEditingStationLink] = useState<LineStation | null>(null);
  const [stationLinkForm, setStationLinkForm] = useState({
    station_name: '',
    order: 1,
    distance: 0.0,
  });

  // Geometry Point Modal
  const [isGeometryModalOpen, setIsGeometryModalOpen] = useState(false);
  const [editingGeometryPt, setEditingGeometryPt] = useState<LineGeometry | null>(null);
  const [geometryForm, setGeometryForm] = useState({ sequence: 1, latitude: 36.75, longitude: 3.05 });

  // Delete Modals
  const [deletingType, setDeletingType] = useState<'line' | 'station' | 'geometry' | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<{ id?: number; station_id?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBaseData = async () => {
    try {
      const [lnList, stList] = await Promise.all([getLines(), getStations()]);
      setLines(lnList);
      setStations(stList);
      if (lnList.length > 0 && selectedLineId === null) {
        setSelectedLineId(lnList[0].id);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err,  'خطأ في تحميل الخطوط'));
    }
  };

  const fetchLineSubDetails = async (lineId: number) => {
    try {
      const [ls, lg] = await Promise.all([
        getLineStations(lineId),
        getLineGeometry(lineId),
      ]);
      setLineStations(ls);
      setLineGeometry(lg);
    } catch (err: unknown) {
      setError(getErrorMessage(err,  'خطأ في تحميل تفاصيل الخط'));
    }
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (selectedLineId !== null) {
      fetchLineSubDetails(selectedLineId);
    }
  }, [selectedLineId]);

  const currentSelectedLine = lines.find((l) => l.id === selectedLineId);

  // --- Line Handlers ---
  const handleOpenAddLine = () => {
    setEditingLine(null);
    setLineForm({ name: '', length: 100.0 });
    setIsLineModalOpen(true);
  };
  const handleOpenEditLine = (l: Line) => {
    setEditingLine(l);
    setLineForm({ name: l.name, length: l.length });
    setIsLineModalOpen(true);
  };
  const handleLineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineForm.name.trim()) return setError('اسم الخط مطلوب');
    try {
      if (editingLine) {
        await updateLine(editingLine.id, { name: lineForm.name, length: Number(lineForm.length) });
      } else {
        const created = await createLine({ name: lineForm.name, length: Number(lineForm.length) });
        setSelectedLineId(created.id);
      }
      setIsLineModalOpen(false);
      await fetchBaseData();
    } catch (err: unknown) {
      setError(getErrorMessage(err,  'فشل حفظ الخط'));
    }
  };

  // --- Line Station Handlers ---
  const handleOpenAddStationLink = () => {
    setEditingStationLink(null);
    setStationLinkForm({
      station_name: stations[0]?.name || '',
      order: lineStations.length + 1,
      distance: 0.0,
    });
    setIsStationModalOpen(true);
  };
  const handleOpenEditStationLink = (ls: LineStation) => {
    setEditingStationLink(ls);
    const st = stations.find((s) => s.id === ls.station_id);
    setStationLinkForm({
      station_name: st?.name || '',
      order: ls.order,
      distance: ls.distance,
    });
    setIsStationModalOpen(true);
  };
  const handleStationLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedLine) return;
    try {
      if (editingStationLink) {
        await updateLineStation(currentSelectedLine.id, editingStationLink.station_id, {
          order: Number(stationLinkForm.order),
          distance: Number(stationLinkForm.distance)
        });
      } else {
        await createLineStation({
          line_name: currentSelectedLine.name,
          station_name: stationLinkForm.station_name,
          order: Number(stationLinkForm.order),
          distance: Number(stationLinkForm.distance),
        });
      }
      setIsStationModalOpen(false);
      await fetchLineSubDetails(currentSelectedLine.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err,  'فشل حفظ محطة الخط'));
    }
  };

  // --- Line Geometry Handlers ---
  const handleOpenAddGeometry = () => {
    setEditingGeometryPt(null);
    const lastPt = lineGeometry[lineGeometry.length - 1];
    setGeometryForm({
      sequence: lineGeometry.length + 1,
      latitude: lastPt ? lastPt.latitude + 0.05 : 36.75,
      longitude: lastPt ? lastPt.longitude + 0.05 : 3.05,
    });
    setIsGeometryModalOpen(true);
  };
  const handleOpenEditGeometry = (lg: LineGeometry) => {
    setEditingGeometryPt(lg);
    setGeometryForm({
      sequence: lg.sequence,
      latitude: lg.latitude,
      longitude: lg.longitude,
    });
    setIsGeometryModalOpen(true);
  };
  const handleGeometrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedLine) return;
    try {
      if (editingGeometryPt) {
        await updateLineGeometry(editingGeometryPt.id, {
          sequence: Number(geometryForm.sequence),
          latitude: Number(geometryForm.latitude),
          longitude: Number(geometryForm.longitude),
        });
      } else {
        await createLineGeometry({
          line_name: currentSelectedLine.name,
          sequence: Number(geometryForm.sequence),
          latitude: Number(geometryForm.latitude),
          longitude: Number(geometryForm.longitude),
        });
      }
      setIsGeometryModalOpen(false);
      await fetchLineSubDetails(currentSelectedLine.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل حفظ نقطة المسار'));
    }
  };

  // --- Delete Handler ---
  const handleConfirmDelete = async () => {
    if (!deletingType || !currentSelectedLine) return;
    setIsDeleting(true);
    try {
      if (deletingType === 'line') {
        await deleteLine(currentSelectedLine.id);
        setSelectedLineId(null);
        await fetchBaseData();
      } else if (deletingType === 'station' && deletingTarget?.station_id) {
        await deleteLineStation(currentSelectedLine.id, deletingTarget.station_id);
        await fetchLineSubDetails(currentSelectedLine.id);
      } else if (deletingType === 'geometry' && deletingTarget?.id) {
        await deleteLineGeometry(deletingTarget.id);
        await fetchLineSubDetails(currentSelectedLine.id);
      }
      setDeletingType(null);
      setDeletingTarget(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'فشل عملية الحذف'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
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
            الخطوط والمسارات (Lines & Routes)
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.875rem' }}>
            إدارة خطوط السكك الحديدية، ترتيب المحطات، وإحداثيات الخريطة الجغرافية
          </p>
        </div>

        <button
          onClick={handleOpenAddLine}
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
          + إضافة خط جديد
        </button>
      </div>

      <ErrorMessage error={error} onClear={() => setError(null)} />

      {/* Top Line Selector */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '14px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <label style={{ fontWeight: 600, color: '#CBD5E1', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            اختر الخط الحالي:
          </label>
          <select
            className="tt-select"
            value={selectedLineId || ''}
            onChange={(e) => setSelectedLineId(Number(e.target.value))}
            style={{
              flex: 1,
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
                {l.name} (الطول: {l.length} كم)
              </option>
            ))}
          </select>
        </div>

        {currentSelectedLine && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleOpenEditLine(currentSelectedLine)}
              style={{
                padding: '0.45rem 0.875rem',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60A5FA',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              تعديل الخط
            </button>
            <button
              onClick={() => {
                setDeletingType('line');
                setDeletingTarget(null);
              }}
              style={{
                padding: '0.45rem 0.875rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              حذف الخط بالكامل
            </button>
          </div>
        )}
      </div>

      {!currentSelectedLine ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>يرجى إدخال أو اختيار خط للبدء</div>
      ) : (
        <>
          {/* Sub-tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
              marginBottom: '1.5rem',
            }}
          >
            <button
              onClick={() => setActiveTab('details')}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'details' ? '3px solid #3B82F6' : '3px solid transparent',
                color: activeTab === 'details' ? '#3B82F6' : '#94A3B8',
                fontWeight: activeTab === 'details' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              1. تفاصيل الخط الرئيسية
            </button>
            <button
              onClick={() => setActiveTab('stations')}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'stations' ? '3px solid #3B82F6' : '3px solid transparent',
                color: activeTab === 'stations' ? '#3B82F6' : '#94A3B8',
                fontWeight: activeTab === 'stations' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              2. ترتيب وتتابع المحطات ({lineStations.length})
            </button>
            <button
              onClick={() => setActiveTab('geometry')}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'geometry' ? '3px solid #3B82F6' : '3px solid transparent',
                color: activeTab === 'geometry' ? '#3B82F6' : '#94A3B8',
                fontWeight: activeTab === 'geometry' ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              3. نقاط المسار والجغرافيا ({lineGeometry.length})
            </button>
          </div>

          {/* TAB 1: Line Details */}
          {activeTab === 'details' && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.25rem 0', color: '#F8FAFC' }}>
                بيانات الخط الحالي
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginBottom: '0.35rem' }}>معرف الخط (ID)</div>
                  <div style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 700 }}>#{currentSelectedLine.id}</div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginBottom: '0.35rem' }}>اسم الخط الرسمي (name)</div>
                  <div style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 700 }}>{currentSelectedLine.name}</div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginBottom: '0.35rem' }}>طول الخط الإجمالي (length)</div>
                  <div style={{ color: '#38BDF8', fontSize: '1.25rem', fontWeight: 700 }}>{currentSelectedLine.length} كم</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Station Ordering */}
          {activeTab === 'stations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
                  ترتيب ومسافات المحطات على هذا الخط
                </h3>
                <button
                  onClick={handleOpenAddStationLink}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: '#2563EB',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  + ربط محطة بالخط
                </button>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '14px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94A3B8' }}>الترتيب (Order)</th>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94A3B8' }}>المحطة</th>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94A3B8' }}>المسافة من البداية (Distance)</th>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94A3B8', textAlign: 'center' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineStations.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                          لا توجد محطات مرتبطة بهذا الخط بعد
                        </td>
                      </tr>
                    ) : (
                      lineStations.map((ls) => {
                        const st = stations.find((s) => s.id === ls.station_id);
                        return (
                          <tr key={`${ls.line_id}-${ls.station_id}`} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: '#60A5FA' }}>#{ls.order}</td>
                            <td style={{ padding: '0.875rem 1.25rem', color: '#F8FAFC', fontWeight: 600 }}>{st ? st.name : `محطة #${ls.station_id}`}</td>
                            <td style={{ padding: '0.875rem 1.25rem', color: '#E2E8F0' }}>{ls.distance} كم</td>
                            <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                <button
                                  onClick={() => handleOpenEditStationLink(ls)}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '6px',
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    color: '#60A5FA',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingType('station');
                                    setDeletingTarget({ station_id: ls.station_id });
                                  }}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '6px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#F87171',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  إزالة
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Geometry Points */}
          {activeTab === 'geometry' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
                  نقاط الجغرافيا المكونة لرسم المسار (Map Geometry)
                </h3>
                <button
                  onClick={handleOpenAddGeometry}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: '#2563EB',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  + إضافة نقطة مسار
                </button>
              </div>

              {/* Visual Map Route Preview */}
              <GeometryMapPicker
                points={lineGeometry}
                lineName={currentSelectedLine.name}
                onAddPoint={async (lat, lng, sequence) => {
                  try {
                    await createLineGeometry({
                      line_name: currentSelectedLine.name,
                      sequence,
                      latitude: lat,
                      longitude: lng,
                    });
                    await fetchLineSubDetails(currentSelectedLine.id);
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'فشل حفظ النقطة');
                  }
                }}
                onDeletePoint={(id) => {
                  setDeletingType('geometry');
                  setDeletingTarget({ id });
                }}
              />

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '14px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94A3B8' }}>التسلسل (Sequence)</th>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94A3B8' }}>خط العرض (Latitude)</th>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94A3B8' }}>خط الطول (Longitude)</th>
                      <th style={{ padding: '0.875rem 1.25rem', color: '#94A3B8', textAlign: 'center' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineGeometry.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                          لا توجد نقاط مسار مسجلة لهذا الخط
                        </td>
                      </tr>
                    ) : (
                      lineGeometry.map((lg) => (
                        <tr key={lg.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                          <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: '#C084FC' }}>#{lg.sequence}</td>
                          <td style={{ padding: '0.875rem 1.25rem', color: '#E2E8F0' }}>{lg.latitude}</td>
                          <td style={{ padding: '0.875rem 1.25rem', color: '#E2E8F0' }}>{lg.longitude}</td>
                          <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleOpenEditGeometry(lg)}
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  background: 'rgba(59, 130, 246, 0.15)',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  color: '#60A5FA',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                }}
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() => {
                                  setDeletingType('geometry');
                                  setDeletingTarget({ id: lg.id });
                                }}
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#F87171',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                }}
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Line Add/Edit Modal */}
      <Modal isOpen={isLineModalOpen} onClose={() => setIsLineModalOpen(false)} title={editingLine ? 'تعديل بيانات الخط' : 'إضافة خط جديد'}>
        <form onSubmit={handleLineSubmit}>
            <ErrorMessage error={error} onClear={() => setError(null)} />
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>اسم الخط (name)</label>
            <input
              type="text"
              className="tt-input"
              required
              placeholder="مثال: خط الجزائر - عنابة"
              value={lineForm.name}
              onChange={(e) => setLineForm({ ...lineForm, name: e.target.value })}
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
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>الطول الإجمالي بالكلم (length)</label>
            <input
              type="number"
              step="any"
              className="tt-input"
              required
              value={lineForm.length}
              onChange={(e) => setLineForm({ ...lineForm, length: parseFloat(e.target.value) || 0 })}
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
            <button type="button" onClick={() => setIsLineModalOpen(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#CBD5E1', cursor: 'pointer' }}>إلغاء</button>
            <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#2563EB', border: 'none', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}>حفظ الخط</button>
          </div>
        </form>
      </Modal>

      {/* Station Link Modal */}
      <Modal isOpen={isStationModalOpen} onClose={() => setIsStationModalOpen(false)} title={editingStationLink ? 'تعديل ترتيب المحطة على الخط' : 'إضافة محطة للخط'}>
        <form onSubmit={handleStationLinkSubmit}>
            <ErrorMessage error={error} onClear={() => setError(null)} />
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>المحطة المراد ربطها (station_name)</label>
            <select
              className="tt-select"
              disabled={!!editingStationLink}
              value={stationLinkForm.station_name}
              onChange={(e) => setStationLinkForm({ ...stationLinkForm, station_name: e.target.value })}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: '#0F172A', color: '#F8FAFC', fontSize: '0.875rem', boxSizing: 'border-box' }}
            >
              {stations.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>الترتيب (order)</label>
              <input
                type="number"
                className="tt-input"
                required
                value={stationLinkForm.order}
                onChange={(e) => setStationLinkForm({ ...stationLinkForm, order: parseInt(e.target.value) || 1 })}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: 'rgba(255, 255, 255, 0.05)', color: '#F8FAFC', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>المسافة (distance كم)</label>
              <input
                type="number"
                step="any"
                className="tt-input"
                required
                value={stationLinkForm.distance}
                onChange={(e) => setStationLinkForm({ ...stationLinkForm, distance: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: 'rgba(255, 255, 255, 0.05)', color: '#F8FAFC', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setIsStationModalOpen(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#CBD5E1', cursor: 'pointer' }}>إلغاء</button>
            <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#2563EB', border: 'none', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}>تأكيد الربط</button>
          </div>
        </form>
      </Modal>

      {/* Line Geometry Modal */}
      <Modal isOpen={isGeometryModalOpen} onClose={() => setIsGeometryModalOpen(false)} title={editingGeometryPt ? 'تعديل نقطة مسار الجغرافيا' : 'إضافة نقطة جغرافية جديدة'}>
        <form onSubmit={handleGeometrySubmit}>
          <ErrorMessage error={error} onClear={() => setError(null)} />
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>التسلسل (sequence)</label>
            <input
              type="number"
              className="tt-input"
              required
              value={geometryForm.sequence}
              onChange={(e) => setGeometryForm({ ...geometryForm, sequence: parseInt(e.target.value) || 1 })}
              style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: 'rgba(255, 255, 255, 0.05)', color: '#F8FAFC', fontSize: '0.875rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>خط العرض (latitude)</label>
              <input
                type="number"
                step="any"
                className="tt-input"
                required
                value={geometryForm.latitude}
                onChange={(e) => setGeometryForm({ ...geometryForm, latitude: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: 'rgba(255, 255, 255, 0.05)', color: '#F8FAFC', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#CBD5E1', marginBottom: '0.375rem' }}>خط الطول (longitude)</label>
              <input
                type="number"
                step="any"
                className="tt-input"
                required
                value={geometryForm.longitude}
                onChange={(e) => setGeometryForm({ ...geometryForm, longitude: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.3)', background: 'rgba(255, 255, 255, 0.05)', color: '#F8FAFC', fontSize: '0.875rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setIsGeometryModalOpen(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#CBD5E1', cursor: 'pointer' }}>إلغاء</button>
            <button type="submit" style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#2563EB', border: 'none', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}>حفظ النقطة</button>
          </div>
        </form>
      </Modal>

      {/* General Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingType}
        onClose={() => setDeletingType(null)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message={
          deletingType === 'line'
            ? 'هل أنت تأكد من رغبتك في حذف الخط بأكمله ومحطاته ونقاطه؟'
            : deletingType === 'station'
              ? 'هل أنت تأكد من إزالة هذه المحطة من الخط؟'
              : 'هل أنت تأكد من حذف نقطة المسار هذه؟'
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
