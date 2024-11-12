import React, { useEffect } from 'react';
import { View, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
//import * as zipporaHomeActions from '../../actions/zipporaHomeAction';
import ZIPText from '../../components/ZIPText';
//import { RootState } from '../../store'; // Import RootState from your store to type the Redux state

interface ZipporaHomeProps {
  componentId?: string;
}

const ZipporaHome: React.FC<ZipporaHomeProps> = ({ componentId }) => {
  //const dispatch = useDispatch();
//   const { zipList, loading, error } = useSelector((state: RootState) => state.zipporaHome);

//   useEffect(() => {
//     dispatch(zipporaHomeActions.loadZipList());
//   }, [dispatch]);

  const handleUpdatePrompt = () => {
    Alert.alert('A new version is available', 'Please update for the latest features.', [
      { text: 'Cancel' },
      { text: 'Update', onPress: () => Linking.openURL('app_link') },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {/* {zipList.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() =>
              Navigation.push(componentId, {
                component: { name: 'ZipproaLocation', passProps: { zippora: item } },
              })
            }
          >
            <ZIPText>{item.cabinetId}</ZIPText>
          </TouchableOpacity>
        ))} */}
      </View>
      {/* {loading && <Text>Loading...</Text>}
      {error && <Text>Error loading zip list</Text>} */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  section: { padding: 10, backgroundColor: 'white', borderRadius: 4 },
});

export default ZipporaHome;
