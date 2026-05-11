// components/orders/OrderFiltersModal.tsx

import { Picker } from "@react-native-picker/picker";

import React, { useState } from "react";

import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
  visible: boolean;

  onClose: () => void;

  sellers: any[];

  selectedSeller: string;

  setSelectedSeller: (value: string) => void;

  selectedStatus: string;

  setSelectedStatus: (value: string) => void;

  selectedDate: string;

  setSelectedDate: (value: string) => void;
}

export default function OrderFiltersModal({
  visible,
  onClose,

  sellers,

  selectedSeller,
  setSelectedSeller,

  selectedStatus,
  setSelectedStatus,

  selectedDate,
  setSelectedDate,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [dateObject, setDateObject] = useState(new Date());
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.heading}>Filters</Text>

        {/* DATE */}

        <Text style={styles.label}>Date</Text>

        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{selectedDate || "Select Date"}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateObject}
            mode="date"
            display="default"
            onChange={(event, selected) => {
              setShowDatePicker(false);

              if (selected) {
                setDateObject(selected);

                const formattedDate = selected.toISOString().split("T")[0];

                setSelectedDate(formattedDate);
              }
            }}
          />
        )}

        {/* SELLER */}

        <Text style={styles.label}>Seller</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSeller}
            onValueChange={(value) => setSelectedSeller(value)}
          >
            <Picker.Item label="All Sellers" value="" />

            {sellers.map((item) => (
              <Picker.Item
                key={item._id}
                label={item.fullName}
                value={item.fullName}
              />
            ))}
          </Picker>
        </View>

        {/* STATUS */}

        <Text style={styles.label}>Status</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <Picker.Item label="All Status" value="" />

            <Picker.Item label="Submitted" value="submitted" />

            <Picker.Item label="Delivered" value="delivered" />

            <Picker.Item label="Cancelled" value="cancelled" />
          </Picker>
        </View>

        {/* CLOSE */}

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 12,
    marginBottom: 18,

    justifyContent: "center",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 18,
  },

  closeButton: {
    backgroundColor: "#2563eb",
    height: 50,
    borderRadius: 10,

    justifyContent: "center",
    alignItems: "center",

    marginTop: 20,
  },

  closeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
