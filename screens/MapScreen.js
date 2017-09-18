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
import { Col, Row, Grid } from "react-native-easy-grid";

import { gql, graphql , compose} from 'react-apollo';
import { WebBrowser } from 'expo';
import { MapView } from 'expo';
import { Constants, Location, Permissions } from 'expo';

import flagPinkImg from '../assets/icons/notification-icon.png';
import rockImg from '../assets/images/rock3.png';
import paperImg from '../assets/images/paper3.png';
import scissorsImg from '../assets/images/scissors3.png';

import { MonoText } from '../components/StyledText';

import MyLocationMapMarker from './MyLocationMapMarker'

import MyMarker from '../components/MyMarker'


//NO zoom in react-native-maps, lngitude-delta instead
let { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
// const LATITUDE_DELTA = 60 //Very high zoom level
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
// const LONGITUDE_DELTA = 0.03;
let id = 0;

function SimpleButton({text, buttonStyle, onPress}) {

    return (
        <TouchableOpacity
            onPress={onPress}
            style={buttonStyle}>
            <Text>
                {text}
            </Text>
        </TouchableOpacity>
    )
}


function SimpleMapMarkers({data, userId, localMarkers, defaultPos}){
    // if (data.networkStatus === 1) {
    //     return (<View></View>)
    //     // return <ActivityIndicator style={styles.loading} />;
    // }

    console.log("render simpleMapMarker");

    if (data == null || data.loading || data.error) {
        return (
            <MapView.Circle radius={600}
                            key={'DEFAULTATUL'}
                            fillColor="rgba(133, 23, 200, 0.2)"
                            strokeColor="rgba(0, 130, 200, 0.7)"
                            center={defaultPos}
            />
            )
    }

    let newMarker = {
        id: '-1',
        user_id: userId,
        lat: -12,
        lng: 12,
        ltype: 'rock'
    }

    let allMarkers = data.lmarkers.concat(localMarkers);

    return (
        <View>
        {allMarkers.map( function(marker, index) {
            let markerImg = null
            if(marker.ltype == 'rock'){
                markerImg = rockImg
            }
            if(marker.ltype == 'paper'){
                markerImg = paperImg
            }
            if(marker.ltype == 'scissors'){
                markerImg = scissorsImg
            }

            let latlng = {latitude: marker.lat,
                longitude: marker.lng};

            let innerText = `${marker.id} -- lat/lng:
             ${marker.lat.toFixed(3)}, ${marker.lng.toFixed(3)}
             ltype: ${marker.ltype}
             user: ${marker.user_id}`;

            if (marker.user_id == userId){
                return (
                    <View key={'myMarker-key'+index}>
                        <MapView.Marker
                            image={markerImg}
                            key={marker.id + index.toString()}
                            coordinate={latlng}
                        >

                            <MapView.Callout >

                                <View style={{ backgroundColor: '#d1d1d1'}}>
                                    {/*<Row style={{height: 50}}>*/}
                                    <Text> {innerText} </Text>
                                    <Text>Ltype {marker.ltype} </Text>
                                    {/*</Row>*/}

                                    {/*<Row style={{height: 50}}>*/}
                                    <View style={{flexDirection:'row', alignItems:'stretch'}}>
                                        <SimpleButton text="rock" buttonStyle={{marginTop:5, marginRight: 10, paddingRight:10, paddingBottom:30, backgroundColor: '#bbb'}}
                                                      onPress={()=>(this.setState({ltype: 'rock'}))}/>
                                        <SimpleButton text="paper" buttonStyle={{marginTop:5, paddingBottom:30, backgroundColor: '#bbb'}}
                                                      onPress={()=>(this.setState({ltype: 'paper'}))}/>
                                        <SimpleButton text="sci" buttonStyle={{marginTop:5, paddingBottom:30, backgroundColor: '#bbb'}}
                                                      onPress={()=>(this.setState({ltype: 'scissors'}))}/>
                                        {/*</Row>*/}
                                    </View>

                                    {/*<Row style={{height: 50}}>*/}
                                    <View style={{flexDirection:'row', alignItems:'stretch'}}>
                                        <SimpleButton text="place " buttonStyle={{paddingLeft: 30, paddingBottom:30, backgroundColor: '#beb'}}
                                                      onPress={()=>(this.setState({ltype: 'scissors'}))}/>
                                        <SimpleButton text="delete" buttonStyle={{marginLeft:20, padding: 15, marginTop:5, backgroundColor: '#bbb'}}
                                                      onPress={()=>(this.setState({ltype: 'scissors'}))}/>
                                    </View>

                                    {/*<SimpleButton text="delete" buttonStyle={{backgroundColor: '#dac'}}*/}
                                    {/*onPress={this.deleteButton}/>*/}
                                    {/*</Row>*/}
                                </View>
                            </MapView.Callout>



                        </MapView.Marker>

                        <MapView.Circle radius={400}
                                        fillColor="rgba(133, 133, 200, 0.2)"
                                        strokeColor="rgba(0, 0, 0, 0.7)"
                                        center={latlng}
                        />
                    </View>
                )
            }
            return (
                    <View key={"lmarkers-key"+index}>
                        <MapView.Marker
                            image={markerImg}
                            key={marker.id + index.toString()}
                            coordinate={latlng}
                        >

                            <MapView.Callout>

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
                                        fillColor="rgba(255, 155, 73, 0.3)"
                                        strokeColor="rgba(255, 155, 73, 0.7)"
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

        console.log('pressed map')
        if(this.state.placeMarkerEnabled) {
            // console.log('dispatching')
            // console.log(this.props.localMarkers)
            this.props.dispatchAddMarker(e.nativeEvent.coordinate)

        }
        this.setState({placeMarkerEnabled: false})
    }



    render() {

        if(!this.props.token){
            return (
                <Text style={{marginTop:100}}> Login First </Text>
            )
        }

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

                    {/*{this.renderLocalMarkers()}*/}


                    <SimpleMapMarkers userId={this.props.userInfo.id}
                                      data={this.props.data}
                                      localMarkers={this.props.localMarkers}
                                      defaultPos={IR}/>

                    <MyLocationMapMarker />


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
                <View style={{ height: '85%', borderWidth: 1 }}>
                {map}
                </View>
                <ScrollView
                    style={{backgroundColor: '#d2caac', borderWidth: 1 }}
                    contentContainerStyle={styles.contentContainer}>

                    <View style={{backgroundColor: '#fff8f9',
                                  alignItems: 'flex-start', flexDirection: 'row'}}>
                        {action1Button}

                        <TouchableOpacity
                            onPress={this.action2Press}
                            style={styles.action2Link}>
                            <Text style={styles.helpLinkText}>
                                refresh
                            </Text>
                        </TouchableOpacity>


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
        console.log('refetching lmarker data')
        this.props.data.refetch()
        // this._getLocationAsync()
    }
}




// const placeLmarker = gql`
// mutation($lat: Float!, $lng: Float!, $ltype: String!){
//  placeLmarker(input: {lat: $lat, lng: $lng, ltype: $ltype}){
//     id
//     user_id
//     ltype
//     lat
//     lng
//   }
// }
// `;
//
//
// const queryLmarkers = gql`
//   query{
//       lmarkers {
//         id
//         lat
//         lng
//         ltype
//         user_id
//       }
//     }`;
//
// const SimpleMapWithData = compose(
//     graphql(placeLmarker, { name: 'placeLmarkerMutation' }),
//     graphql(placeLmarker, { name: 'data' }),
// )(MyMarker);

const SimpleMapWithData = graphql(gql`
  query{
      lmarkers {
        id
        lat
        lng
        ltype
        user_id
      }
    }`, { options: { notifyOnNetworkStatusChange: true } })(SimpleMap)

//Can Poll too, not just props.data.refetch()
// const FeedWithData = graphql(FeedEntries, {
//     options: { pollInterval: 20000 },
// })(Feed);

//TODO: Just make login screen before tab navigation
import { connect } from 'react-redux';
const mapStateToProps = function(store) {
    return {
        token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo3fQ.ABvxQMZYhgMBZ9nvxMXNoC3Z5DREeqIpwwyQ9HBYvbk",
        // token: store.redOne.token,
        //userInfo: store.redOne.userInfo
        userInfo: {id: 7, email: 'test@z.ca', points: 12},
        localMarkers: store.redOne.localMarkers
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        dispatchAddMarker : (coordinate) => (
            dispatch({
                type:'ADD_MARKER',
                coordinate: coordinate
            })
        )
    }
};

const SimpleMapContainer =  connect(mapStateToProps,mapDispatchToProps)(SimpleMapWithData)


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
                <SimpleMapContainer

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


    action1LinkEnabled: {
        paddingVertical: 15,
        backgroundColor: '#f1af00',
        borderRadius: 3
    },
    action1Link: {
        paddingVertical: 15,
        backgroundColor: '#f1f1a1'
    },
    action2Link: {
        paddingVertical: 15,
        paddingLeft: 15,
        backgroundColor: '#62cd91'
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
});
