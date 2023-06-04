/* eslint-disable prettier/prettier */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginView from './Login';
import { NavigationContainer } from '@react-navigation/native';
import MainView from './Main';
const Stack = createNativeStackNavigator();

const App: React.FC<{}> = () => {

  return (
    <NavigationContainer>

      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Connect" component={LoginView} />
        <Stack.Screen name="Main" component={MainView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};



export default App;
