import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import SellerCalculator from "./src/components/SellerCalculator";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <StatusBar barStyle="dark-content" />
      <SellerCalculator />
    </SafeAreaView>
  );
}
