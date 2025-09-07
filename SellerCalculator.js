import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function SellerCalculator() {
  const [platform, setPlatform] = useState("ebay");
  const [cost, setCost] = useState("");
  const [profit, setProfit] = useState("");
  const [shipping, setShipping] = useState("");
  const [result, setResult] = useState(null);

  const feeRates = {
    ebay: { rate: 0.1325, fixed: 0 },
    etsy: { rate: 0.065 + 0.03, fixed: 0.20 },
    depop: { rate: 0.10, fixed: 0 },
  };

  const calculatePrice = () => {
    const c = parseFloat(cost) || 0;
    const p = parseFloat(profit) || 0;
    const s = parseFloat(shipping) || 0;
    const { rate, fixed } = feeRates[platform];

    const listingPrice = (c + p + s + fixed) / (1 - rate);
    const fees = listingPrice * rate + fixed;
    const netProfit = listingPrice - fees - c - s;

    setResult({
      listingPrice: listingPrice.toFixed(2),
      fees: fees.toFixed(2),
      itemCost: c.toFixed(2),
      shipping: s.toFixed(2),
      netProfit: netProfit.toFixed(2),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Seller Calculator</Text>

      {/* Input Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Platform</Text>
        <Picker
          selectedValue={platform}
          onValueChange={setPlatform}
          style={styles.picker}
        >
          <Picker.Item label="eBay" value="ebay" />
          <Picker.Item label="Etsy" value="etsy" />
          <Picker.Item label="Depop" value="depop" />
        </Picker>

        <Text style={styles.label}>Item Cost ($)</Text>
        <TextInput
          keyboardType="numeric"
          value={cost}
          onChangeText={setCost}
          style={styles.input}
          placeholder="e.g. 30"
        />

        <Text style={styles.label}>Desired Profit ($)</Text>
        <TextInput
          keyboardType="numeric"
          value={profit}
          onChangeText={setProfit}
          style={styles.input}
          placeholder="e.g. 20"
        />

        <Text style={styles.label}>Shipping (if you pay) ($)</Text>
        <TextInput
          keyboardType="numeric"
          value={shipping}
          onChangeText={setShipping}
          style={styles.input}
          placeholder="e.g. 5"
        />

        <TouchableOpacity style={styles.button} onPress={calculatePrice}>
          <Text style={styles.buttonText}>Calculate</Text>
        </TouchableOpacity>
      </View>

      {/* Result Card */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Breakdown</Text>
          <Text style={styles.resultItem}>📌 Listing Price: ${result.listingPrice}</Text>
          <Text style={styles.resultItem}>💸 Fees: -${result.fees}</Text>
          <Text style={styles.resultItem}>📦 Item Cost: -${result.itemCost}</Text>
          <Text style={styles.resultItem}>🚚 Shipping: -${result.shipping}</Text>
          <Text style={styles.netProfit}>✅ Net Profit: ${result.netProfit}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultItem: {
    fontSize: 16,
    marginBottom: 5,
  },
  netProfit: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
    marginTop: 10,
  },
});
