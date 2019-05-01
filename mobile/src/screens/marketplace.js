'use strict'

import React, { Component } from 'react'
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Modal,
  StyleSheet,
  StatusBar,
  View
} from 'react-native'
import {
  Directions,
  FlingGestureHandler,
  State
} from 'react-native-gesture-handler'
import { WebView } from 'react-native-webview'
import { connect } from 'react-redux'
import SafeAreaView from 'react-native-safe-area-view'

import NotificationCard from 'components/notification-card'
import SignatureCard from 'components/signature-card'
import TransactionCard from 'components/transaction-card'

class MarketplaceScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      modals: []
    }

    DeviceEventEmitter.addListener(
      'transactionHash',
      this.handleTransactionHash.bind(this)
    )

    DeviceEventEmitter.addListener(
      'messageSigned',
      this.handleSignedMessage.bind(this)
    )

    DeviceEventEmitter.addListener(
      'messagingKeys',
      this.injectMessagingKeys.bind(this)
    )

    this.onWebViewMessage = this.onWebViewMessage.bind(this)
    this.onRightFling = this.onRightFling.bind(this)
    this.onLeftFling = this.onLeftFling.bind(this)
    this.toggleModal = this.toggleModal.bind(this)
  }

  static navigationOptions = () => {
    return {
      header: null
    }
  }

  componentDidMount() {
    console.debug(
      `Opening marketplace DApp at ${this.props.settings.network.dappUrl}`
    )
    this.props.navigation.setParams({ toggleModal: this.toggleModal })
  }

  onWebViewMessage(event) {
    let msgData
    try {
      msgData = JSON.parse(event.nativeEvent.data)
    } catch (err) {
      console.warn(err)
      return
    }

    if (this[msgData.targetFunc]) {
      // Function handler exists, use that
      const response = this[msgData.targetFunc].apply(this, [msgData.data])
      this.handleBridgeResponse(msgData, response)
    } else {
      const hasNotificationsEnabled = this.props.activation.notifications
        .permissions.hard.alert

      if (!hasNotificationsEnabled) {
        this.setState(prevState => ({
          modals: [
            ...prevState.modals,
            {
              type: 'enableNotifications'
            }
          ]
        }))
      }

      this.setState(prevState => ({
        modals: [
          ...prevState.modals,
          { type: msgData.targetFunc, msgData: msgData }
        ]
      }))
    }
  }

  onRightFling({ nativeEvent }) {
    if (nativeEvent.state === State.ACTIVE) {
      console.debug('Go back')
      this.dappWebView.goBack()
    }
  }

  onLeftFling({ nativeEvent }) {
    if (nativeEvent.state === State.ACTIVE) {
      console.debug('Go forward')
      this.dappWebView.goForward()
    }
  }

  getAccounts() {
    const { wallet } = this.props
    const filteredAccounts = wallet.accounts.filter(
      a => a.address !== wallet.activeAccount.address
    )
    const accounts = [
      wallet.activeAccount.address,
      ...filteredAccounts.map(a => a.address)
    ]
    return accounts
  }

  /* Inject the cookies required for messaging to allow preenabling of messaging
   * for accounts
   */
  injectMessagingKeys() {
    const { wallet } = this.props
    const keys = wallet.messagingKeys
    if (keys) {
      const keyInjection = `
        (function() {
          if (window && window.context && window.context.messaging) {
            window.context.messaging.onPreGenKeys({
              address: '${keys.address}',
              signatureKey: '${keys.signatureKey}',
              pubMessage: '${keys.pubMessage}',
              pubSignature: '${keys.pubSignature}'
            });
          }
        })()
      `
      this.dappWebView.injectJavaScript(keyInjection)
    }
  }

  /* Send a response back to the DApp using postMessage in the webview
   */
  handleBridgeResponse(msgData, result) {
    msgData.isSuccessful = Boolean(result)
    msgData.args = [result]
    this.dappWebView.postMessage(JSON.stringify(msgData))
  }

  /* Handle a transaction hash event from the Origin Wallet
   */
  handleTransactionHash({ transaction, hash }) {
    // Close matching modal
    const modal = this.state.modals.find(
      m => m.msgData && m.msgData.data === transaction
    )
    // Toggle the matching modal and return the hash
    this.toggleModal(modal, hash)
  }

  /* Handle a signed message event from the Origin Wallet
   */
  handleSignedMessage({ data, signedMessage }) {
    // Close matching modal
    const modal = this.state.modals.find(
      m => m.msgData && m.msgData.data === data
    )
    // Toggle the matching modal and return the hash
    this.toggleModal(modal, signedMessage.signature)
  }

  /* Remove a modal and return the given result to the DApp
   */
  toggleModal(modal, result) {
    this.setState(prevState => {
      return {
        ...prevState,
        modals: [...prevState.modals.filter(m => m !== modal)]
      }
    })
    if (modal.msgData) {
      // Send the response to the webview
      this.handleBridgeResponse(modal.msgData, result)
    }
  }

  render() {
    const { modals } = this.state
    const { navigation } = this.props
    const marketplaceUrl = navigation.getParam(
      'marketplaceUrl',
      this.props.settings.network.dappUrl
    )

    // Use key of network id on safeareaview to force a remount of component on
    // network changes
    return (
      <FlingGestureHandler
        direction={Directions.RIGHT}
        onHandlerStateChange={this.onRightFling}
      >
        <FlingGestureHandler
          direction={Directions.LEFT}
          onHandlerStateChange={this.onLeftFling}
        >
          <SafeAreaView
            key={this.props.settings.network.id}
            style={styles.sav}
            forceInset={{ top: 'always' }}
          >
            <StatusBar backgroundColor="white" barStyle="dark-content" />
            <WebView
              ref={webview => {
                this.dappWebView = webview
              }}
              source={{ uri: marketplaceUrl }}
              onMessage={this.onWebViewMessage}
              onLoad={() => {
                this.injectMessagingKeys()
              }}
              onNavigationStateChange={this.onNavigationStateChange}
              startInLoadingState={true}
              renderLoading={() => {
                return (
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color="black" />
                  </View>
                )
              }}
            />
            {modals.map((modal, index) => {
              let card
              if (modal.type === 'enableNotifications') {
                card = (
                  <NotificationCard
                    onRequestClose={() => this.toggleModal(modal)}
                  />
                )
              } else if (modal.type === 'processTransaction') {
                card = (
                  <TransactionCard
                    msgData={modal.msgData}
                    onConfirm={() => {
                      DeviceEventEmitter.emit(
                        'sendTransaction',
                        modal.msgData.data
                      )
                    }}
                    onRequestClose={() =>
                      this.toggleModal(modal, {
                        message: 'User denied transaction signature'
                      })
                    }
                  />
                )
              } else if (modal.type === 'signMessage') {
                card = (
                  <SignatureCard
                    msgData={modal.msgData}
                    onConfirm={() => {
                      DeviceEventEmitter.emit('signMessage', modal.msgData.data)
                    }}
                    onRequestClose={() =>
                      this.toggleModal(modal, {
                        message: 'User denied transaction signature'
                      })
                    }
                  />
                )
              }

              return (
                <Modal
                  key={index}
                  animationType="fade"
                  transparent={true}
                  visible={true}
                  onRequestClose={() => {
                    this.toggalModal(modal)
                  }}
                >
                  <SafeAreaView style={styles.container}>
                    <View
                      style={styles.transparent}
                      onPress={() => {
                        this.toggleModal(modal)
                      }}
                    >
                      {card}
                    </View>
                  </SafeAreaView>
                </Modal>
              )
            })}
          </SafeAreaView>
        </FlingGestureHandler>
      </FlingGestureHandler>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B18234C',
    flex: 1
  },
  sav: {
    backgroundColor: 'white',
    flex: 1
  },
  transparent: {
    flex: 1
  },
  loading: {
    flex: 1,
    justifyContent: 'space-around'
  }
})

const mapStateToProps = ({ activation, wallet, settings }) => {
  return { activation, wallet, settings }
}

export default connect(mapStateToProps)(MarketplaceScreen)
