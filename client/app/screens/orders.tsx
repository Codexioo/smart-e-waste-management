import React, { useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import styles from "../../styles/ordersStyles";
import OrderCard from "../../components/OrderCard";
import { getOrders } from "../../services/ordersService";
import BottomBar from "../../components/bottombar";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Animated, { Layout } from "react-native-reanimated";

type OrderItem = {
  product_name: string;
  quantity: number;
};

type Order = {
  order_id: number;
  purchase_date: string;
  total_points_used: number;
  items: OrderItem[];
};

type GroupedOrders = {
  title: string;
  totalPoints: number;
  data: Order[];
  collapsed?: boolean;
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders[]>([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [minPoints, setMinPoints] = useState<string>("");
  const [maxPoints, setMaxPoints] = useState<string>("");
  const [sort, setSort] = useState<"date" | "pointsAsc" | "pointsDesc">("date");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isStartPicker, setIsStartPicker] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      if (res.success) {
        console.log("✅ Fetched Orders:", res.orders.length);
        res.orders.forEach((o: Order) =>
          console.log(`🧾 Order ID: ${o.order_id} → ${o.purchase_date}`)
        );
        

        setOrders(res.orders);
        setFilteredOrders(res.orders);
        groupAndSortOrders(res.orders);
      } else {
        alert("Failed to load orders");
      }
    } catch (err) {
      console.error("❌ Network error while fetching orders:", err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...orders];

    if (startDate && endDate) {
      result = result.filter((order: Order) => {
        const orderDate = new Date(order.purchase_date);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    if (minPoints) result = result.filter((o: Order) => o.total_points_used >= Number(minPoints));
    if (maxPoints) result = result.filter((o: Order) => o.total_points_used <= Number(maxPoints));

    if (sort === "pointsAsc") result.sort((a, b) => a.total_points_used - b.total_points_used);
    else if (sort === "pointsDesc") result.sort((a, b) => b.total_points_used - a.total_points_used);
    else result.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());

    setFilteredOrders(result);
    groupAndSortOrders(result);
  };

  const groupAndSortOrders = (orderList: Order[]) => {
    const monthMap: Record<string, GroupedOrders> = {};

    orderList.forEach((order) => {
      const date = new Date(order.purchase_date);
      if (isNaN(date.getTime())) return;

      const isoKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const readableTitle = format(date, "MMMM yyyy");

      if (!monthMap[isoKey]) {
        monthMap[isoKey] = {
          title: readableTitle,
          data: [],
          totalPoints: 0,
          collapsed: true,
        };
      }

      monthMap[isoKey].data.push(order);
      monthMap[isoKey].totalPoints += order.total_points_used;
    });

    const groups = Object.entries(monthMap)
      .sort(([a], [b]) => new Date(`${b}-01`).getTime() - new Date(`${a}-01`).getTime())
      .map(([_, group], i) => ({
        ...group,
        collapsed: false, // expand the most recent month
      }));

    console.log("==== Grouping Debug ====");
    Object.entries(monthMap).forEach(([key, group]) => {
      console.log(`${key} (${group.title}) → ${group.data.length} orders`);
    });
    console.log("Full groups array:", groups);

    setGroupedOrders(groups);
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setMinPoints("");
    setMaxPoints("");
    setSort("date");
    applyFilters();
  };

  const toggleCollapse = (title: string) => {
    const updated = groupedOrders.map((g) =>
      g.title === title ? { ...g, collapsed: !g.collapsed } : g
    );
    setGroupedOrders(updated);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <OrderCard
      date={format(new Date(item.purchase_date), "dd MMM yyyy, h:mm a")}
      totalPoints={item.total_points_used}
      items={item.items}
    />
  );

  const renderSectionHeader = ({ section }: { section: GroupedOrders }) => (
    <TouchableOpacity
      onPress={() => toggleCollapse(section.title)}
      style={{ backgroundColor: "#f9f9f9", paddingVertical: 6 }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#333" }}>
        📅 {section.title} — {section.totalPoints} pts {section.collapsed ? "▼" : "▲"}
      </Text>
    </TouchableOpacity>
  );

  const exportPDF = async () => {
    if (!filteredOrders.length) return alert("No orders to export");
  
    let grandTotal = 0;
    const monthMap: { [month: string]: { orders: Order[]; total: number } } = {};
  
    // Group and calculate per month
    filteredOrders.forEach((order) => {
      const month = format(new Date(order.purchase_date), "MMMM yyyy");
      if (!monthMap[month]) {
        monthMap[month] = { orders: [], total: 0 };
      }
  
      monthMap[month].orders.push(order);
      monthMap[month].total += order.total_points_used;
      grandTotal += order.total_points_used;
    });
  
    // Generate summary section
    const summaryHTML = `
      <h3 style="color:#000000;">Monthly Summary</h3>
      <table border="1" cellpadding="6" cellspacing="0" width="100%">
        <tr><th>Month</th><th>Total Points Used</th></tr>
        ${Object.entries(monthMap)
          .map(([month, group]) => `<tr><td>${month}</td><td>${group.total}</td></tr>`)
          .join("")}
        <tr><td><strong>Grand Total</strong></td><td><strong>${grandTotal}</strong></td></tr>
      </table>
      <br/>
    `;
  
    // Generate detailed sections
    const monthSections = Object.entries(monthMap).map(([month, group]) => {
      const ordersHTML = group.orders
        .map((order) => {
          const items = order.items
            .map((i) => `<tr><td>${i.product_name}</td><td>${i.quantity}</td></tr>`)
            .join("");
  
          return `
            <h4>🧾 ${format(new Date(order.purchase_date), "dd MMM yyyy, h:mm a")}</h4>
            <table border="1" cellpadding="6" cellspacing="0" width="100%">
              <tr><th>Product</th><th>Qty</th></tr>
              ${items}
            </table>
            <p><strong>Points Used:</strong> ${order.total_points_used}</p>
          `;
        })
        .join("<br/>");
  
      return `
        <h3 style="color:#000000;">${month}</h3>
        ${ordersHTML}
        <p style="text-align:right;"><strong>Monthly Total:</strong> ${group.total} pts</p>
        <hr/>
      `;
    });
  
    const html = `
      <html>
        <body style="font-family:Arial;padding:16px;">
          <h2 style="color:#000000;">Smart E-Waste – Order History</h2>
          ${summaryHTML}
          ${monthSections.join("")}
        </body>
      </html>
    `;
  
    try {
      const result = await Print.printToFileAsync({ html });
      if (!(await Sharing.isAvailableAsync())) return alert("Sharing not available");
      await Sharing.shareAsync(result.uri);
    } catch {
      alert("Failed to export PDF");
    }
  };
  

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Order History</Text>

        <TouchableOpacity onPress={() => { setIsStartPicker(true); setShowDatePicker(true); }} style={styles.filterButton}>
          <Text style={styles.filterText}>{startDate ? format(startDate, "dd MMM yyyy") : "Start Date"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setIsStartPicker(false); setShowDatePicker(true); }} style={styles.filterButton}>
          <Text style={styles.filterText}>{endDate ? format(endDate, "dd MMM yyyy") : "End Date"}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <TextInput
            placeholder="Min Points"
            keyboardType="numeric"
            value={minPoints}
            onChangeText={setMinPoints}
            style={[styles.filterInput, { marginRight: 10 }]}
          />
          <TextInput
            placeholder="Max Points"
            keyboardType="numeric"
            value={maxPoints}
            onChangeText={setMaxPoints}
            style={styles.filterInput}
          />
        </View>

        <View style={{ flexDirection: "row", marginVertical: 8 }}>
          {["date", "pointsAsc", "pointsDesc"].map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSort(key as any)}
              style={[styles.filterButton, sort === key && { backgroundColor: "#4CAF50" }]}
            >
              <Text style={[styles.filterText, sort === key && { color: "#fff" }]}>
                {key === "date" ? "Newest" : key === "pointsAsc" ? "Points ↑" : "Points ↓"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: "row", marginTop: 6 }}>
          <TouchableOpacity style={[styles.exportBtn, { flex: 1, marginRight: 6 }]} onPress={applyFilters}>
            <Text style={styles.exportText}>Apply Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.clearBtn, { flex: 1 }]} onPress={clearFilters}>
            <Text style={styles.clearText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.exportBtn, { marginVertical: 12 }]} onPress={exportPDF}>
          <Text style={styles.exportText}>Download as PDF</Text>
        </TouchableOpacity>

        {groupedOrders.length === 0 ? (
          <Text>No orders found.</Text>
        ) : (
          <SectionList
            sections={groupedOrders.map((section) => ({
              ...section,
              data: section.collapsed ? [] : section.data,
            }))}
            keyExtractor={(item) => item.order_id.toString()}
            renderItem={({ item }) => (
              <Animated.View layout={Layout.springify()}>
                {renderOrder({ item })}
              </Animated.View>
            )}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date: Date) => {
          isStartPicker ? setStartDate(date) : setEndDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      <BottomBar />
    </SafeAreaView>
  );
}
