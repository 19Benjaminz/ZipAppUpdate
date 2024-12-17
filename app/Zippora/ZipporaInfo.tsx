import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from "../store";
import { fetchUserApartments } from "../features/zipporaInfoSlice";
import { unsubscribeApartment } from "../features/apartmentSlice";
import { RootStackParamList } from '../../components/types';
import { MaterialIcons } from "@expo/vector-icons"; // For the icon
import ZIPText from "@/components/ZIPText";

const ZipporaInfo = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { apartmentList, loading, error } = useAppSelector((state) => state.zipporaInfo);

  useEffect(() => {
    dispatch(fetchUserApartments());
  }, [dispatch]);

  const unsubApartment = async (apartmentId: string) => {
    await dispatch(unsubscribeApartment(apartmentId));
  };

  const handleUnsubscribe = (apartmentId: string) => {
    Alert.alert(
      "Unsubscribe",
      "Are you sure you want to unsubscribe from this apartment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Unsubscribe",
          style: "destructive",
          onPress: async () => {
            await unsubApartment(apartmentId);
            navigation.navigate("Zippora/ZipporaHome");
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => dispatch(fetchUserApartments())} />
      }
    >
      <View style={styles.header}>
        <ZIPText style={styles.headerText}>Your Apartments</ZIPText>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {apartmentList.map((apartment) => (
        <View key={apartment.apartmentId} style={styles.apartmentCard}>
          <MaterialIcons name="home" size={36} color="#2ABB67" style={styles.icon} />
          <View style={styles.apartmentInfo}>
            <Text style={styles.apartmentName}>{apartment.apartmentName}</Text>
            <Text style={styles.apartmentAddress}>{apartment.unitName} - {apartment.zipporaList[0].address}</Text>
            <Text style={styles.approveStatus}>
                {apartment.approveStatus === "0" && "Pending Management Approval"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.unsubscribeButton}
            onPress={() => handleUnsubscribe(apartment.apartmentId)}
          >
            <Text style={styles.unsubscribeButtonText}>Unsubscribe</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  apartmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  apartmentInfo: {
    flex: 1,
  },
  apartmentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  apartmentAddress: {
    fontSize: 14,
    color: "#666",
    marginVertical: 4,
  },
  approveStatus: {
    fontSize: 14,
    color: "red",
    fontWeight: "bold",
  },
  unsubscribeButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  unsubscribeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default ZipporaInfo;
