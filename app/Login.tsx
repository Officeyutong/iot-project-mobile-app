/* eslint-disable prettier/prettier */
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from 'react-native-elements';
import { SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  mainView: {
    paddingTop: 10,
  },
});

setUpdateIntervalForType(SensorTypes.accelerometer, 100);
setUpdateIntervalForType(SensorTypes.gyroscope, 100);
setUpdateIntervalForType(SensorTypes.orientation, 100);
setUpdateIntervalForType(SensorTypes.gravity, 100);



const LoginView: React.FC<{}> = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const nav = useNavigation();
  const [url, setURL] = useState('http://192.168.1.6:15253');
  const handleLogin = async () => {
    nav.navigate('Main', { serverURL: url });
  };
  return <SafeAreaView style={backgroundStyle}>
    <StatusBar
      barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={backgroundStyle.backgroundColor}
    />
    <ScrollView style={styles.mainView}>
      <View style={styles.container}>
        <Input
          label="服务端URL"
          placeholder="服务端URL"
          value={url}
          onChangeText={setURL}
        />

        <Button
          title="连接"
          onPress={handleLogin}
        />
      </View>
    </ScrollView>
  </SafeAreaView>;

};

export default LoginView;
