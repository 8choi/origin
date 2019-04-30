import React from 'react'
import { Image } from 'react-native'
import {
  createAppContainer,
  createBottomTabNavigator,
  createStackNavigator
} from 'react-navigation'

import ForkScreen from 'screens/fork'
import MarketplaceScreen from 'screens/marketplace'
import SettingsScreen from 'screens/settings'
import WalletScreen from 'screens/wallet'
import AccountsScreen from 'screens/accounts'
import AccountScreen from 'screens/account'

const IMAGES_PATH = '../assets/images/'

const defaultNavigationOptions = () => ({
  headerBackTitle: ' ',
  headerStyle: {
    backgroundColor: 'white'
  }
})

const MarketplaceStack = createStackNavigator(
  {
    Marketplace: MarketplaceScreen
  },
  {
    defaultNavigationOptions
  }
)

const WalletStack = createStackNavigator(
  {
    Wallet: WalletScreen
  },
  {
    defaultNavigationOptions,
    cardStyle: {
      backgroundColor: '#f7f8f8'
    }
  }
)

const SettingsStack = createStackNavigator(
  {
    Account: AccountScreen,
    Accounts: AccountsScreen,
    Settings: SettingsScreen
  },
  {
    initialRouteName: 'Settings',
    defaultNavigationOptions
  }
)

const OnboardingStack = createStackNavigator(
  {
    Fork: ForkScreen
  },
  {
    initialRouteName: 'Fork',
    defaultNavigationOptions: () => ({
      headerBackTitle: ' ',
      headerStyle: {
        backgroundColor: '#293f55',
        borderBottomWidth: 0
      },
      headerTitleStyle: {
        color: 'white',
        fontFamily: 'Poppins',
        fontSize: 17,
        fontWeight: 'normal'
      }
    })
  }
)

const OriginNavigator = createBottomTabNavigator(
  {
    Marketplace: MarketplaceStack,
    Wallet: WalletStack,
    Settings: SettingsStack
  },
  {
    initialRouteName: 'Marketplace',
    order: ['Marketplace', 'Wallet', 'Settings'],
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state

        // require expects string literal :(
        if (routeName === 'Marketplace') {
          return focused ? (
            <Image source={require(IMAGES_PATH + 'market-active.png')} />
          ) : (
            <Image source={require(IMAGES_PATH + 'market-inactive.png')} />
          )
        } else if (routeName === 'Wallet') {
          return focused ? (
            <Image source={require(IMAGES_PATH + 'wallet-active.png')} />
          ) : (
            <Image source={require(IMAGES_PATH + 'wallet-inactive.png')} />
          )
        } else if (routeName === 'Settings') {
          return focused ? (
            <Image source={require(IMAGES_PATH + 'settings-active.png')} />
          ) : (
            <Image source={require(IMAGES_PATH + 'settings-inactive.png')} />
          )
        }
      }
    }),
    tabBarOptions: {
      activeTintColor: '#007fff',
      iconStyle: {
        marginTop: 10
      },
      inactiveTintColor: '#c0cbd4',
      showLabel: false,
      style: {
        backgroundColor: 'white'
      },
      tabStyle: {
        justifyContent: 'space-around'
      }
    }
  }
)

const OriginMarketplaceApp = createAppContainer(OriginNavigator);

export {
  MarketplaceStack,
  WalletStack,
  SettingsStack,
  OnboardingStack,
  OriginMarketplaceApp
}
