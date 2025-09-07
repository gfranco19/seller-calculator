import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function SellerCalculator() {
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
      Sneakers: {
        special: "sneakers", // custom rule
        tiers: [{ rate: 0.136, cap: 7500 }, { rate: 0.0235 }],
      },
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
    etsy: { flat: 0.095, fixed: 0.2 }, // 6.5% transaction + 3% payment + $0.20
    depop: { flat: 0.1 },
  };

  const calculatePrice = () => {
    const c = parseFloat(cost) || 0;
    const p = parseFloat(profit) || 0;
    const s = parseFloat(shipping) || 0;

    let fees = 0;
    let listingPrice = 0;

    if (platform === "ebay") {
      const cat = feeRates.ebay[category];
      // Estimate listing price first (ignores fees, approximate start)
      let guessPrice = c + p + s + 10; // buffer for fees

      if (cat.flat) {
        // flat percentage fee (like NFTs)
        listingPrice = (c + p + s) / (1 - cat.flat);
        fees = listingPrice * cat.flat;
      } else if (cat.special === "sneakers") {
        // Sneakers rule
        if (guessPrice >= 150) {
          listingPrice = (c + p + s) / (1 - 0.08);
          fees = listingPrice * 0.08; // per-order fee waived
        } else {
          // fallback to standard sneakers tiers
          listingPrice = c + p + s + 10;
          fees = applyTieredFees(listingPrice, cat.tiers);
        }
      } else {
        // General tiered fee logic
        listingPrice = c + p + s + 10; // initial estimate
        fees = applyTieredFees(listingPrice, cat.tiers);
        // refine listing price using formula (approximate)
        listingPrice = (c + p + s + fees) / (1 - cat.tiers[0].rate);
        fees = applyTieredFees(listingPrice, cat.tiers);
      }
    } else if (platform === "etsy") {
      const listingFee = 0.2; // flat listing fee
      const transactionRate = 0.065; // 6.5% transaction fee
      const processingRate = 0.03; // 3% payment processing
      const processingFixed = 0.25; // $0.25 per transaction

      // Estimate listing price to hit desired profit
      listingPrice =
        (c + p + s + listingFee + processingFixed) /
        (1 - (transactionRate + processingRate));

      // Calculate fees
      fees =
        listingPrice * transactionRate +
        listingPrice * processingRate +
        listingFee +
        processingFixed;
    } else if (platform === "depop") {
      const depopRate = 0.1; // 10% Depop fee
      const processingRate = 0.029; // PayPal/Stripe percentage
      const processingFixed = 0.3; // PayPal/Stripe fixed per transaction

      // Initial estimate for listing price
      listingPrice =
        (c + p + s + processingFixed) / (1 - (depopRate + processingRate));

      // Calculate fees
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

  // Helper for tiered categories
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Seller Calculator</Text>

      {/* Input Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Platform</Text>
        <Picker
          selectedValue={platform}
          onValueChange={setPlatform}
          style={styles.picker}>
          <Picker.Item label="eBay" value="ebay" />
          <Picker.Item label="Etsy" value="etsy" />
          <Picker.Item label="Depop" value="depop" />
        </Picker>

        {/* eBay Category Picker */}
        {platform === "ebay" && (
          <>
            <Text style={styles.label}>eBay Category</Text>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}>
              {Object.keys(feeRates.ebay).map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </>
        )}

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
          <Text style={styles.resultItem}>
            📌 Listing Price: ${result.listingPrice}
          </Text>
          <Text style={styles.resultItem}>💸 Fees: -${result.fees}</Text>
          <Text style={styles.resultItem}>
            📦 Item Cost: -${result.itemCost}
          </Text>
          <Text style={styles.resultItem}>
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
