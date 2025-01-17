import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
} from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useFocusEffect } from "@react-navigation/native";

const COLORS = [
  "#177AD5",
  "#FF5733",
  "#33FF57",
  "#F39C12",
  "#8E44AD",
  "#3498DB",
  "#E74C3C",
  "#2ECC71",
];

export interface Expense {
  name: string;
  category: string;
  amount: number;
  creationDate: string;
}

const TableView = ({ expenses }: { expenses: Expense[] }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.heading}>Expense List</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.category}</Text>
            <Text style={styles.cell}>{item.amount.toFixed(2)}</Text>
            <Text style={styles.cell}>{item.creationDate.split("T")[0]}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={[styles.row, styles.header]}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Category</Text>
            <Text style={styles.headerCell}>Amount</Text>
            <Text style={styles.headerCell}>Date</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const ChartsView = ({ expenses }: { expenses: Expense[] }) => {
  const getCategoryChartData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(({ category, amount }) => {
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });

    return Object.entries(categoryTotals).map(([category, value], index) => ({
      value,
      label: category,
      frontColor: COLORS[index % COLORS.length],
    }));
  }, [expenses]);

  const getDailyChartData = useMemo(() => {
    const dateTotals: { [key: string]: number } = {};
    expenses.forEach(({ creationDate, amount }) => {
      const date = creationDate.split("T")[0];
      dateTotals[date] = (dateTotals[date] || 0) + amount;
    });

    return Object.entries(dateTotals).map(([date, value], index) => ({
      value,
      label: date.slice(5),
      frontColor: COLORS[index % COLORS.length],
    }));
  }, [expenses]);

  const getPieChartData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(({ category, amount }) => {
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });

    return Object.entries(categoryTotals).map(([category, value], index) => ({
      value,
      text: category,
      color: COLORS[index % COLORS.length],
    }));
  }, [expenses]);

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>Expense Analysis</Text>

        <Text style={styles.chartTitle}>Total Expense by Category</Text>
        <BarChart
          barWidth={22}
          noOfSections={4}
          barBorderRadius={4}
          data={getCategoryChartData}
          yAxisThickness={1}
          xAxisThickness={1}
        />

        <Text style={styles.chartTitle}>Daily Expense Trend</Text>
        <BarChart
          barWidth={22}
          noOfSections={4}
          barBorderRadius={4}
          data={getDailyChartData}
          yAxisThickness={1}
          xAxisThickness={1}
        />

        <Text style={styles.chartTitle}>Expense Distribution</Text>
        <PieChart
          data={getPieChartData}
          donut
          showText
          textSize={12}
          radius={100}
          innerRadius={50}
          showValuesAsLabels
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const ExpenseTabView = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "charts", title: "Charts" },
    { key: "table", title: "Table" },
  ]);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );
  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem("expenses");
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderScene = SceneMap({
    charts: () => <ChartsView expenses={expenses} />,
    table: () => <TableView expenses={expenses} />,
  });

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#177AD5" style={styles.loader} />
    );
  }

  if (expenses.length === 0) {
    return <Text style={styles.noData}>No expenses found</Text>;
  }

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: 400 }}
    />
  );
};

export default ExpenseTabView;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 200,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noData: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  row: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
  },
  header: {
    backgroundColor: "#f1f1f1",
    fontWeight: "bold",
  },
  headerCell: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },
  tabBar: {
    backgroundColor: "#177AD5",
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
