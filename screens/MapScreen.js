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

    // let allMarkers = data.lmarkers.concat(localMarkers);

    console.log(`Rendering SimpleMapMarkers: ${data.lmarkers.length} markers`);
    return (
        <View>
        {data.lmarkers.map( function(marker, index) {

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
            // console.log('rendering marker', marker.id, markerImg.toString())

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
                    <View key={"lmarkers-key"+marker.id}>
                        <MapView.Marker
                            image={markerImg}
                            key={'map' + marker.id}
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
            gqlData: {lmarkers: []},
            dumps: '',
            placeMarkerEnabled: false,
            placeMyMarkerEnabled: false,
            ltypeToPlace: 'rock',

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

    componentWillReceiveProps (newProps){
        if(newProps.data && newProps.data.lmarkers){
            console.log('received new props w length ' + newProps.data.lmarkers.length)
        }

        this.setState({gqlData: newProps.data})

    }

    componentWillMount() {
        this._getLocationAsync();
    }

    onRegionChange = (region) => {
        this.setState({position: region});
    }

    onMapPress = (e) => {

        if(this.state.placeMyMarkerEnabled) {
            this.props.dispatchAddMarker(e.nativeEvent.coordinate);
        }

        console.log('pressed map')
        if(this.state.placeMarkerEnabled) {

            let latlang = e.nativeEvent.coordinate
            // let ltype = 'rock'
            console.log('placeLmarker mutation w ltype', this.state.ltypeToPlace)

            this.props.placeLmarkerMutation(
                {variables: { lat: latlang.latitude,
                    lng: latlang.longitude, ltype: this.state.ltypeToPlace}
                })
                .then(({ data }) => {
                    console.log('got data', data);
                    // this.setState({loading: false})

                    if(data.createUser && data.createUser.token) {

                        // this.props.dispatchSetUserInfo({userInfo:data.createUser.user, token: data.createUser.token});
                    }

                }).catch((error) => {
                // this.setState({loading: false,
                //     signupErrorMessage: 'Error invalid email/password'})
                console.log('there was an error sending the query', error);


            });

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

        let data = 'no data'
        let simpleMarkers = null
        if(this.props.data && this.props.data.lmarkers){
            data = this.props.data.lmarkers.length

            console.log("========= simple markers " + this.state.gqlData.lmarkers.length)
            simpleMarkers = this.state.gqlData.lmarkers.map( function(marker, index) {

                let latlng = {
                    latitude: marker.lat,
                    longitude: marker.lng
                };

                return (
                    <View key={'myMarker-key' + index}>
                        <MapView.Marker
                                title="fooper"
                                description="blabl"
                            image={rockImg}
                            key={marker.id + index.toString()}
                            coordinate={latlng}
                        />
                    </View>
                )
            })
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


                    {simpleMarkers}

                    {this.props.localMarkers.map( function(marker, i) {

                    let latlng = {
                    latitude: marker.lat,
                    longitude: marker.lng
                };

                    return (
                        <MyMarker key={'mymaerker-'+i}
                                  latlng={latlng}
                                  title="foop"
                                  markerId={marker.id}
                                  marker={marker} />
                    )
                })
                    }

                    {/*<SimpleMapMarkers userId={this.props.userInfo.id}*/}
                                      {/*data={this.props.data}*/}
                                      {/*localMarkers={this.props.localMarkers}*/}
                                      {/*defaultPos={IR}/>*/}

                    <MyLocationMapMarker />


                </MapView>

            )
        }

        console.log("Rendering SimpleMap: ")
        if (this.props.data){
            if (this.props.data.lmarkers){
                console.log(this.props.data.lmarkers.length, "lmarkers in this.props.data")
            }
        }

        let action1Button = (<TouchableOpacity
                onPress={this.action1Press}
                style={styles.action1Link}>
                <Text style={styles.helpLinkText}>
                    Place marker
                </Text>
            </TouchableOpacity>)

        let placeRPSButtons = (<View style={{backgroundColor: '#fff8f9',
            alignItems: 'flex-start', flexDirection: 'row'}}>

            <TouchableOpacity
                onPress={() => this.actionPlacePress('rock')}
                style={styles.action2Link}>
                <Text style={styles.helpLinkText}>
                    rock
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => this.actionPlacePress('paper')}
                style={styles.action2Link}>
                <Text style={styles.helpLinkText}>
                    paper
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => this.actionPlacePress('scissors')}
                style={styles.action2Link}>
                <Text style={styles.helpLinkText}>
                    scis
                </Text>
            </TouchableOpacity>

        </View>)


        if(this.state.placeMyMarkerEnabled) {
            action1Button = (<TouchableOpacity
                onPress={this.action1Press}
                style={styles.action1LinkEnabled}>
                <Text>Enabled! Place your marker on map
                </Text>
            </TouchableOpacity>)
        }

         if(this.state.placeMarkerEnabled){
            placeRPSButtons = (<TouchableOpacity
                onPress={this.action1Press}
                style={styles.action1LinkEnabled}>
                <Text>Enabled! Place your marker on map
                </Text>
            </TouchableOpacity>)
        }


        return (
            <View style={styles.container}>
                <View style={{ height: '55%', borderWidth: 1 }}>
                {map}
                </View>
                <ScrollView
                    style={{backgroundColor: '#d2caac', borderWidth: 1 }}
                    contentContainerStyle={styles.contentContainer}>

                    <Text> {'lmarker length: ' + this.state.gqlData.lmarkers.length} </Text>
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

                        <TouchableOpacity
                            onPress={this.action3Press}
                            style={styles.action2Link}>
                            <Text style={styles.helpLinkText}>
                                force update
                            </Text>
                        </TouchableOpacity>



                    </View>

                    {placeRPSButtons}

                    {/*<Submenu />*/}

                </ScrollView>
                {/*{this.props.data.lmarkers.length}*/}
            </View>
        );
    }

    action1Press = () => {
        console.log('action 1')
        this.setState({placeMyMarkerEnabled: !this.state.placeMyMarkerEnabled})
    }

    action2Press = () => {
        console.log('refetching lmarker data')

        let aa = this.props.data.refetch()
        console.log(aa)
        console.log('and length')
        console.log(this.props.data.lmarkers.length)
        // this._getLocationAsync()
    }

    action3Press = () => {
        console.log('forceUpdate');
        // this.forceUpdate();
        this.props.renderHandler()

    }

    actionPlacePress = (ltype = 'rock') => {
        this.setState({placeMarkerEnabled: !this.state.placeMarkerEnabled,
        ltypeToPlace: ltype})

    }

}




const placeLmarker = gql`
mutation($lat: Float!, $lng: Float!, $ltype: String!){
 placeLmarker(input: {lat: $lat, lng: $lng, ltype: $ltype}){
    id
    user_id
    ltype
    lat
    lng
  }
}
`;


const queryLmarkers = gql`
  query{
      lmarkers {
        id
        lat
        lng
        ltype
        user_id
      }
    }`;

const SimpleMapWithData = compose(
    graphql(placeLmarker, { name: 'placeLmarkerMutation' }),
    //name will be data by default this.props.data
    graphql(queryLmarkers)
    // graphql(queryLmarkers,{options: { pollInterval: 5000 }})
)(SimpleMap);

// const SimpleMapWifthData = graphql(gql`
//   query{
//       lmarkers {
//         id
//         lat
//         lng
//         ltype
//         user_id
//       }
//     }`, { options: { notifyOnNetworkStatusChange: true } })(SimpleMap)

//Can Poll too, not just props.data.refetch()
// const FeedWithData = graphql(FeedEntries, {
//     options: { pollInterval: 3000 },
// })(Feed);

//TODO: Just make login screen before tab navigation
import { connect } from 'react-redux';
const mapStateToProps = function(store) {
    return {
        token: store.redOne.token,
        userInfo: store.redOne.userInfo,
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
        this.state = {
            foo: 'boo'
        }
    }
    renderHandler = () =>{
        this.setState({
            foo: 'varb' + this.state.foo
        })
        this.refs.mapContainer.forceUpdate();
    }

    render() {
        return (
            <View style={styles.container}>

                <SimpleMapContainer ref='mapContainer' renderHandler={this.renderHandler}

                />
                <Text> {this.state.foo} </Text>
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
        marginLeft:10,
        backgroundColor: '#62cd91'
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7',
    },
});

function Submenu(){
    return (
        <View style={{flexDirection:'row',
            alignItems: 'stretch',
            flexBasis: 'auto'}}>
            <View style={{flexGrow: 1, backgroundColor: '#fff'}}>

                <Text style={{flexGrow: 1}}> col 1</Text>
                {/*<Text>{this.state.dumps}</Text>*/}

            </View>
            <View style={{flexGrow: 1, backgroundColor: '#aaa'}}>
                <Text style={{height:40}}> col 2</Text>
                <Text style={{height:40}}> col 2</Text>

            </View>

        </View>
    )
}