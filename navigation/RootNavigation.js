import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

import { gql, ApolloClient, createNetworkInterface, ApolloProvider, graphql } from 'react-apollo';

import config from '../config.js'

import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';




const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: MainTabNavigator,
    },
  },
  {
    navigationOptions: () => ({
      headerTitleStyle: {
        fontWeight: 'normal',
      },
    }),
  }
);




@observer
export default class RootNavigator extends React.Component {
  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }


  @observable token = 'fooop';
  @observable query = 'fooop213';



  createClient() {
      // Initialize Apollo Client with URL to our server
      let networkInterface =  createNetworkInterface({
              uri: config.ADI_GRAPHQL_SERVER,
              opts: {
                  headers: {
                      'Authorization': `bearer ${this.token}`,
                  }
              }
          })


      let applyMiddleware = function(req, next) {
          if (!req.options.headers) {
              req.options.headers = {};  // Create the headers object if needed.
          }

          console.log("==middleware==")
          console.log('was sending graphql query', req.options.headers['authorization'])
          console.log('loading global storage')
          global.storage.load({
              key: 'userInfo',
          }).then(ret => {
              console.log(ret);
          }).catch(err => {
              console.warn(err.message);
          })
          // console.log("token set is", this.token)
          // if (this.token){
          //     req.options.headers['authorization'] = this.token;
          // }
          // console.log('now sending graphql query', req.options.headers['authorization'])
          // console.log("query in store is", this.query)
          console.log('nexting')
          next();
      }

      applyMiddleware.bind(this)

      let debugMiddleware = {
          applyMiddleware
          // applyMiddleware(req, next) {
          //     if (!req.options.headers) {
          //         req.options.headers = {};  // Create the headers object if needed.
          //     }
          //
          //     console.log('was sending graphql query', req.options.headers['authorization'])
          //     console.log("current token set is", this.token)
          //     // if (this.token){
          //     //     req.options.headers['authorization'] = this.token;
          //     // }
          //     // console.log('now sending graphql query', req.options.headers['authorization'])
          //     console.log("query in store is", this.query)
          //     next();
          // }
      }
      networkInterface.use([debugMiddleware]);

      return new ApolloClient({
          networkInterface: networkInterface
      });
  }

  render() {

    return (
        <ApolloProvider client={this.createClient()}>
        <RootStackNavigator />
        </ApolloProvider>
    );
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({ origin, data }) => {
    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`
    );
  };
}
