import React from 'react';
import { ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { ExpoLinksView } from '@expo/samples';
import { gql, ApolloClient, createNetworkInterface, ApolloProvider, graphql } from 'react-apollo';

import { List, ListItem, Button } from 'react-native-elements';



const UserListWithData = graphql(gql`
  query{
      users(byPoints: true){
        id
        points
      }
    }`, { options: { notifyOnNetworkStatusChange: true } })(UserList)




function UserList({ data }) {
    if (data.networkStatus === 1) {
        return  <ActivityIndicator color="green"
                                   size="large"
        />;
    }

    if (data.error) {
        return <Text>Error! {data.error.message}</Text>;
    }


    return (
        <List >
            { data.users.map((user, i) => {

                    const badge = { value: user.points,
                        textStyle: { color: 'orange' },
                        containerStyle: { marginTop: -2 } }

                    return <ListItem
                        key={"user-key" + i}
                        hideChevron
                        title={`User : ${user.id}`}

                        badge={badge}
                    />;
                }
            ) }
        </List>
    )
}

class LeaderBoardScreen extends React.Component {
    static navigationOptions = {
        title: 'Leader Board',
    };

    render() {
        return (

            <ScrollView style={styles.container}>
              <UserListWithData />
            </ScrollView>
        );
    }
}
export default LeaderBoardScreen;

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
