import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

// Placeholder screen — build out the real search results/booking UI here.
export default function SearchResultsScreen({ onBack }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>نتائج البحث</Text>
      <Text style={styles.subtext}>قيد الإنشاء</Text>
      <Button title="رجوع" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtext: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
});