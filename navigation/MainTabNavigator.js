import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabNavigator, TabBarBottom } from 'react-navigation';

import Colors from '../constants/Colors';

import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MapScreen from '../screens/MapScreen'
import MyLocationMapMarker from '../screens/MyLocationMapMarker'

export default TabNavigator(
  {
      MAP: {
          screen: MapScreen,
      },
    Home: {
      screen: HomeScreen,
    },
    Links: {
      screen: MyLocationMapMarker,
    },
    Settings: {
      screen: SettingsScreen,
    },

  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Home':
            iconName = Platform.OS === 'ios'
              ? `ios-information-circle${focused ? '' : '-outline'}`
              : 'md-information-circle';
            break;
          case 'Links':
            iconName = Platform.OS === 'ios'
              ? `ios-barcode${focused ? '' : '-outline'}`
              : 'md-link';
            break;
          case 'MAP':
              iconName = Platform.OS === 'ios'
                  ? `ion-magnet${focused ? '' : '-outline'}`
                  : 'md-view_module';
          case 'Settings':
            iconName = Platform.OS === 'ios'
              ? `ios-cloud-circle${focused ? '' : '-outline'}`
              : 'md-view_module';
        }
        return (
          <Ionicons
            name={iconName}
            size={28}
            style={{ marginBottom: -3 }}
            color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
          />
        );
      },
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
  }
);
