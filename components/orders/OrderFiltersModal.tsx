// components/orders/OrderFiltersModal.tsx

import React, { useEffect, useState } from "react";

import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import API from "@/services/api";
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

  selectedDeliveryBy: string;

  setSelectedDeliveryBy: (value: string) => void;
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

  selectedDeliveryBy,
  setSelectedDeliveryBy,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [dateObject, setDateObject] = useState(new Date());

  const [statuses, setStatuses] = useState<string[]>([]);
  const [deliveryPersons, setDeliveryPersons] = useState<string[]>([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await API.get(`/orders/filters/options`);

      setStatuses(response.data.statuses || []);
      setDeliveryPersons(response.data.deliveryBy || []);
    } catch (error) {
      console.log(error);
    }
  };

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

        <View style={styles.optionsContainer}>
          {sellers.map((seller) => (
            <TouchableOpacity
              key={seller._id}
              style={[
                styles.optionButton,
                selectedSeller === seller.fullName && styles.selectedOption,
              ]}
              onPress={() =>
                setSelectedSeller(
                  selectedSeller === seller.fullName ? "" : seller.fullName,
                )
              }
            >
              <Text
                style={[
                  styles.optionText,
                  selectedSeller === seller.fullName &&
                    styles.selectedOptionText,
                ]}
              >
                {seller.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* STATUS */}

        <Text style={styles.label}>Status</Text>

        <View style={styles.optionsContainer}>
          {statuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.optionButton,
                selectedStatus === status && styles.selectedOption,
              ]}
              onPress={() =>
                setSelectedStatus(selectedStatus === status ? "" : status)
              }
            >
              <Text
                style={[
                  styles.optionText,
                  selectedStatus === status && styles.selectedOptionText,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Deliver By</Text>

        <View style={styles.optionsContainer}>
          {deliveryPersons.map((person) => (
            <TouchableOpacity
              key={person}
              style={[
                styles.optionButton,
                selectedDeliveryBy === person && styles.selectedOption,
              ]}
              onPress={() =>
                setSelectedDeliveryBy(
                  selectedDeliveryBy === person ? "" : person,
                )
              }
            >
              <Text
                style={[
                  styles.optionText,
                  selectedDeliveryBy === person && styles.selectedOptionText,
                ]}
              >
                {person}
              </Text>
            </TouchableOpacity>
          ))}
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

  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  selectedOption: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },

  selectedOptionText: {
    color: "#ffffff",
  },
});
