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

import flagPinkImg from '../assets/icons/notification-icon.png';
import { MonoText } from '../components/StyledText';

import MyLocationMapMarker from './MyLocationMapMarker'



//NO zoom in react-native-maps, lngitude-delta instead
let { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
// const LATITUDE_DELTA = 60 //Very high zoom level
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
// const LONGITUDE_DELTA = 0.03;
let id = 0;

const AdiLmarkersWithData = graphql(gql`
  query{   testField
      lmarkers {
        id
        lat
        lng
      }
    }`, { options: { notifyOnNetworkStatusChange: true } })(AdiFeed)


function AdiFeed({data}){
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


class SimpleMap extends React.Component {



    constructor(){
        super()
        this.state = {
            location: null,
            errorMessage: null,
            position: {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            markers: [],
        }


    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let location = await Location.getCurrentPositionAsync({});
        this.setState({ location });
        this.setState({position: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.04}
        })
    };

    componentWillMount() {
        this._getLocationAsync();
    }





    onRegionChange = (region) => {
        this.setState({position: region});
    }

    onMapPress = (e) => {
        this.setState({
            markers: [
                ...this.state.markers,
                {
                    coordinate: e.nativeEvent.coordinate,
                    key: `foo${id++}`,
                },
            ],
        });
    }


    render() {

        let initRegion = false;
        let currentLocation = 'Waiting..';
        if (this.state.errorMessage) {
            currentLocation = this.state.errorMessage;
        } else if (this.state.location) {
            initRegion = true;
            currentLocation = JSON.stringify(this.state.location);
        }

        let map = (<Text> Loading.... </Text>)
        if (initRegion){
            let IR ={'latitude': this.state.location.coords.latitude,
                'longitude': this.state.location.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,

            }

            map = (
                <MapView
                    style={{ flex : 1}}
                    initialRegion={IR}
                    onRegionChange={this.onRegionChange}
                    onPress={this.onMapPress}
                >

                    {this.state.markers.map(marker => (
                        <MapView.Marker
                            title={marker.key}
                            image={flagPinkImg}
                            key={marker.key}
                            coordinate={marker.coordinate}
                        />
                    ))}
                    {this.state.markers.map((marker,index) => (
                        <MapView.Circle radius={200}
                                        key={'lmarker-key'+index.toString()}
                                        fillColor="rgba(0, 0, 0, 0.2)"
                                        strokeColor="rgba(0, 0, 0, 0.7)"
                                        center={marker.coordinate}
                        />
                    ))}
                    <MyLocationMapMarker />

                    <MapView.Circle radius={500}
                                    fillColor="rgba(0, 0, 0, 0.2)"
                                    strokeColor="rgba(0, 0, 0, 0.7)"
                                    center={this.state.location.coords}
                        // center.longitude={latlng.longtiude}
                    />

                </MapView>
            )
        }

        console.log("rendering simple map");


        return (
            <View style={styles.container}>
                {map}
            </View>
        );
    }
}


export default class MapScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(){
        super()
        this.state = {
            location: null,
            errorMessage: null,
        }
    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }

        let location = await Location.getCurrentPositionAsync({});
        this.setState({ location });
        this.setState({position: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.04}
        })
    };

    componentWillMount() {
        this._getLocationAsync();
    }


    render() {


        let currentLocation = 'Waiting..';
        if (this.state.errorMessage) {
            currentLocation = this.state.errorMessage;
        } else if (this.state.location) {
            initRegion = true;
            currentLocation = JSON.stringify(this.state.location);
        }

        console.log("rendering");


        return (
            <View style={styles.container}>
                <SimpleMap/>
                
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}>

                    <Text>
                    currentLocation: {currentLocation}
                    </Text>

                    <View style={styles.helpContainer}>
                        <TouchableOpacity
                            onPress={this.action1Press}
                            style={styles.action1Link}>
                            <Text style={styles.helpLinkText}>
                                Action 1=====
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>



            </View>
        );
    }

    action1Press = () => {
        console.log('action 1')
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    developmentModeText: {
        marginBottom: 20,
        color: 'rgba(0,0,0,0.4)',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center',
    },
    contentContainer: {
        paddingTop: 30,
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    welcomeImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10,
    },
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50,
    },
    homeScreenFilename: {
        marginVertical: 7,
    },
    codeHighlightText: {
        color: 'rgba(96,100,109, 0.8)',
    },
    codeHighlightContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        paddingHorizontal: 4,
    },
    getStartedText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center',
    },
    tabBarInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 20,
            },
        }),
        alignItems: 'center',
        backgroundColor: '#fbfbfb',
        paddingVertical: 20,
    },
    tabBarInfoText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center',
    },
    navigationFilename: {
        marginTop: 5,
    },
    helpContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    action1Link: {
        paddingVertical: 15,
        backgroundColor: '#f1f1a1'
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
});
