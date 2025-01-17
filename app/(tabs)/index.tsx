import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { produce } from "immer";
import DateTimePicker from "@react-native-community/datetimepicker";

const CATEGORY_OPTIONS = ["Food", "Travel", "Entertainment", "Other"];

export interface Expense {
  name: string;
  category: string;
  amount: number;
  creationDate: string;
}

const ExpenseCreation = () => {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [currentExpense, setCurrentExpense] = useState({
    name: "",
    category: "Food",
    amount: "",
    creationDate: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem("expenses");
      if (storedExpenses) {
        setAllExpenses(JSON.parse(storedExpenses));
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

  const handleCreateExpense = async () => {
    if (!currentExpense.name || !currentExpense.amount) {
      Alert.alert("Error", "Please enter all fields");
      return;
    }

    const newExpense = {
      ...currentExpense,
      amount: parseFloat(currentExpense.amount),
      creationDate: currentExpense.creationDate.toISOString(),
    };

    const updatedExpenses = [...allExpenses, newExpense];

    try {
      await AsyncStorage.setItem("expenses", JSON.stringify(updatedExpenses));
      setAllExpenses(updatedExpenses);
      setCurrentExpense({
        name: "",
        category: "Food",
        amount: "",
        creationDate: new Date(),
      });
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setCurrentExpense(
        produce((draft) => {
          draft.creationDate = selectedDate;
        })
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Expense Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter expense name"
        value={currentExpense.name}
        onChangeText={(text) =>
          setCurrentExpense(
            produce((draft) => {
              draft.name = text;
            })
          )
        }
      />

      <Text style={styles.label}>Category</Text>
      <Picker
        selectedValue={currentExpense.category}
        onValueChange={(itemValue) =>
          setCurrentExpense(
            produce((draft) => {
              draft.category = itemValue;
            })
          )
        }
        style={styles.picker}
      >
        {CATEGORY_OPTIONS.map((category) => (
          <Picker.Item key={category} label={category} value={category} />
        ))}
      </Picker>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={currentExpense.amount}
        onChangeText={(text) =>
          setCurrentExpense(
            produce((draft) => {
              draft.amount = text;
            })
          )
        }
      />

      <Text style={styles.label}>Date</Text>
      <Button
        title={currentExpense.creationDate.toDateString()}
        onPress={() => setShowDatePicker(true)}
      />

      {showDatePicker && (
        <DateTimePicker
          value={currentExpense.creationDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}
      <View style={{ width: 100, height: 1, marginTop: 20 }}></View>
      <Button title="Create Expense" onPress={handleCreateExpense} />
    </View>
  );
};

export default ExpenseCreation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
  },
});
