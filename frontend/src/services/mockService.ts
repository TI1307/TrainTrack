// frontend/src/services/mockService.ts
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
  PriceResponse,
  AccountStatus,
} from '../types';
import {
  initialStations,
  initialTrains,
  initialWilayas,
  initialAdminUsers,
  initialLines,
  initialLineStations,
  initialLineGeometry,
  initialTrips,
  initialSchedulers,
  initialNotices,
  initialTicketClasses,
} from '../mock/mockData';

// Helper to load/save from localStorage so state persists during app usage
function loadStorage<T>(key: string, initialValue: T): T {
  try {
    const saved = localStorage.getItem(`traintrack_${key}`);
    return saved ? JSON.parse(saved) : initialValue;
  } catch {
    return initialValue;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`traintrack_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
}

let stations: Station[] = loadStorage('stations', initialStations);
let trains: Train[] = loadStorage('trains', initialTrains);
let wilayas: Wilaya[] = loadStorage('wilayas', initialWilayas);
let adminUsers: AdminUser[] = loadStorage('adminUsers', initialAdminUsers);
let lines: Line[] = loadStorage('lines', initialLines);
let lineStations: LineStation[] = loadStorage('lineStations', initialLineStations);
let lineGeometry: LineGeometry[] = loadStorage('lineGeometry', initialLineGeometry);
let trips: Trip[] = loadStorage('trips', initialTrips);
let schedulers: Scheduler[] = loadStorage('schedulers', initialSchedulers);
let notices: Notice[] = loadStorage('notices', initialNotices);
let ticketClasses: TicketClass[] = loadStorage('ticketClasses', initialTicketClasses);

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockService = {
  // Auth
  async login(username: string, password: string): Promise<{ access_token: string; token_type: string }> {
    await delay(300);
    if (!username || !password) {
      throw new Error('اسم المستخدم وكلمة المرور مطلوبان');
    }
    if (username === 'superadmin' && password === 'ChangeMe123!') {
      return { access_token: 'mock-admin-token-123456', token_type: 'bearer' };
    }
    if (password.length >= 6) {
      return { access_token: `mock-token-${Date.now()}`, token_type: 'bearer' };
    }
    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  },

  async me(token: string): Promise<AdminUser> {
    await delay(100);
    if (!token) throw new Error('غير مصرح');
    return adminUsers[0] || { id: 1, username: 'admin', email: 'admin@traintrack.dz' };
  },

  async logout(): Promise<{ message: string }> {
    await delay(100);
    return { message: 'Logged out successfully' };
  },

  // Stations
  async getStations(): Promise<Station[]> {
    await delay();
    return [...stations];
  },
  async getStation(id: number): Promise<Station> {
    await delay();
    const st = stations.find((s) => s.id === id);
    if (!st) throw new Error('المحطة غير موجودة');
    return st;
  },
  async createStation(data: Omit<Station, 'id'>): Promise<Station> {
    await delay();
    const newStation: Station = { id: Date.now(), ...data };
    stations.push(newStation);
    saveStorage('stations', stations);
    return newStation;
  },
  async updateStation(id: number, data: Omit<Station, 'id'>): Promise<Station> {
    await delay();
    const idx = stations.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('المحطة غير موجودة');
    stations[idx] = { id, ...data };
    saveStorage('stations', stations);
    return stations[idx];
  },
  async deleteStation(id: number): Promise<string> {
    await delay();
    stations = stations.filter((s) => s.id !== id);
    saveStorage('stations', stations);
    return 'تم حذف المحطة بنجاح';
  },

  // Trains
  async getTrains(): Promise<Train[]> {
    await delay();
    return [...trains];
  },
  async getTrain(id: number): Promise<Train> {
    await delay();
    const tr = trains.find((t) => t.id === id);
    if (!tr) throw new Error('القطار غير موجود');
    return tr;
  },
  async createTrain(data: Omit<Train, 'id'>): Promise<Train> {
    await delay();
    const newTrain: Train = { id: Date.now(), ...data };
    trains.push(newTrain);
    saveStorage('trains', trains);
    return newTrain;
  },
  async updateTrain(id: number, data: Omit<Train, 'id'>): Promise<Train> {
    await delay();
    const idx = trains.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('القطار غير موجود');
    trains[idx] = { id, ...data };
    saveStorage('trains', trains);
    return trains[idx];
  },
  async deleteTrain(id: number): Promise<string> {
    await delay();
    trains = trains.filter((t) => t.id !== id);
    saveStorage('trains', trains);
    return 'تم حذف القطار بنجاح';
  },

  // Wilayas
  async getWilayas(): Promise<Wilaya[]> {
    await delay();
    return [...wilayas];
  },
  async getWilaya(id: number): Promise<Wilaya> {
    await delay();
    const w = wilayas.find((item) => item.id === id);
    if (!w) throw new Error('الولاية غير موجودة');
    return w;
  },
  async createWilaya(data: Omit<Wilaya, 'id'>): Promise<Wilaya> {
    await delay();
    const newWilaya: Wilaya = { id: Date.now(), ...data };
    wilayas.push(newWilaya);
    saveStorage('wilayas', wilayas);
    return newWilaya;
  },
  async updateWilaya(id: number, data: Omit<Wilaya, 'id'>): Promise<Wilaya> {
    await delay();
    const idx = wilayas.findIndex((w) => w.id === id);
    if (idx === -1) throw new Error('الولاية غير موجودة');
    wilayas[idx] = { id, ...data };
    saveStorage('wilayas', wilayas);
    return wilayas[idx];
  },
  async deleteWilaya(id: number): Promise<string> {
    await delay();
    wilayas = wilayas.filter((w) => w.id !== id);
    saveStorage('wilayas', wilayas);
    return 'تم حذف الولاية بنجاح';
  },

  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    await delay();
    return [...adminUsers];
  },
  async getAdminUser(id: number): Promise<AdminUser> {
    await delay();
    const u = adminUsers.find((a) => a.id === id);
    if (!u) throw new Error('المسؤول غير موجود');
    return u;
  },
  async createAdminUser(data: { username: string; email: string ,status:AccountStatus}): Promise<AdminUser> {
    await delay();
    const newAdmin: AdminUser = { id: Date.now(), ...data };
    adminUsers.push(newAdmin);
    saveStorage('adminUsers', adminUsers);
    return newAdmin;
  },
  async deleteAdminUser(id: number): Promise<string> {
    await delay();
    adminUsers = adminUsers.filter((a) => a.id !== id);
    saveStorage('adminUsers', adminUsers);
    return 'تم حذف حساب المسؤول بنجاح';
  },
  async setAdminPassword(data: { email: string; new_password: string; token: string }): Promise<string> {
    await delay();
    const admin = adminUsers.find((a) => a.email === data.email);
    if (!admin) throw new Error('البريد الإلكتروني غير مطابق لأي حساب');
    return 'تم تعيين كلمة المرور بنجاح';
  },

  // Lines
  async getLines(): Promise<Line[]> {
    await delay();
    return [...lines];
  },
  async getLine(id: number): Promise<Line> {
    await delay();
    const l = lines.find((item) => item.id === id);
    if (!l) throw new Error('الخط غير موجود');
    return l;
  },
  async createLine(data: Omit<Line, 'id'>): Promise<Line> {
    await delay();
    const newLine: Line = { id: Date.now(), ...data };
    lines.push(newLine);
    saveStorage('lines', lines);
    return newLine;
  },
  async updateLine(id: number, data: Omit<Line, 'id'>): Promise<Line> {
    await delay();
    const idx = lines.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('الخط غير موجود');
    lines[idx] = { id, ...data };
    saveStorage('lines', lines);
    return lines[idx];
  },
  async deleteLine(id: number): Promise<string> {
    await delay();
    lines = lines.filter((l) => l.id !== id);
    lineStations = lineStations.filter((ls) => ls.line_id !== id);
    lineGeometry = lineGeometry.filter((lg) => lg.line_id !== id);
    saveStorage('lines', lines);
    saveStorage('lineStations', lineStations);
    saveStorage('lineGeometry', lineGeometry);
    return 'تم حذف الخط وكل بياناته بنجاح';
  },

  // Line Stations
  async getLineStations(line_id: number): Promise<LineStation[]> {
    await delay();
    return lineStations.filter((ls) => ls.line_id === line_id).sort((a, b) => a.order - b.order);
  },
  async createLineStation(data: { line_name: string; station_name: string; order: number; distance: number }): Promise<LineStation> {
    await delay();
    const line = lines.find((l) => l.name === data.line_name);
    const station = stations.find((s) => s.name === data.station_name);
    if (!line) throw new Error(`الخط باسم "${data.line_name}" غير موجود`);
    if (!station) throw new Error(`المحطة باسم "${data.station_name}" غير موجودة`);

    const newLink: LineStation = {
      line_id: line.id,
      station_id: station.id,
      order: Number(data.order),
      distance: Number(data.distance),
    };
    lineStations = lineStations.filter((ls) => !(ls.line_id === line.id && ls.station_id === station.id));
    lineStations.push(newLink);
    saveStorage('lineStations', lineStations);
    return newLink;
  },
  async updateLineStation(line_id: number, station_id: number, data: { order: number; distance: number }): Promise<LineStation> {
    await delay();
    const idx = lineStations.findIndex((ls) => ls.line_id === line_id && ls.station_id === station_id);
    if (idx === -1) throw new Error('ربط المحطة بالخط غير موجود');
    lineStations[idx] = { line_id, station_id, order: Number(data.order), distance: Number(data.distance) };
    saveStorage('lineStations', lineStations);
    return lineStations[idx];
  },
  async deleteLineStation(line_id: number, station_id: number): Promise<string> {
    await delay();
    lineStations = lineStations.filter((ls) => !(ls.line_id === line_id && ls.station_id === station_id));
    saveStorage('lineStations', lineStations);
    return 'تم إزالة المحطة من الخط بنجاح';
  },

  // Line Geometry
  async getLineGeometry(line_id: number): Promise<LineGeometry[]> {
    await delay();
    return lineGeometry.filter((lg) => lg.line_id === line_id).sort((a, b) => a.sequence - b.sequence);
  },
  async createLineGeometry(data: { line_name: string; sequence: number; latitude: number; longitude: number }): Promise<LineGeometry> {
    await delay();
    const line = lines.find((l) => l.name === data.line_name);
    if (!line) throw new Error(`الخط باسم "${data.line_name}" غير موجود`);
    const newPt: LineGeometry = {
      id: Date.now(),
      line_id: line.id,
      sequence: Number(data.sequence),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
    };
    lineGeometry.push(newPt);
    saveStorage('lineGeometry', lineGeometry);
    return newPt;
  },
  async updateLineGeometry(id: number, data: { sequence: number; latitude: number; longitude: number }): Promise<LineGeometry> {
    await delay();
    const idx = lineGeometry.findIndex((lg) => lg.id === id);
    if (idx === -1) throw new Error('نقطة المسار غير موجودة');
    lineGeometry[idx] = {
      ...lineGeometry[idx],
      sequence: Number(data.sequence),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
    };
    saveStorage('lineGeometry', lineGeometry);
    return lineGeometry[idx];
  },
  async deleteLineGeometry(id: number): Promise<string> {
    await delay();
    lineGeometry = lineGeometry.filter((lg) => lg.id !== id);
    saveStorage('lineGeometry', lineGeometry);
    return 'تم حذف نقطة المسار بنجاح';
  },

  // Trips
  async getTrips(line_id: number): Promise<Trip[]> {
    await delay();
    return trips.filter((t) => t.line_id === line_id);
  },
  async getTrip(id: number): Promise<Trip> {
    await delay();
    const tr = trips.find((t) => t.id === id);
    if (!tr) throw new Error('الرحلة غير موجودة');
    return tr;
  },
  async createTrip(data: Omit<Trip, 'id'>): Promise<Trip> {
    await delay();
    const newTrip: Trip = { id: Date.now(), ...data };
    trips.push(newTrip);
    saveStorage('trips', trips);
    return newTrip;
  },
  async updateTrip(id: number, data: Pick<Trip, 'status' | 'tripType'>): Promise<Trip> {
    await delay();
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('الرحلة غير موجودة');
    trips[idx] = { ...trips[idx], status: data.status, tripType: data.tripType };
    saveStorage('trips', trips);
    return trips[idx];
  },
  async deleteTrip(id: number): Promise<string> {
    await delay();
    trips = trips.filter((t) => t.id !== id);
    schedulers = schedulers.filter((s) => s.trip_id !== id);
    saveStorage('trips', trips);
    saveStorage('schedulers', schedulers);
    return 'تم حذف الرحلة بنجاح';
  },

  // Scheduler
  async getSchedulers(trip_id: number): Promise<Scheduler[]> {
    await delay();
    return schedulers.filter((s) => s.trip_id === trip_id).sort((a, b) => a.order - b.order);
  },
  async createScheduler(data: Omit<Scheduler, 'id'>): Promise<Scheduler> {
    await delay();
    const newSch: Scheduler = { id: Date.now(), ...data, order: Number(data.order) };
    schedulers.push(newSch);
    saveStorage('schedulers', schedulers);
    return newSch;
  },
  async updateScheduler(id: number, data: Pick<Scheduler, 'order' | 'arrival_time' | 'departure_time'>): Promise<Scheduler> {
    await delay();
    const idx = schedulers.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('التوقيت غير موجود');
    schedulers[idx] = { ...schedulers[idx], order: Number(data.order), arrival_time: data.arrival_time, departure_time: data.departure_time };
    saveStorage('schedulers', schedulers);
    return schedulers[idx];
  },
  async deleteScheduler(id: number): Promise<string> {
    await delay();
    schedulers = schedulers.filter((s) => s.id !== id);
    saveStorage('schedulers', schedulers);
    return 'تم حذف التوقيت بنجاح';
  },

  // Notices
  async getNotices(filters?: { line_id?: number | null; station_id?: number | null; trip_id?: number | null }): Promise<Notice[]> {
    await delay();
    if (!filters) return [...notices];
    return notices.filter((n) => {
      let match = true;
      if (filters.line_id !== undefined && filters.line_id !== null) {
        match = match && n.line_id === filters.line_id;
      }
      if (filters.station_id !== undefined && filters.station_id !== null) {
        match = match && n.station_id === filters.station_id;
      }
      if (filters.trip_id !== undefined && filters.trip_id !== null) {
        match = match && n.trip_id === filters.trip_id;
      }
      return match;
    });
  },
  async createNotice(data: { line_id?: number | null; station_id?: number | null; trip_id?: number | null; message: string }): Promise<Notice> {
    await delay();
    if (!data.line_id && !data.station_id && !data.trip_id) {
      throw new Error('يجب ربط الإشعار بخط أو محطة أو رحلة واحدة على الأقل');
    }
    const newNotice: Notice = {
      id: Date.now(),
      line_id: data.line_id || null,
      station_id: data.station_id || null,
      trip_id: data.trip_id || null,
      message: data.message,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    notices.unshift(newNotice);
    saveStorage('notices', notices);
    return newNotice;
  },
  async updateNotice(id: number, data: { message: string }): Promise<Notice> {
    await delay();
    const idx = notices.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error('الإشعار غير موجود');
    notices[idx] = { ...notices[idx], message: data.message };
    saveStorage('notices', notices);
    return notices[idx];
  },
  async deleteNotice(id: number): Promise<string> {
    await delay();
    notices = notices.filter((n) => n.id !== id);
    saveStorage('notices', notices);
    return 'تم حذف الإشعار بنجاح';
  },

  // Ticket Config
  async getTicketClasses(): Promise<TicketClass[]> {
    await delay();
    return [...ticketClasses];
  },
  async createTicketClass(data: Omit<TicketClass, 'id'>): Promise<TicketClass> {
    await delay();
    const newClass: TicketClass = { id: Date.now(), classtype: data.classtype, Rate_Per_Km: Number(data.Rate_Per_Km) };
    ticketClasses.push(newClass);
    saveStorage('ticketClasses', ticketClasses);
    return newClass;
  },
  async updateTicketClass(id: number, data: Omit<TicketClass, 'id'>): Promise<TicketClass> {
    await delay();
    const idx = ticketClasses.findIndex((tc) => tc.id === id);
    if (idx === -1) throw new Error('فئة التذكرة غير موجودة');
    ticketClasses[idx] = { id, classtype: data.classtype, Rate_Per_Km: Number(data.Rate_Per_Km) };
    saveStorage('ticketClasses', ticketClasses);
    return ticketClasses[idx];
  },
  async deleteTicketClass(id: number): Promise<string> {
    await delay();
    ticketClasses = ticketClasses.filter((tc) => tc.id !== id);
    saveStorage('ticketClasses', ticketClasses);
    return 'تم حذف فئة التذكرة بنجاح';
  },
  async calculatePrice(req: { from_station_id: number; to_station_id: number; ticket_class_id: number }): Promise<PriceResponse> {
    await delay(300);
    const tc = ticketClasses.find((t) => t.id === req.ticket_class_id);
    const fromSt = stations.find((s) => s.id === req.from_station_id);
    const toSt = stations.find((s) => s.id === req.to_station_id);
    if (!tc) throw new Error('فئة التذكرة المحددة غير موجودة');
    if (!fromSt || !toSt) throw new Error('المحطة المحددة غير موجودة');

    const R = 6371;
    const dLat = ((toSt.latitude - fromSt.latitude) * Math.PI) / 180;
    const dLon = ((toSt.longitude - fromSt.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((fromSt.latitude * Math.PI) / 180) *
        Math.cos((toSt.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let distance_km = Math.round(R * c * 1.25 * 10) / 10;
    if (distance_km < 10) distance_km = 10;
    const price = Math.round(distance_km * tc.Rate_Per_Km);
    return { distance_km, price };
  },
};
