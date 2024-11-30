import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchApartmentList, fetchUnitList } from '../features/apartmentSlice';
import { bindApartment } from '../features/apartmentSlice';
import { RootStackParamList } from '@/components/types';

interface Apartment {
  id: string;
  name: string;
  address: string;
}

interface Unit {
  unitId: string;
  unitName: string;
}

const SubToAPT = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [zipcode, setZipcode] = useState('');
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(
    null
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const dispatch = useAppDispatch();
  const { aptList } = useAppSelector((state) => state.apartment);

  const fetchApartmentData = async () => {
    setIsLoading(true); // Start loading
    await dispatch(fetchApartmentList(zipcode));
    setIsLoading(false); // End loading
  };

  useEffect(() => {
    if (zipcode.length === 5 && /^[0-9]{5}$/.test(zipcode)) {
      fetchApartmentData();
    } else {
      setApartments([]);
    }
  }, [zipcode]);

  useEffect(() => {
    if (aptList.length > 0) {
      const transformedData = aptList.map((apt) => ({
        id: apt.apartmentId,
        name: apt.apartmentName,
        address: apt.address,
      }));
      setApartments(transformedData);
    } else if (!isLoading) {
      setApartments([]);
    }
  }, [aptList, isLoading]);

  useEffect(() => {
    if (selectedApartmentId) {
      const fetchUnits = async () => {
        try {
          setIsLoading(true); // Start loading
          const resultAction = await dispatch(fetchUnitList(selectedApartmentId));
          if (fetchUnitList.fulfilled.match(resultAction)) {
            const fetchedUnitList = resultAction.payload.unitList || []; // Raw data from the API
            setUnits(fetchedUnitList); // Update the local units state with raw data
          } else {
            console.error('Failed to fetch unit data:', resultAction.error);
          }
        } catch (error) {
          console.error('Unexpected error fetching unit data:', error);
        } finally {
          setIsLoading(false); // End loading
        }
      };

      fetchUnits();
    } else {
      setUnits([]); // Clear units if no apartment is selected
    }
  }, [selectedApartmentId, dispatch]);

  const handleApartmentSelect = (id: string) => {
    setSelectedApartmentId(selectedApartmentId === id ? null : id);
    setSelectedUnitId(null); // Reset selected unit when a new apartment is selected
  };

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(unitId);
  };

  const filteredUnits = (units: Unit[]) => {
    if (!searchQuery) return units;
    return units.filter((unit) =>
      unit.unitName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const bindApartmentAction = async () => {
    if (selectedApartmentId && selectedUnitId) {
      try {
        const resultAction = await dispatch(
          bindApartment({ apartmentId: selectedApartmentId, unitId: selectedUnitId })
        ).unwrap();
  
        // Handle the result
        console.log("Bind Apartment Result:", resultAction);
  
        Alert.alert("Success", "You have successfully subscribed to the unit.");
        navigation.navigate('Zippora/ZipporaHome');
      } catch (error) {
        console.error("Error binding apartment:", error);
        Alert.alert("Error", "Failed to subscribe to the apartment. Please try again.");
      }
    } else {
      Alert.alert("Error", "Please select an apartment and a unit.");
    }
  };

  const handleSubscribe = async () => {
    const result = await bindApartmentAction();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Zipcode</Text>
      <TextInput
        style={[
          styles.zipcodeInput,
          zipcode.length === 5 && aptList && styles.errorInput,
        ]}
        placeholder="Enter Zipcode"
        value={zipcode}
        onChangeText={setZipcode}
        keyboardType="numeric"
      />
      {zipcode.length === 5 && !isLoading && aptList.length === 0 && (
        <Text style={styles.errorText}>No apartments found for this zipcode</Text>
      )}
      {isLoading ? (
        <Text style={styles.loadingText}>Loading apartments...</Text>
      ) : (
        apartments.length > 0 && (
          <FlatList
            data={apartments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity
                  style={[
                    styles.apartmentCard,
                    selectedApartmentId === item.id && styles.selectedApartment,
                  ]}
                  onPress={() => handleApartmentSelect(item.id)}
                >
                  <View style={styles.apartmentHeader}>
                    <Text style={styles.apartmentName}>{item.name}</Text>
                    <Text style={styles.apartmentAddress}>{item.address}</Text>
                  </View>
                  <Text style={styles.expandIcon}>
                    {selectedApartmentId === item.id ? '-' : '+'}
                  </Text>
                </TouchableOpacity>
                {selectedApartmentId === item.id && (
                  <View style={styles.unitContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search for a unit"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    <FlatList
                      data={filteredUnits(units)}
                      keyExtractor={(unit) => unit.unitId}
                      numColumns={3}
                      columnWrapperStyle={styles.unitRow}
                      renderItem={({ item: unit }) => (
                        <TouchableOpacity
                          style={[
                            styles.unitCard,
                            selectedUnitId === unit.unitId && styles.selectedUnit,
                          ]}
                          onPress={() => handleUnitSelect(unit.unitId)}
                        >
                          <Text style={styles.unitName}>{unit.unitName}</Text>
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <Text style={styles.noUnitsText}>No units available</Text>
                      }
                    />
                  </View>
                )}
              </View>
            )}
          />
        )
      )}
      {selectedUnitId && (
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>Subscribe</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  zipcodeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  apartmentCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedApartment: {
    backgroundColor: '#e0ffe0',
  },
  apartmentHeader: {
    flex: 1,
  },
  apartmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  apartmentAddress: {
    fontSize: 14,
    color: '#666',
  },
  expandIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  unitContainer: {
    paddingVertical: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  unitRow: {
    justifyContent: 'flex-start', // Align units to the left
    marginBottom: 8,
  },
  unitCard: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  selectedUnit: {
    backgroundColor: 'rgba(0, 128, 0, 0.8)',
  },
  unitName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  noUnitsText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  subscribeButton: {
    backgroundColor: 'green',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SubToAPT;
