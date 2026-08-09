import React, { useRef, useMemo, useState ,useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MapView from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { FlatList } from "react-native";
import TrainCard from "../components/TrainCard";
import  {get_notices} from "../api/passenger";
import { searchTrips } from "../api/passenger";
import { getTripPath } from "../api/tracking";
import { mapTripToTrainCard } from "../utils/tripMappers";
import type { TripSearchResult, Notice, StopStatus } from "../types";


const NAVY = "#0B3D6B";
const GREEN = "#2E9E5B";

type SearchResultParam = {
  from:string;
  to :string;
  fromStationId: number;
  toStationId: number;
  date: Date;
  onBack: () => void;
}

export default function SearchResultsScreen({ from , to ,fromStationId, toStationId, date, onBack }: SearchResultParam) {
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ["25%", "40%", "70%", "90%"], []);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [trips, setTrips] = useState<TripSearchResult[]>([]);

   const [pathsById, setPathsById] = useState<Record<number, StopStatus[]>>({});

  useEffect(() => {
    searchTrips(fromStationId, toStationId).then(setTrips);
    get_notices(fromStationId, toStationId).then(setNotices);
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
        initialRegion={{
          latitude: 36.7538,
          longitude: 3.0588,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerText}>
          {to} ← {from}
        </Text>
        <Pressable style={styles.backButton} onPress={onBack} >
          <Ionicons name="arrow-forward" size={24} color={NAVY} />
        </Pressable>
      </View>

      <View style={styles.noticeCard}>
        <View style={styles.noticeTitleRow}>
          <Ionicons name="warning" size={18} color="#E8622C" />
          <Text style={styles.noticeTitle}>ملاحظة:</Text>
        </View>
        {notices.map((notice)=>(
          <Text key={notice.id} style={styles.noticeText}>
           {notice.message}
          </Text>

        )

        )}
      </View>

      <BottomSheet ref={sheetRef} index={1} snapPoints={snapPoints}>
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>القطارات المتاحة</Text>
          <Text style={styles.sheetSubtitle}>اختر قطارًا لعرض تفاصيل المسار</Text>

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
        </BottomSheetView>
      </BottomSheet>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

  },
  headerText: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    right: 16,
    top: 50,
  },
  noticeCard: {
    position: "absolute",
    top: 110,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    padding: 14,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  noticeTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 4,
  },
  noticeTitle: {
    textAlign: "right",
    fontWeight: "700",
    color: "#E8622C",
    fontSize: 15,
    marginRight: 6,
  },
  noticeText: {
    textAlign: "right",
    color: "#555",
    fontSize: 13,
    lineHeight: 19,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  sheetSubtitle: {
    textAlign: "center",
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    marginBottom: 8,
  },
});