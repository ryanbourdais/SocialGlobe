import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  ScrollView,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {addEvent} from '../api/mapsApi';
import {TextInput, Checkbox} from 'react-native-paper';
import {useNavigation} from '@react-navigation/core';
import Geolocation from 'react-native-geolocation-service';
import DatePicker from 'react-native-date-picker';
import FileCard from '../components/FileCard';
import AddressLookUp from '../components/AddressLookUp';
import {SafeAreaView} from 'react-native-safe-area-context';

const BORDER_COLOR = 'black';
const TEXT_COLOR = 'black';
const GREEN = '#66f5a7';
const PLACEHOLDER_COLOR = 'black';
const BUTTON_COLOR = 'gray';

if (Platform.OS == 'ios') {
  Geolocation.setRNConfiguration({
    authorizationLevel: 'always',
  });
  Geolocation.requestAuthorization();
}

export default function CreateEventOverlay() {
  const [currentUserLocation, setCurrentUserLocation] = useState({
    latitude: 30.4077484,
    longitude: -91.1794054,
    latitudeDelta: 0.009,
    longitudeDelta: 0.009,
  });
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [eventCoordinates, setEventCoordinates] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.009,
    longitudeDelta: 0.0009,
  });
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [eventVisibility, setEventVisibility] = useState('public');
  const [visibilityOptions, setVisibilityOptions] = useState([
    {label: 'Public', value: 'public'},
    {label: 'Private', value: 'private'},
  ]);
  const [eventPictures, setEventPictures] = useState([
    {title: 'longfilename.txt'},
    {title: 'short.txt'},
  ]);
  const navigation = useNavigation();
  const [isVisible, setVisibility] = useState(false);
  function geoSuccess(position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;

    setCurrentUserLocation({
      latitude: lat,
      longitude: long,
      latitudeDelta: 0.009,
      longitudeDelta: 0.0009,
    });
  }

  function getUserLocation() {
    Geolocation.getCurrentPosition(
      geoSuccess,
      err => {
        console.log(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }

  async function requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'SocialGlobe',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getUserLocation();
      } else {
        console.log('Location denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }
  function createEvent() {
    const EVENT = {
      title: title,
      address: address,
      coordinates: eventCoordinates,
      date: date,
      visibility: eventVisibility,
      description: description,
    };
    addEvent(EVENT);
    navigation.navigate('Map');
  }
  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'lightgray',
      }}>
      <View style={{marginTop: 15}}>
        <Text stlyle={styles.inputStyle}>Enter event information below!</Text>
      </View>
      <View style={styles.rowStyle}>
        <TextInput
          label="Title"
          mode="outlined"
          value={title}
          style={styles.inputStyle}
          onChangeText={value => setTitle(value)}
          placeholder="Event Title"
          activeOutlineColor={GREEN}
          placeholderTextColor={PLACEHOLDER_COLOR}></TextInput>
      </View>
      <View style={{flex: 1, height: 200, margin: 15, width: '93%'}}>
        <ScrollView style={{marginHorizontal: 2}}>
          <AddressLookUp
            location={currentUserLocation}
            setAddress={setAddress}
            setCoordinates={setEventCoordinates}
          />
        </ScrollView>
      </View>
      <View style={{flexDirection: 'row', marginLeft: 15, marginRight: 15}}>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => setOpen(true)}>
          <Text>Date</Text>
        </TouchableOpacity>
        <Text
          style={{
            width: '80%',
            flexDirection: 'row',
            borderRadius: 5,
            fontSize: 15,
            alignItems: 'center',
            justifyContent: 'center',
            margin: 10,
          }}>
          {`${date.toLocaleString()}`}
        </Text>
        <DatePicker
          modal
          open={open}
          date={date}
          onConfirm={date => {
            setOpen(false);
            setDate(date);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'column',
          height: 200,
          width: '100%',
        }}
        height="50%">
        <TextInput
          label="Description"
          mode="outlined"
          value={description}
          style={{margin: 15, height: '70%', borderColor: GREEN}}
          multiline={true}
          onChangeText={value => setDescription(value)}
          placeholder=" Enter Description"
          placeholderTextColor={PLACEHOLDER_COLOR}></TextInput>
      </View>
      <View style={styles.rowStyle}>
        <View style={{flexDirection: 'row', margin: 15}}>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => {
              setEventPictures([...eventPictures, {title: 'test'}]);
            }}>
            <Text>Upload</Text>
          </TouchableOpacity>
          <View
            style={{
              width: '80%',
              borderWidth: 1,
              borderColor: 'gray',
              flexDirection: 'row',
              borderRadius: 5,
            }}>
            {eventPictures.map((file, index) => (
              <FileCard cardTitle={index} fileName={file.title} />
            ))}
          </View>
        </View>
      </View>
      <View style={{flexDirection: 'row', marginBottom: 15}}>
        <TouchableOpacity style={styles.buttonStyle} onPress={createEvent}>
          <Text>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowStyle: {flexDirection: 'row'},
  inputStyle: {
    height: 50,
    flex: 1,
    //borderColor: BORDER_COLOR,
    //borderWidth: 1,
    //borderRadius: 10,
    margin: 15,
    color: TEXT_COLOR,
    flexGrow: 1,
  },
  textStyle: {
    marginLeft: 10,
    color: TEXT_COLOR,
    fontSize: 15,
    height: 50,
    //borderColor: '#5bff33',
    //borderWidth: 2,
    //borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 5,
    paddingRight: 5,
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: BUTTON_COLOR,
    padding: 10,
    marginRight: 5,
    borderWidth: 1.5,
    borderColor: BUTTON_COLOR,
    borderRadius: 5,
  },
  pickerStyle: {
    width: '70%',
  },
  shadow: {
    borderColor: 'gray', // if you need
    borderWidth: 1,
    overflow: 'hidden',
  },
  createButton: {
    marginBottom: 15,
  },
});
