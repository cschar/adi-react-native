import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    View,
    Dimensions,
    RefreshControl
} from 'react-native';

import { List, ListItem, Button } from 'react-native-elements';

import { gql, ApolloClient, createNetworkInterface, ApolloProvider, graphql } from 'react-apollo';
import { WebBrowser } from 'expo';
import { MapView } from 'expo';
import { Constants, Location, Permissions } from 'expo';



function AdiLmarkersFeed({data}){
    return (
        <ScrollView style={styles.container} refreshControl={
            // This enables the pull-to-refresh functionality
            <RefreshControl
                refreshing={data.networkStatus === 4}
                onRefresh={data.refetch}
            />
        }>



            <Text>Nearby markers</Text>
            <AdiFeedList data={data} />
        </ScrollView>
    );
}



function AdiFeedList({ data }) {
    if (data.networkStatus === 1) {
        return <ActivityIndicator style={styles.loading} />;
    }

    if (data.error) {
        return <Text>Error! {data.error.message}</Text>;
    }

    // console.log(data)
    // console.log(process.env.ADI_GRAPHQL_SERVER)
    // console.log(config)

    return (
        <List >
            { data.lmarkers.map((lmarker, index) => {


                    const badge = { value: 'rock',
                        textStyle: { color: 'orange' },
                        containerStyle: { marginTop: -2 } }


                    return <ListItem
                        key={"lmarker-key" + index.toString()}
                        hideChevron
                        title={`${lmarker.id} -- lat/lng: ${lmarker.lat.toFixed(3)}, ${lmarker.lng.toFixed(3)}`}
                        // subtitle={`ltype ${lmarker.ltype}, user: ${lmarker.user_id}`}
                        subtitle="subtitle"
                        badge={badge}
                    />;
                }
            ) }
        </List>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Constants.statusBarHeight,
        backgroundColor: '#ecf0f1',
    },
    loading: {
        margin: 50
    },
})

export default AdiLmarkersFeed;