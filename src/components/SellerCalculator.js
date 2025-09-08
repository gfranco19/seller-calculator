import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  useColorScheme,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function SellerCalculator() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");

  const [platform, setPlatform] = useState("ebay");
  const [category, setCategory] = useState("Other");
  const [cost, setCost] = useState("");
  const [profit, setProfit] = useState("");
  const [shipping, setShipping] = useState("");
  const [result, setResult] = useState(null);

  // eBay categories + other platforms
  const feeRates = {
    ebay: {
      Other: { tiers: [{ rate: 0.136, cap: 7500 }, { rate: 0.0235 }] },
      Sneakers: { tiers: [{ rate: 0.136, cap: 7500 }, { rate: 0.0235 }] },
      "Guitars & Basses": {
        tiers: [{ rate: 0.067, cap: 7500 }, { rate: 0.0235 }],
      },
      "Trading Cards": {
        tiers: [{ rate: 0.1325, cap: 7500 }, { rate: 0.0235 }],
      },
      "Books, Movies & Music": {
        tiers: [{ rate: 0.153, cap: 7500 }, { rate: 0.0235 }],
      },
      Bullion: { tiers: [{ rate: 0.136, cap: 7500 }, { rate: 0.07 }] },
      Handbags: { tiers: [{ rate: 0.15, cap: 2000 }, { rate: 0.09 }] },
      "Jewelry & Watches": {
        tiers: [{ rate: 0.15, cap: 5000 }, { rate: 0.09 }],
      },
      "Watches & Parts": {
        tiers: [
          { rate: 0.15, cap: 1000 },
          { rate: 0.065, cap: 7500 },
          { rate: 0.03 },
        ],
      },
      NFTs: { flat: 0.05 },
      "Heavy Equipment": {
        tiers: [{ rate: 0.03, cap: 15000 }, { rate: 0.005 }],
      },
    },
    etsy: { flat: 0.095, fixed: 0.2 },
    depop: { flat: 0.1 },
  };

  const calculateEbayPrice = (c, desiredProfit, s, cat) => {
    let price = c + desiredProfit + s;
    let netProfit = 0;
    let iterations = 0;

    while (iterations < 50) {
      const fees = applyTieredFees(price, cat.tiers);
      netProfit = price - fees - c - s;
      const diff = desiredProfit - netProfit;
      if (Math.abs(diff) < 0.01) break;
      price += diff;
      iterations++;
    }

    return { listingPrice: price, fees: applyTieredFees(price, cat.tiers) };
  };

  const calculatePrice = () => {
    const c = parseFloat(cost) || 0;
    const p = parseFloat(profit) || 0;
    const s = parseFloat(shipping) || 0;

    let fees = 0;
    let listingPrice = 0;

    if (platform === "ebay") {
      const cat = feeRates.ebay[category];
      const { listingPrice: lp, fees: f } = calculateEbayPrice(c, p, s, cat);
      listingPrice = lp;
      fees = f;
    } else if (platform === "etsy") {
      const listingFee = 0.2;
      const transactionRate = 0.065;
      const processingRate = 0.03;
      const processingFixed = 0.25;

      listingPrice =
        (c + p + s + listingFee + processingFixed) /
        (1 - (transactionRate + processingRate));
      fees =
        listingPrice * transactionRate +
        listingPrice * processingRate +
        listingFee +
        processingFixed;
    } else if (platform === "depop") {
      const depopRate = 0.1;
      const processingRate = 0.029;
      const processingFixed = 0.3;

      listingPrice =
        (c + p + s + processingFixed) / (1 - (depopRate + processingRate));
      fees =
        listingPrice * depopRate +
        listingPrice * processingRate +
        processingFixed;
    }

    const netProfit = listingPrice - fees - c - s;

    setResult({
      listingPrice: listingPrice.toFixed(2),
      fees: fees.toFixed(2),
      itemCost: c.toFixed(2),
      shipping: s.toFixed(2),
      netProfit: netProfit.toFixed(2),
    });
  };

  const applyTieredFees = (price, tiers) => {
    let remaining = price;
    let total = 0;
    for (let i = 0; i < tiers.length; i++) {
      const { rate, cap } = tiers[i];
      if (cap) {
        const amount = Math.min(remaining, cap);
        total += amount * rate;
        remaining -= amount;
      } else {
        total += remaining * rate;
        remaining = 0;
      }
      if (remaining <= 0) break;
    }
    return total;
  };

  // Colors for dark/light mode
  const colors = {
    background: isDarkMode ? "#121212" : "#f2f2f2",
    card: isDarkMode ? "#1e1e1e" : "white",
    text: isDarkMode ? "#fff" : "#000",
    label: isDarkMode ? "#ccc" : "#000",
    border: isDarkMode ? "#555" : "#ccc",
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        📱 Seller Calculator
      </Text>

      {/* Dark Mode Toggle */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
          justifyContent: "center",
        }}>
        <Text style={{ color: colors.text, marginRight: 10 }}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>

      {/* Input Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.label }]}>Platform</Text>
        <Picker
          selectedValue={platform}
          onValueChange={setPlatform}
          style={[styles.picker, { color: isDarkMode ? "#fff" : "#000" }]} // Android
          itemStyle={{ color: isDarkMode ? "#fff" : "#000" }} // iOS
        >
          <Picker.Item label="eBay" value="ebay" />
          <Picker.Item label="Etsy" value="etsy" />
          <Picker.Item label="Depop" value="depop" />
        </Picker>

        {platform === "ebay" && (
          <>
            <Text style={[styles.label, { color: colors.label }]}>
              eBay Category
            </Text>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={[styles.picker, { color: isDarkMode ? "#fff" : "#000" }]}
              itemStyle={{ color: isDarkMode ? "#fff" : "#000" }}>
              {Object.keys(feeRates.ebay).map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </>
        )}

        <Text style={[styles.label, { color: colors.label }]}>
          Item Cost ($)
        </Text>
        <TextInput
          keyboardType="numeric"
          value={cost}
          onChangeText={setCost}
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text },
          ]}
          placeholder="e.g. 30"
          placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
        />

        <Text style={[styles.label, { color: colors.label }]}>
          Desired Profit ($)
        </Text>
        <TextInput
          keyboardType="numeric"
          value={profit}
          onChangeText={setProfit}
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text },
          ]}
          placeholder="e.g. 20"
          placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
        />

        <Text style={[styles.label, { color: colors.label }]}>
          Shipping (if you pay) ($)
        </Text>
        <TextInput
          keyboardType="numeric"
          value={shipping}
          onChangeText={setShipping}
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text },
          ]}
          placeholder="e.g. 5"
          placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
        />

        <TouchableOpacity style={styles.button} onPress={calculatePrice}>
          <Text style={styles.buttonText}>Calculate</Text>
        </TouchableOpacity>
      </View>

      {/* Result Card */}
      {result && (
        <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            Breakdown
          </Text>
          <Text style={[styles.resultItem, { color: colors.text }]}>
            📌 Listing Price: ${result.listingPrice}
          </Text>
          <Text style={[styles.resultItem, { color: colors.text }]}>
            💸 Fees: -${result.fees}
          </Text>
          <Text style={[styles.resultItem, { color: colors.text }]}>
            📦 Item Cost: -${result.itemCost}
          </Text>
          <Text style={[styles.resultItem, { color: colors.text }]}>
            🚚 Shipping: -${result.shipping}
          </Text>
          <Text style={styles.netProfit}>
            ✅ Net Profit: ${result.netProfit}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 10 },
  picker: { marginBottom: 10 },
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
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  resultTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  resultItem: { fontSize: 16, marginBottom: 5 },
  netProfit: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
    marginTop: 10,
  },
});
