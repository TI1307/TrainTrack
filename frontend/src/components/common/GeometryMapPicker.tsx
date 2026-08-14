import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LineGeometry } from '../../types';
import 'leaflet/dist/leaflet.css';

type Props = {
  points: LineGeometry[];
  lineName: string;
  disabled?: boolean;
  onAddPoint: (lat: number, lng: number, sequence: number) => void;
  onDeletePoint: (id: number) => void;
};

function makeIcon(sequence: number) {
  return L.divIcon({
    html: `<div style="width:22px;height:22px;border-radius:50%;background:#2563EB;color:#fff;
      display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)">${sequence}</div>`,
    className: '',
    iconSize: [22, 22],
  });
}

function ClickHandler({ onAdd, disabled }: { onAdd: (lat: number, lng: number) => void; disabled?: boolean }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Leaflet measures its container once on mount — inside a tab, that size can
// be wrong or zero at that exact instant. This forces a re-measure shortly
// after mount, fixing the "puzzle with gaps" rendering bug.
function InvalidateOnShow() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export function GeometryMapPicker({ points , disabled, onAddPoint, onDeletePoint }: Props) {
  const sorted = [...points].sort((a, b) => a.sequence - b.sequence);
  const center: [number, number] = sorted.length > 0
    ? [sorted[0].latitude, sorted[0].longitude]
    : [36.75, 3.05];

  // The next free sequence is the highest one currently in use, plus one —
  // NOT just the count of points. Points can have gaps (a manual entry at
  // sequence 5 with only 3 points total), and using length+1 there would
  // recompute the same already-taken number on every click, causing a 409.
  const nextSequence = sorted.length > 0
    ? Math.max(...sorted.map((p) => p.sequence)) + 1
    : 1;

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(148, 163, 184, 0.25)' }}>
      <MapContainer center={center} zoom={12} style={{ height: '380px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <InvalidateOnShow />
        <ClickHandler onAdd={(lat, lng) => onAddPoint(lat, lng, nextSequence)} disabled={disabled} />

        {sorted.length > 1 && (
          <Polyline positions={sorted.map((p) => [p.latitude, p.longitude])} pathOptions={{ color: '#2E9E5B', weight: 4 }} />
        )}

        {sorted.map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={makeIcon(p.sequence)}
            eventHandlers={{
              contextmenu: () => {
                onDeletePoint(p.id);
              },
            }}
          />
        ))}
      </MapContainer>
      <div style={{ padding: '10px 14px', fontSize: '12px', color: '#94A3B8', background: 'rgba(15,23,42,0.6)' }}>
        {disabled
          ? 'جاري حفظ النقطة...'
          : 'انقر على الخريطة لإضافة نقطة جديدة بالتسلسل التالي · انقر بالزر الأيمن على نقطة لحذفها'}
      </div>
    </div>
  );
}