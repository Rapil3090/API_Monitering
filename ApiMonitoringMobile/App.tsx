/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApiListScreen } from './src/screens/ApiListScreen';
import { ApiCreateScreen } from './src/screens/ApiCreateScreen';
import { ApiDeleteScreen } from './src/screens/ApiDeleteScreen';
import { View, TouchableOpacity, Text } from 'react-native';

type RootStackParamList = {
  ApiList: undefined;
  ApiCreate: undefined;
  ApiDelete: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="ApiList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="ApiList"
          component={ApiListScreen}
          options={({ navigation }) => ({
            title: 'API 목록',
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ApiCreate')}
                  style={{ marginRight: 16 }}
                >
                  <Text style={{ color: '#fff', fontSize: 16 }}>생성</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ApiDelete')}
                >
                  <Text style={{ color: '#fff', fontSize: 16 }}>삭제</Text>
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="ApiCreate"
          component={ApiCreateScreen}
          options={{
            title: 'API 생성',
          }}
        />
        <Stack.Screen
          name="ApiDelete"
          component={ApiDeleteScreen}
          options={{
            title: 'API 삭제',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
