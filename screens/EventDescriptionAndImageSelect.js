import React, {useState, useEffect} from 'react';

import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-gesture-handler';
import * as ImagePicker from 'react-native-image-picker';
import {SliderBox} from 'react-native-image-slider-box';
import {
  IconButton,
  Divider,
  Card,
  Paragraph,
  Button,
  Avatar,
} from 'react-native-paper';
import storage from '@react-native-firebase/storage';
import {firebase} from '@react-native-firebase/firestore';
import {firebase as authenticator} from '@react-native-firebase/auth';
import {addEvent} from '../api/mapsApi';

const defaultImage = [
  'https://images.unsplash.com/photo-1569511502671-8c1bbf96fc8d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1466&q=80',
];

export default function EventDescriptionAndImageSelect({route, navigation}) {
  const {eventDetails} = route.params;
  const [images, setImages] = useState(defaultImage);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState();

  const LAUCH_IMAGE_PICKER_OPTIONS = {
    selectionLimit: 5,
    includeBase64: true,
    mediaType: 'photo',
  };

  const LAUNCH_CAMERA_OPTIONS = {
    saveToPhotos: true,
    selectionLimit: 1,
    includeBase64: true,
    mediaType: 'photo',
    cameraType: 'back',
  };

  const handleImage = selectImages => {
    setImages(selectImages);
    console.log(selectImages);
  };

  const getAllUri = () => {
    const res = [];
    images.forEach(image => {
      res.push(image.uri);
    });
    return res;
  };

  const selectFile = () => {
    ImagePicker.launchImageLibrary(LAUCH_IMAGE_PICKER_OPTIONS, res => {
      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.errorCode) {
        console.log('Error Code: ', res.errorCode);
      } else if (res.errorMessage) {
        console.log('Image Picker Erro: ', res.errorMessage);
      } else {
        handleImage(res.assets);
      }
    });
  };

  const savePhoto = async (source, eventId, userId) => {
    const image_ref = storage().ref(`images/${userId}/${eventId}/event_photo1`);
    setIsUploading(true);
    try {
      await image_ref.putFile(source.uri);
      setIsUploading(false);
    } catch (err) {
      console.log('Error: ', err);
    }
    setImages(defaultImage);
  };

  const saveEventDetails = (eventId, userId) => {
    eventDetails.event_user_id = userId;
    eventDetails.event_id = eventId;
    eventDetails.event_description = description;
    addEvent(eventDetails);
  };

  const imagesUpLoaded = images.length > 0 && images != null;
  const LeftContent = props => (
    <Avatar.Icon {...props} icon="folder" style={{backgroundColor: WHITE}} />
  );

  const handleData = () => {
    if (authenticator.auth().currentUser != null) {
      const currentUserId = authenticator.auth().currentUser.uid;
      const eventId = firebase.firestore().collection('tmp').doc().id;
      savePhoto(images[0], eventId, currentUserId);
      saveEventDetails(eventId, currentUserId);
      navigation.navigate('Map');
    }
  };

  useEffect(() => {
    console.log('Current Event Details: ', eventDetails);
  }, []);

  return (
    <View style={styles.container}>
      <SliderBox
        images={images}
        sliderBoxHeight={300}
        onCurrentImagePressed={selectFile}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          backgroundColor: WHITE,
          width: '100%',
        }}>
        <Button
          icon="pencil"
          color={BLUE}
          onPress={selectFile}
          style={styles.button}
          labelStyle={{color: BLUE}}
          mode="outlined">
          Edit
        </Button>
        <Button
          icon="upload"
          color={BLUE}
          onPress={selectFile}
          style={styles.button}
          labelStyle={{color: BLUE}}
          mode="outlined">
          Upload
        </Button>
      </View>
      <View style={{margin: 10, marginBottom: 5, marginTop: 5}}>
        <Text style={{fontSize: 20, color: BLUE, fontWeight: '500'}}>
          Enter Event Description Below:
        </Text>
      </View>
      <SafeAreaView
        style={{
          marginLeft: 5,
          marginRight: 5,
          borderWidth: 1,
          borderColor: BLUE,
          borderRadius: 2,
          height: 310,
        }}>
        <ScrollView style={{marginHorizontal: 2}}>
          <TextInput
            value={description}
            onChangeText={text => {
              setDescription(text);
            }}
            style={styles.textInputStyle}
            multiline={true}
            numberOfLines={30}
            placeholder="Enter Here"
            placeholderTextColor="gray"></TextInput>
        </ScrollView>
      </SafeAreaView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          backgroundColor: WHITE,
          width: '100%',
          marginTop: 10,
        }}>
        <Button
          icon="content-save"
          mode="contained"
          color={BLUE}
          onPress={handleData}
          labelStyle={{color: WHITE}}>
          Create Event
        </Button>
      </View>
    </View>
  );
}
const GREEN = '#19a86a';
const BLUE = '#002f4c';
const ORANGE = '#e29e21';
const WHITE = '#f9f9f9';
const GRAY = '#d7d7d7';

const TITLE_COLOR = BLUE;
const ICON_SIZE = 27;

const styles = StyleSheet.create({
  main_container: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    //justifyContent: 'center',
    backgroundColor: BLUE,
  },
  container: {
    flex: 1,
    height: 200,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    margin: 5,
    borderWidth: 2,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
  },
  textInputStyle: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '400',
    marginTop: 0,
    paddingLeft: 16,
  },
});
