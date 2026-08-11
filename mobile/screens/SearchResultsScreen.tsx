import React, { useRef, useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, FlatList, Animated } from "react-native";
import MapView, { Polyline, Marker, AnimatedRegion } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import TrainCard from "../components/TrainCard";
import { get_notices, searchTrips } from "../api/passenger";
import { getTripPath, getLiveTrains, getTripGeometry } from "../api/tracking";
import { getTicketClasses, calculatePrice } from "../api/ticketConfig";
import { mapTripToTrainCard } from "../utils/tripMappers";
import type { TripSearchResult, Notice, StopStatus, PriceResponse, TripGeometry, TrackingRead } from "../types";

const NAVY = "#0B3D6B";
const GREEN = "#2E9E5B";
const RED = "#C0392B";

type SearchResultParam = {
  from: string;
  to: string;
  fromStationId: number;
  toStationId: number;
  date: Date;
  ticketClass: "first_class" | "economy" | "intra_wilaya";
  onBack: () => void;
};

function extractErrorMessage(err: any, fallback: string): string {
  return err?.response?.data?.detail ?? err?.message ?? fallback;
}

export default function SearchResultsScreen({ from, to, fromStationId, toStationId, date, ticketClass, onBack }: SearchResultParam) {
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "40%", "70%", "90%"], []);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [pathsById, setPathsById] = useState<Record<number, StopStatus[]>>({});
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [noticesDismissed, setNoticesDismissed] = useState(false);

  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [tripsError, setTripsError] = useState<string | null>(null);

  const [priceInfo, setPriceInfo] = useState<PriceResponse | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);

  const [geometry, setGeometry] = useState<TripGeometry | null>(null);
  const [liveTrains, setLiveTrains] = useState<TrackingRead[]>([]);
  const currentTripId = liveTrains[0]?.trip_id ?? null;
  const animatedCoord = useRef(new AnimatedRegion({
    latitude: 36.7538, longitude: 3.0588, latitudeDelta: 0, longitudeDelta: 0,
  })).current;

  useEffect(() => {
    const current = liveTrains[0];
    if (!current) return;

    animatedCoord.timing({
      latitude: current.latitude,
      longitude: current.longitude,
      duration: 18000, // slightly under the 20s poll interval, so it finishes before the next update arrives
      useNativeDriver: false,
      latitudeDelta: 0,
      longitudeDelta: 0,
    } as any).start();
  }, [liveTrains]);

  useEffect(() => {
    setIsLoadingTrips(true);
    setTripsError(null);
    searchTrips(fromStationId, toStationId)
      .then(setTrips)
      .catch((err) => setTripsError(extractErrorMessage(err, "تعذر جلب الرحلات، حاول مجددًا")))
      .finally(() => setIsLoadingTrips(false));

    get_notices(fromStationId, toStationId)
      .then(setNotices)
      .catch(() => setNotices([])); // notices failing silently is acceptable — not core to the search result
  }, [fromStationId, toStationId]);

  useEffect(() => {
    setIsLoadingPrice(true);
    setPriceError(null);
    setPriceInfo(null);

    getTicketClasses()
      .then((classes) => {
        const match = classes.find((c) => c.classtype === ticketClass);
        if (!match) {
          throw new Error("لم يتم تسعير هذا النوع من التذاكر بعد");
        }
        return calculatePrice(fromStationId, toStationId, match.id);
      })
      .then(setPriceInfo)
      .catch((err) => setPriceError(extractErrorMessage(err, "تعذر حساب السعر")))
      .finally(() => setIsLoadingPrice(false));
  }, [fromStationId, toStationId, ticketClass]);

  useEffect(() => {
    if (currentTripId === null) {
      setGeometry(null);
      return;
    }
    getTripGeometry(currentTripId)
      .then(setGeometry)
      .catch(() => setGeometry(null));
  }, [currentTripId]);

  // poll live positions independently, every 20s, cleaned up properly
  useEffect(() => {
    let active = true;
    const poll = () => {
      getLiveTrains(fromStationId, toStationId)
        .then((data) => { if (active) setLiveTrains(data); })
        .catch(() => { });
    };
    poll();
    const interval = setInterval(poll, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [fromStationId, toStationId]);


  const handleSelectTrain = (tripId: number) => {
    const idStr = String(tripId);
    setSelectedTrainId((prev) => (prev === idStr ? null : idStr));
    if (!pathsById[tripId]) {
      getTripPath(tripId).then((path) => {
        setPathsById((prev) => ({ ...prev, [tripId]: path }));
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{ latitude: 36.7538, longitude: 3.0588, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
      >
        {geometry && (
          <>
            <Polyline coordinates={geometry.passed} strokeColor={GREEN} strokeWidth={4} />
            <Polyline coordinates={geometry.remaining} strokeColor="#B0BEC5" strokeWidth={4} />
          </>
        )}
        {liveTrains[0] && (
          <Marker.Animated coordinate={animatedCoord as any}>
            <Ionicons name="train" size={22} color={NAVY} />
          </Marker.Animated>
        )}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerText}>{to} ← {from}</Text>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-forward" size={24} color={NAVY} />
        </Pressable>
      </View>
      {notices.length > 0 && !noticesDismissed && (
        <View style={styles.noticeCard}>
          <View style={styles.noticeTitleRow}>
            <Pressable onPress={() => setNoticesDismissed(true)} hitSlop={10}>
              <Ionicons name="close" size={18} color="#888" />
            </Pressable>
            <Text style={styles.noticeTitle}>ملاحظات</Text>
            <Ionicons name="warning" size={18} color="#E8622C" />
          </View>

          {(showAllNotices ? notices : notices.slice(0, 3)).map((notice, index) => (
            <Text key={notice.id} style={styles.noticeText}>
              {`ملاحظة ${index + 1}: ${notice.message}`}
            </Text>
          ))}

          {notices.length > 3 && (
            <Pressable
              onPress={() => setShowAllNotices((prev) => !prev)}
              style={styles.noticeToggleButton}
            >
              <Text style={styles.noticeToggleText}>
                {showAllNotices ? "عرض أقل" : `عرض الكل (${notices.length})`}
              </Text>
              <Ionicons
                name={showAllNotices ? "chevron-up" : "chevron-down"}
                size={14}
                color={NAVY}
              />
            </Pressable>
          )}
        </View>
      )}

      {notices.length > 0 && noticesDismissed && (
        <Pressable
          style={styles.noticeIconButton}
          onPress={() => {
            setNoticesDismissed(false);
            setShowAllNotices(true);
          }}
        >
          <Ionicons name="warning" size={22} color="#E8622C" />
        </Pressable>
      )}

      <BottomSheet ref={sheetRef} index={1} snapPoints={snapPoints}>
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>القطارات المتاحة</Text>
          <Text style={styles.sheetSubtitle}>اختر قطارًا لعرض تفاصيل المسار</Text>

          {/* Price section: loading / error / success, in that order */}
          {isLoadingPrice ? (
            <ActivityIndicator size="small" color={NAVY} style={{ marginBottom: 8 }} />
          ) : priceError && !tripsError ? (
            <Text style={styles.errorText}>{priceError}</Text>
          ) : priceInfo ? (
            <Text style={styles.priceText}>
              السعر: {priceInfo.price.toFixed(0)} د.ج ({priceInfo.distance_km.toFixed(1)} كم)
            </Text>
          ) : null}

          {/* Trips section: loading / error / empty / list */}
          {isLoadingTrips ? (
            <ActivityIndicator size="large" color={NAVY} style={{ marginTop: 30 }} />
          ) : tripsError ? (
            <Text style={styles.errorText}>{tripsError}</Text>
          ) : trips.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد رحلات متاحة بين هاتين المحطتين</Text>
          ) : (
            <FlatList
              data={trips}
              keyExtractor={(item) => String(item.trip_id)}
              renderItem={({ item }) => {
                const train = mapTripToTrainCard(item, from, to, pathsById[item.trip_id]);
                return (
                  <TrainCard
                    train={train}
                    isExpanded={selectedTrainId === String(item.trip_id)}
                    onPress={() => handleSelectTrain(item.trip_id)}
                  />
                );
              }}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: { position: "absolute", top: 0, left: 0, right: 0, paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: "#fff", flexDirection: "row", justifyContent: "center", alignItems: "center" },
  headerText: { color: NAVY, fontSize: 16, fontWeight: "600" },
  backButton: { position: "absolute", right: 16, top: 50 },
  noticeCard: { position: "absolute", top: 110, left: 16, right: 16, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 12, padding: 14, shadowColor: NAVY, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
  noticeTitleRow: { flexDirection: "row-reverse", alignItems: "center", marginBottom: 4 },
  noticeTitle: { textAlign: "right", fontWeight: "700", color: "#E8622C", fontSize: 15, marginRight: 6 },
  noticeText: { textAlign: "right", color: "#555", fontSize: 13, lineHeight: 19 },
  sheetContent: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  sheetTitle: { textAlign: "center", fontSize: 16, fontWeight: "700", color: NAVY },
  sheetSubtitle: { textAlign: "center", fontSize: 12, color: "#888", marginTop: 4, marginBottom: 8 },
  priceText: { textAlign: "center", fontSize: 13, fontWeight: "700", color: GREEN, marginBottom: 8 },
  errorText: { textAlign: "center", fontSize: 13, fontWeight: "600", color: RED, marginTop: 12, marginBottom: 8 },
  emptyText: { textAlign: "center", fontSize: 13, color: "#888", marginTop: 30 },
  noticeToggleButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 4,
  },
  noticeToggleText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  noticeIconButton: {
    position: "absolute",
    top: 110,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});