import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { gql, ApolloClient, createNetworkInterface, ApolloProvider, graphql } from 'react-apollo';

import AdiLmarkersFeed from '../components/AdiLmarkersFeed'


const AdiLmarkersWithData = graphql(gql`
  query{
      lmarkers {
        id
        lat
        lng
        ltype
        user_id
      }
    }`, { options: { notifyOnNetworkStatusChange: true } })(AdiLmarkersFeed)


export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: 'Links',
  };

  render() {
    return (

      <ScrollView style={styles.container}>
        <AdiLmarkersWithData/>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
    container2: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#cfc',
    },
});
