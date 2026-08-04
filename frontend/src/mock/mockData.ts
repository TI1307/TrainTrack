// frontend/src/mock/mockData.ts
import type {
  Station,
  Train,
  Wilaya,
  AdminUser,
  Line,
  LineStation,
  LineGeometry,
  Trip,
  Scheduler,
  Notice,
  TicketClass,
} from '../types';

export const initialWilayas: Wilaya[] = [
  { id: 16, name: 'الجزائر' },
  { id: 31, name: 'وهران' },
  { id: 25, name: 'قسنطينة' },
  { id: 23, name: 'عنابة' },
  { id: 19, name: 'سطيف' },
  { id: 9, name: 'البليدة' },
  { id: 2, name: 'الشلف' },
];

export const initialStations: Station[] = [
  { id: 1, name: 'محطة أغا (الجزائر)', latitude: 36.7645, longitude: 3.0583, wilaya_id: 16 },
  { id: 2, name: 'محطة الحراش', latitude: 36.7214, longitude: 3.1518, wilaya_id: 16 },
  { id: 3, name: 'محطة البليدة', latitude: 36.4719, longitude: 2.8277, wilaya_id: 9 },
  { id: 4, name: 'محطة الشلف', latitude: 36.1642, longitude: 1.3317, wilaya_id: 2 },
  { id: 5, name: 'محطة وهران المركزية', latitude: 35.7001, longitude: -0.6331, wilaya_id: 31 },
  { id: 6, name: 'محطة قسنطينة', latitude: 36.3650, longitude: 6.6147, wilaya_id: 25 },
  { id: 7, name: 'محطة عنابة', latitude: 36.9000, longitude: 7.7667, wilaya_id: 23 },
];

export const initialTrains: Train[] = [
  { id: 1, serial_number: 'TR-101 (كوراديا الزرقاء)' },
  { id: 2, serial_number: 'TR-102 (كوراديا الحمراء)' },
  { id: 3, serial_number: 'TR-201 (قطار السريع الشرق)' },
  { id: 4, serial_number: 'TR-202 (قطار الضواحي 1)' },
  { id: 5, serial_number: 'TR-305 (قطار البضائع)' },
];

export const initialAdminUsers: AdminUser[] = [
  { id: 1, username: 'admin', email: 'admin@traintrack.dz' },
  { id: 2, username: 'supervisor_oran', email: 'oran.admin@traintrack.dz' },
  { id: 3, username: 'supervisor_east', email: 'east.admin@traintrack.dz' },
];

export const initialLines: Line[] = [
  { id: 1, name: 'خط الجزائر - وهران', length: 421.5 },
  { id: 2, name: 'خط الجزائر - قسنطينة', length: 390.0 },
  { id: 3, name: 'خط ضواحي الجزائر (أغا - البليدة)', length: 50.0 },
];

export const initialLineStations: LineStation[] = [
  { line_id: 1, station_id: 1, order: 1, distance: 0.0 },
  { line_id: 1, station_id: 2, order: 2, distance: 10.5 },
  { line_id: 1, station_id: 3, order: 3, distance: 50.0 },
  { line_id: 1, station_id: 4, order: 4, distance: 210.0 },
  { line_id: 1, station_id: 5, order: 5, distance: 421.5 },
  { line_id: 3, station_id: 1, order: 1, distance: 0.0 },
  { line_id: 3, station_id: 2, order: 2, distance: 10.5 },
  { line_id: 3, station_id: 3, order: 3, distance: 50.0 },
];

export const initialLineGeometry: LineGeometry[] = [
  { id: 1, line_id: 1, sequence: 1, latitude: 36.7645, longitude: 3.0583 },
  { id: 2, line_id: 1, sequence: 2, latitude: 36.7214, longitude: 3.1518 },
  { id: 3, line_id: 1, sequence: 3, latitude: 36.4719, longitude: 2.8277 },
  { id: 4, line_id: 1, sequence: 4, latitude: 36.1642, longitude: 1.3317 },
  { id: 5, line_id: 1, sequence: 5, latitude: 35.7001, longitude: -0.6331 },
];

export const initialTrips: Trip[] = [
  { id: 1, line_id: 1, train_id: 1, status: 'working', tripType: 'inter_Wilaya' },
  { id: 2, line_id: 1, train_id: 2, status: 'working', tripType: 'inter_Wilaya' },
  { id: 3, line_id: 3, train_id: 4, status: 'working', tripType: 'intra_Wilaya' },
  { id: 4, line_id: 2, train_id: 3, status: 'not_working', tripType: 'inter_Wilaya' },
];

export const initialSchedulers: Scheduler[] = [
  { id: 1, trip_id: 1, station_id: 1, order: 1, arrival_time: '06:00:00', departure_time: '06:15:00' },
  { id: 2, trip_id: 1, station_id: 3, order: 2, arrival_time: '07:00:00', departure_time: '07:05:00' },
  { id: 3, trip_id: 1, station_id: 4, order: 3, arrival_time: '09:15:00', departure_time: '09:20:00' },
  { id: 4, trip_id: 1, station_id: 5, order: 4, arrival_time: '11:30:00', departure_time: '11:45:00' },
];

export const initialNotices: Notice[] = [
  {
    id: 1,
    line_id: 1,
    station_id: null,
    trip_id: null,
    message: 'أعمال صيانة برمجية وسكك حديدية على خط الجزائر - وهران قرب الشلف.',
    created_at: '2026-08-04 09:30:00',
  },
  {
    id: 2,
    line_id: null,
    station_id: 1,
    trip_id: null,
    message: 'افتتاح شباك التذاكر السريع في محطة أغا بالعاصمة.',
    created_at: '2026-08-04 11:00:00',
  },
];

export const initialTicketClasses: TicketClass[] = [
  { id: 1, classtype: 'first_class', Rate_Per_Km: 4.5 },
  { id: 2, classtype: 'economy', Rate_Per_Km: 2.8 },
];
