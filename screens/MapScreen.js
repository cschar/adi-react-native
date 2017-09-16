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

import { gql, graphql } from 'react-apollo';
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


const SimpleMapWithData = graphql(gql`
  query{
      lmarkers {
        id
        lat
        lng
      }
    }`, { options: { notifyOnNetworkStatusChange: true } })(SimpleMapMarkers)


function SimpleMapMarkers({data, defaultPos}){
    // if (data.networkStatus === 1) {
    //     return (<View></View>)
    //     // return <ActivityIndicator style={styles.loading} />;
    // }

    console.log("render simpleMap Marker");
    // console.log(data);

    if (data == null || data.loading || data.error) {
        return (
            <MapView.Circle radius={600}
                            key={'DEFAULTATUL'}
                            fillColor="rgba(133, 23, 200, 0.2)"
                            strokeColor="rgba(0, 130, 200, 0.7)"
                            center={defaultPos}
            />
            )
        // return <Text>Error! {data.error.message}</Text>;
    }


    return (
        <View>
        {data.lmarkers.map( function(marker, index) {

            let latlng = {latitude: marker.lat,
                longitude: marker.lng};

            let innerText = `${marker.id} -- lat/lng:
             ${marker.lat.toFixed(3)}, ${marker.lng.toFixed(3)}`;

            return (
                    <View key={"lmarkers-key"+index}>
                        <MapView.Marker
                            title={marker.id}
                            image={flagPinkImg}
                            key={marker.id + index.toString()}
                            coordinate={latlng}
                            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation" // eslint-disable-line max-len
                        >
                            <MapView.Callout style={styles.plainView}>

                                <View style={{ backgroundColor: '#d1d1d1'}}>
                                    <View>
                                        <Text>This is a plain view</Text>
                                    </View>
                                    <Text style={{ color: 'blue'}}>
                                        {innerText}
                                    </Text>
                                </View>
                            </MapView.Callout>



                        </MapView.Marker>

                        <MapView.Circle radius={400}
                                        key={'lmarker-key' + index.toString()}
                                        fillColor="rgba(133, 133, 200, 0.2)"
                                        strokeColor="rgba(0, 0, 0, 0.7)"
                                        center={latlng}
                        />
                    </View>
                )
            }
        )}
        </View>
    )
}




class SimpleMap extends React.Component {



    constructor(){
        super()
        this.state = {
            dumps: '',
            placeMarkerEnabled: false,
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

        if(this.state.placeMarkerEnabled) {
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
        this.setState({placeMarkerEnabled: false})
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

            {/*<MapView*/}
                {/*provider={this.props.provider}*/}
                {/*style={styles.map}*/}
                {/*initialRegion={this.state.region}*/}
                {/*onRegionChange={this.recordEvent('Map::onRegionChange')}*/}
                {/*onRegionChangeComplete={this.recordEvent('Map::onRegionChangeComplete')}*/}
                {/*onPress={this.recordEvent('Map::onPress')}*/}
                {/*onPanDrag={this.recordEvent('Map::onPanDrag')}*/}
                {/*onLongPress={this.recordEvent('Map::onLongPress')}*/}
                {/*onMarkerPress={this.recordEvent('Map::onMarkerPress')}*/}
                {/*onMarkerSelect={this.recordEvent('Map::onMarkerSelect')}*/}
                {/*onMarkerDeselect={this.recordEvent('Map::onMarkerDeselect')}*/}
                {/*onCalloutPress={this.recordEvent('Map::onCalloutPress')}*/}
            {/*>*/}
            map = (
                <MapView
                    style={{ flex : 1}}
                    initialRegion={IR}
                    onRegionChange={this.onRegionChange}
                    onPress={this.onMapPress}
                >

                    {this.state.markers.map( (marker, index) =>
                        (
                            <View key={'onmapPress-'+index}>
                                <MapView.Marker
                                    title={marker.key}
                                    image={flagPinkImg}
                                    key={marker.key + index.toString()}
                                    coordinate={marker.coordinate}
                                />

                                <MapView.Circle radius={400}
                                                key={'onpressmarker-key'+index.toString()}
                                                fillColor="rgba(0, 0, 0, 0.2)"
                                                strokeColor="rgba(0, 0, 0, 0.7)"
                                                center={marker.coordinate}
                                />
                            </View>
                        )
                    )}


                    <SimpleMapWithData defaultPos={IR}/>

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

        if(this.props.data){
            // console.log(this.props.data)
        }

        let action1Button = (<TouchableOpacity
                onPress={this.action1Press}
                style={styles.action1Link}>
                <Text style={styles.helpLinkText}>
                    Place marker
                </Text>
            </TouchableOpacity>)


        if(this.state.placeMarkerEnabled){
            action1Button = (<TouchableOpacity
                onPress={this.action1Press}
                style={styles.action1LinkEnabled}>
                <Text>Enabled! Place your marker on map
                </Text>
            </TouchableOpacity>)
        }
        return (
            <View style={styles.container}>
                <View style={{ height: '70%', borderWidth: 1 }}>
                {map}
                </View>
                <ScrollView
                    style={{backgroundColor: '#d2caac', borderWidth: 1 }}
                    contentContainerStyle={styles.contentContainer}>

                    <View style={{backgroundColor: '#a3a3d3',
                                  alignItems: 'flex-start'}}>
                        {action1Button}

                        {/*<TouchableOpacity*/}
                            {/*onPress={this.action2Press}*/}
                            {/*style={styles.action1Link}>*/}
                            {/*<Text style={styles.helpLinkText}>*/}
                                {/*get location*/}
                            {/*</Text>*/}
                        {/*</TouchableOpacity>*/}


                    </View>

                    <View style={{flexDirection:'row',
                                  alignItems: 'stretch',
                                  flexBasis: 'auto'}}>
                        <View style={{flexGrow: 1, backgroundColor: '#fff'}}>

                            <Text style={{flexGrow: 1}}> col 1</Text>
                            <Text>{this.state.dumps}</Text>

                        </View>
                        <View style={{flexGrow: 1, backgroundColor: '#aaa'}}>
                            <Text style={{height:40}}> col 2</Text>
                            <Text style={{height:40}}> col 2</Text>

                        </View>

                    </View>
                </ScrollView>
                {/*{this.props.data.lmarkers.length}*/}
            </View>
        );
    }

    action1Press = () => {
        console.log('action 1')
        this.setState({placeMarkerEnabled: !this.state.placeMarkerEnabled})
    }
    action2Press = () => {
        console.log('action 2')
        this._getLocationAsync()
    }
}


export default class MapScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(){
        super()
    }


    render() {
        return (
            <View style={styles.container}>
                <SimpleMap

                />
            </View>
        );
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
        paddingTop: 10,
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

    action1LinkEnabled: {
        paddingVertical: 15,
        backgroundColor: '#f1af00',
        borderRadius: 3
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
