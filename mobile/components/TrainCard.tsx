import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Train } from "../types/train";
import { rgbaColor } from "react-native-reanimated/lib/typescript/Colors";

const NAVY = "#0B3D6B";
const GREEN = "#2E9E5B";

type TrainCardProps = {
    train: Train;
    isExpanded: boolean;
    onPress: () => void;
};

export default function TrainCard({ train, isExpanded, onPress }: TrainCardProps) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            {train.isCurrent && (
                <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>القطار الحالي</Text>
                </View>
            )}

            <View style={styles.row}>
                <View style={styles.timeBlock}>
                    <Text style={styles.time}>{train.departureTime}</Text>
                    <Text style={styles.station}>{train.departureStation}</Text>
                </View>

                <View style={styles.durationBlock}>
                    <Text style={styles.duration}>{train.duration}</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.timeBlock}>
                    <Text style={styles.time}>{train.arrivalTime}</Text>
                    <Text style={styles.station}>{train.arrivalStation}</Text>
                </View>

                <View style={styles.numberBadge}>
                    <Ionicons name="train-outline" size={13} color={NAVY} />
                    <Text style={styles.numberBadgeText}>{train.trainNumber}</Text>
                </View>
            </View>

            {isExpanded && (
                <View style={styles.stopsContainer}>
                    {train.stops.map((stop, index) => {
                        const isFirst = index === 0;
                        const isLast = index === train.stops.length - 1;
                        return (
                            <View key={stop.name} style={styles.stopRow}>
                            
                                <View style={styles.iconColumn}>
                                    <Ionicons
                                        name={stop.passed ? "checkmark-circle" : "ellipse"}
                                        size={16}
                                        color={stop.passed ? GREEN : "rgba(119,184,255,0.35)"}
                                        style={{ zIndex: 1, backgroundColor: "#fff" }}
                                    />
                                </View>
                                <Text style={[styles.stopName, stop.passed && { color: GREEN }]}>
                                    {stop.name}
                                </Text>
                                <Text style={styles.stopTime}>{stop.time}</Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: "#eee",
    },
    currentBadge: {
        alignSelf: "center",
        backgroundColor: "#E6F6EC",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 8,
    },
    currentBadgeText: {
        color: GREEN,
        fontSize: 11,
        fontWeight: "700",
    },
    row: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",
    },
    numberBadge: {
        alignItems: "center",
        backgroundColor: "rgba(119,184,255,0.15)",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 20,
    },
    numberBadgeText: {
        color: NAVY,
        fontWeight: "600",
        fontSize: 13,
        marginTop: 2,
    },
    timeBlock: {
        alignItems: "center",
    },
    time: {
        fontSize: 15,
        fontWeight: "700",
        color: "#222",
    },
    station: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    durationBlock: {
        alignItems: "center",
        flex: 1,
        marginHorizontal: 8,
    },
    duration: {
        fontSize: 11,
        color: "#999",
        marginBottom: 4,
    },
    line: {
    height: 1,
    width: "90%",
    backgroundColor: "#ccc",
  },
    stopsContainer: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#eeeeee",
        paddingTop: 10,
    },
    stopRow: {
        flexDirection: "row-reverse",
        alignItems: "center",
        paddingVertical: 4,
    },
    stopTime: {
        fontSize: 12,
        color: "#536F85",
        width: 60,
        textAlign: "left",
    },
    stopName: {
        width: 120,
        fontSize: 13,
        color: "#143564",
        textAlign: "right",
        marginRight: 10,

    },
    iconColumn: {
        width: 24,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },


});