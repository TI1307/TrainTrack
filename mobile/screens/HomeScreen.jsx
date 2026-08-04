import React, { useState, useMemo , useEffect } from "react";
import { Image, View, Text, TextInput, StyleSheet, Pressable, Keyboard, Modal, FlatList,ScrollView} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {getStations} from "../api/station"

const NAVY = "#0B3D6B";
const DAYS_COUNT = 10; // number upcoming days to show in the strip


const WEEKDAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

function generateDays(count) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    days.push({
      date: d,
      dayNum: d.getDate(),
      label: i === 0 ? "اليوم" : WEEKDAYS[d.getDay()],
    });
  }
  return days;
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}


export default function HomeScreen({ onSearch }) {
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [fromStationId, setFromStationId] = useState("");
  const [toStationId, setToStationId] = useState("");
  const [activeField, setActiveField] = useState(null);


  const days = useMemo(() => generateDays(DAYS_COUNT), []);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 = today
  const [dateModalVisible, setDateModalVisible] = useState(false);
    //get function
  const [stations , setStations]=useState([])
  useEffect(() => {
  getStations().then(data => {
    console.log(data)
    setStations(data);
  });
}, []);
  const filteredFromStations = stations.filter((station) =>
    station.name.toLowerCase().includes(fromSearch.toLowerCase())
  );
  const filteredToStations = stations.filter((station) =>
    station.name.toLowerCase().includes(toSearch.toLowerCase())
  );


  
  const selectFrom = (station) => {
    setFromSearch(station.name);
    setFromStationId(station.id);
    setActiveField(null);
    Keyboard.dismiss();
  };

  const selectTo = (station) => {
    setToSearch(station.name);
    setToStationId(station.id);
    setActiveField(null);
    Keyboard.dismiss();
  };
  
  
  return (
    <Pressable style={styles.container} onPress={() => setActiveField(null)}>
<Image source={require("../assets/rail-top-left.png")} style={styles.railTopLeft} />
<Image source={require("../assets/rail-bottom-right.png")} style={styles.railBottomRight} />
      <View style={styles.card}>
        <Image
          source={require("../assets/trainlogo-transparent.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.text}>مرحبا بك</Text>
        <Text style={styles.subtext}>ابحث عن رحلتك بسهولة</Text>

        {/* From */}
        <View style={styles.fieldBlock}>
          <View style={styles.fieldWrapper}>
            <Ionicons
              name="chevron-down"
              size={16}
              color={NAVY}
              style={styles.chevronIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="من"
              placeholderTextColor="#888"
              textAlign="right"
              value={fromSearch}
              onFocus={() => setActiveField("from")}
              onChangeText={(text) => {
                setFromSearch(text);
                setActiveField("from");
              }}
            />
            <Ionicons
              name="radio-button-on-outline"
              size={16}
              color={NAVY}
              style={styles.trailingIcon}
            />
          </View>
          {activeField === "from" && (
           <ScrollView
            style={styles.list}
            keyboardShouldPersistTaps="handled" >
              {filteredFromStations.map((station) => (
                <Pressable
                  key={station.id}
                  style={styles.item}
                  onPress={() => selectFrom(station)}
                >
                  <Text>{station.name}</Text>
                </Pressable>
              ))
              }
            </ScrollView>
          )}
        </View>

        {/* To */}
        <View style={styles.fieldBlock}>
          <View style={styles.fieldWrapper}>
            <Ionicons
              name="chevron-down"
              size={16}
              color={NAVY}
              style={styles.chevronIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="الى"
              placeholderTextColor="#888"
              textAlign="right"
              value={toSearch}
              onFocus={() => setActiveField("to")}
              onChangeText={(text) => {
                setToSearch(text);
                setActiveField("to");
              }}
            />
            <Ionicons
              name="location-outline"
              size={16}
              color={NAVY}
              style={styles.trailingIcon}
            />
          </View>
          {activeField === "to" && (
            <ScrollView
    style={styles.list}
    keyboardShouldPersistTaps="handled" >
              {filteredToStations.map((station) => (
                <Pressable
                  key={station.id}
                  style={styles.item}
                  onPress={() => selectTo(station)}
                >
                  <Text>{station.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Date - shows today by default, tap to pick from the next DAYS_COUNT days */}
        <View style={styles.fieldBlock}>
          <Pressable
            style={styles.fieldWrapper}
            onPress={() => setDateModalVisible(true)}
          >
            <Ionicons
              name="chevron-down"
              size={16}
              color={NAVY}
              style={styles.chevronIcon}
            />
            <Text style={styles.dateDisplay}>{formatDate(days[selectedDayIndex].date)}</Text>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={NAVY}
              style={styles.trailingIcon}
            />
          </Pressable>
        </View>

        <Modal
          visible={dateModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDateModalVisible(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setDateModalVisible(false)}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setDateModalVisible(false)} hitSlop={8}>
                  <Ionicons name="close" size={20} color="#555" />
                </Pressable>
                <Text style={styles.modalTitle}>اختر التاريخ</Text>
              </View>

              <FlatList
                data={days}
                keyExtractor={(_, index) => String(index)}
                renderItem={({ item, index }) => {
                  const selected = index === selectedDayIndex;
                  return (
                    <Pressable
                      style={[
                        styles.modalRow,
                        selected && styles.modalRowSelected,
                      ]}
                      onPress={() => {
                        setSelectedDayIndex(index);
                        setDateModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalRowText,
                          selected && styles.modalRowTextSelected,
                        ]}
                      >
                        {item.label} — {formatDate(item.date)}
                      </Text>
                      {selected && (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      )}
                    </Pressable>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>

        <Pressable style={styles.button} 
        onPress={ () => onSearch({
          fromStationId,
          toStationId,
          from:fromSearch,
          to:toSearch,
          date:days[selectedDayIndex].date,
        })}>
          <Text style={styles.buttonText}>إبحث</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 160,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  card: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    height: 80,
    width: 80,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 2,
  },
  subtext: {
    fontSize: 13,
    color: "#777",
    marginBottom: 28,
  },
  fieldBlock: {
    width: "100%",
    marginTop: 14,
  },
  fieldWrapper: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
  },
  input: {
    height: "100%",
    paddingLeft: 36,
    paddingRight: 36,
    fontSize: 14,
  },
  dateDisplay: {
    height: "100%",
    lineHeight: 46,
    paddingLeft: 36,
    paddingRight: 36,
    fontSize: 14,
    color: "#222",
    textAlign: "right",
  },
  chevronIcon: {
    position: "absolute",
    left: 12,
  },
  trailingIcon: {
    position: "absolute",
    right: 12,
  },
  list: {
    width: "100%",
    maxHeight: 150, 
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginTop: 4,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxHeight: 420,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  modalRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalRowSelected: {
    backgroundColor: NAVY,
  },
  modalRowText: {
    fontSize: 14,
    color: "#222",
  },
  modalRowTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  button: {
    width: "100%",
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  railTopLeft: {
  position: "absolute",
  top: 0,
  left: 0,
},
railBottomRight: {
  position: "absolute",
  bottom: 0,
  right: 0,
},
});
