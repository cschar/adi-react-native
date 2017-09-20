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
import OtherMarker from '../components/OtherMarker'


//NO zoom in react-native-maps, lngitude-delta instead
let { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
// const LATITUDE_DELTA = 60 //Very high zoom level
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
// const LONGITUDE_DELTA = 0.03;
let id = 0;





class SimpleMap extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(){
        super()
        this.state = {
            gqlData: {lmarkers: []},
            dumps: '',
            placeMarkerEnabled: false,
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
        console.log("!!!!!!!!!!!!! new props received")
        console.log(newProps.data)

        this.setState({gqlData: newProps.data})
    }

    componentWillMount() {
        this._getLocationAsync();
    }

    onRegionChange = (region) => {
        this.setState({position: region});
    }


    onDeleteMarker = (id) => {
        console.log("received on delete w id", id)
        const trimmedMarkers = this.state.gqlData.lmarkers.filter(function(lmarker){
            return parseInt(lmarker.id) != parseInt(id)
        })

        console.log("trimmed marker length %d -> %d",this.state.gqlData.lmarkers.length, trimmedMarkers.length)

        this.state.gqlData.lmarkers = trimmedMarkers
        this.forceUpdate();

    }


    onMapPress = (e) => {

        // if(this.state.placeMyMarkerEnabled) {
        //     this.props.dispatchAddMarker(e.nativeEvent.coordinate);
        // }

        console.log('pressed map')
        if(this.state.placeMarkerEnabled) {

            let tmpMarker = {
                id: "-1",
                lat: e.nativeEvent.coordinate.latitude,
                lng: e.nativeEvent.coordinate.longitude,
                user_id: this.props.userInfo.id,
                ltype: 'rock'
            }

            this.state.gqlData.lmarkers.push(tmpMarker)
            this.forceUpdate();

            let latlang = e.nativeEvent.coordinate
            // let ltype = 'rock'
            console.log('placeLmarker mutation w ltype', this.state.ltypeToPlace)

            this.props.placeLmarkerMutation(
                {variables: { lat: latlang.latitude,
                    lng: latlang.longitude, ltype: this.state.ltypeToPlace}
                })
                .then(({ data }) => {
                    console.log('got data', data);

                    //could link up this mutation to a refetch afterwards
                    this.props.data.refetch()

                }).catch((error) => {

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

        let gqlDataText = (<Text> Loading Data </Text>)
        let simpleMarkers = null
        let simpleMarkerCircles=null
        if(this.props.data && this.props.data.lmarkers){
            let text0 = 'signed as user :' +  this.props.data.user.id
            let text1 = 'data.lmarker length:' +  this.props.data.lmarkers.length
            let text2 = 'data.user.points : ' + this.props.data.user.points
            gqlDataText = (<View>
                <Text> {text0} </Text>
                <Text> {text1} </Text>
                <Text> {text2} </Text>
            </View>)

            simpleMarkers = this.props.data.lmarkers.map( (marker, i) => {
                let latlng = {
                    latitude: marker.lat,
                    longitude: marker.lng
                };

                //!!!!!!!!! if this is wrapped in a view it wont rerender

                if(marker.user_id == this.props.userInfo.id){
                    return (
                        <MyMarker key={'mymaerker-'+marker.id}
                    latlng={latlng}

                    markerId={marker.id}
                    marker={marker}
                    onDelete={() => this.onDeleteMarker(marker.id)}
                        />

                    )
                }
                    return(
                    <OtherMarker
                        key={'othermarker-'+marker.id}
                        marker={marker}
                            >
                    </OtherMarker>
                    )
            })
            simpleMarkerCircles = this.props.data.lmarkers.map( (marker, i) => {

                let latlng = {
                    latitude: marker.lat,
                    longitude: marker.lng
                };

                if(marker.user_id == this.props.userInfo.id){
                    return(
                    <MapView.Circle key={"marker-circle"+marker.id}
                                    radius={200}
                                    fillColor="rgba(133, 133, 200, 0.2)"
                                    strokeColor="rgba(0, 0, 0, 0.7)"
                                    center={latlng}
                    />
                    )
                }
                //!!!!!!!!! if this is wrapped in a view it wont rerender
                return (
                <MapView.Circle radius={200}
            key={'i dont work' + marker.id}
            fillColor="rgba(233, 87, 87, 0.2)"
            strokeColor="rgba(200, 130, 100, 0.7)"
            center={latlng}
            />

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
                    {simpleMarkerCircles}

                    <MapView.Circle radius={200}
                                    key={'mylocation'}
                                    fillColor="rgba(87, 87, 233, 0.2)"
                                    strokeColor="rgba(87, 130, 233, 0.7)"
                                    center={this.state.position}
                    />
                    <MyLocationMapMarker />


                </MapView>

            )
        }


        if (this.props.data){
            if (this.props.data.lmarkers){
                let markerNums = this.props.data.lmarkers.length + " lmarkers in this.props.data"
                console.log("Rendering SimpleMap: ", markerNums)

            }
            if( this.props.data.user){
                console.log(this.props.data.user)
            }
        }


        let placeRPSButtons = (<View style={{backgroundColor: '#fff8f9',
            alignItems: 'flex-start', flexDirection: 'row'}}>

            <TouchableOpacity
                onPress={() => this.actionPlacePress('rock')}
                style={styles.action1Link}>
                <Text style={styles.helpLinkText}>
                    rock
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => this.actionPlacePress('paper')}
                style={styles.action1Link}>
                <Text style={styles.helpLinkText}>
                    paper
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => this.actionPlacePress('scissors')}
                style={styles.action1Link}>
                <Text style={styles.helpLinkText}>
                    scissors
                </Text>
            </TouchableOpacity>

        </View>)


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
                <View style={{ height: '65%', borderWidth: 1 }}>
                {map}
                </View>
                <ScrollView
                    style={{backgroundColor: '#d2caac', borderWidth: 1 }}
                    contentContainerStyle={styles.contentContainer}>

                    {gqlDataText}
                    <View style={{backgroundColor: '#fff8f9',
                                  alignItems: 'flex-start', flexDirection: 'row'}}>

                        <TouchableOpacity
                            onPress={this.action2Press}
                            style={styles.action2Link}>
                            <Text style={styles.helpLinkText}>
                                refresh
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


    action2Press = () => {
        console.log('refetching lmarker data')
        this.props.data.refetch()
        // this.props.data.refetch().then(function(data){
        //     console.log("[][][] Refetched data, setting state")
        //     this.setState({gqlData: data})
        // }.bind(this))
    }


    actionPlacePress = (ltype) => {
        this.setState({placeMarkerEnabled: !this.state.placeMarkerEnabled,
        ltypeToPlace: ltype})

    }

}





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


// export default SimpleMapContainer = connect(mapStateToProps,mapDispatchToProps)(SimpleMap)
const SimpleMapContainer = connect(mapStateToProps,mapDispatchToProps)(SimpleMap)


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


const queryLmarkers2 = gql`
  query($id: Int){
      lmarkers {
        id
        lat
        lng
        ltype
        user_id
      }
      user(id: $id){
        points
      }
    }`;

const queryLmarkers = gql`
  query{
      lmarkers {
        id
        lat
        lng
        ltype
        user_id
      }
      user(id: 7){
        id
        points
      }
    }`;


const SimpleMapWithData = compose(
    graphql(placeLmarker, { name: 'placeLmarkerMutation' }),
    //name will be data by default this.props.data
    graphql(queryLmarkers, {
        options: (props) => ({
            variables: {
                id : 7
                //TODO: replace this with the wrappers this.props.userID
                // id: props.userInfo ? parseInt(props.userInfo.id) : 7,
                // height: props.size,
            },
            //TODO: AWesome!
            // pollInterval : 10000
            })
    })
    // graphql(queryLmarkers,{options: { pollInterval: 5000 }})
)(SimpleMapContainer);

// export default SimpleMapWithData

class MapWrapper extends React.Component{

    render(){
        return (
            <SimpleMapWithData userID={this.props.userID} />
        )
    }
}



//TODO: Just make login screen before tab navigation
// import { connect } from 'react-redux';
const mapStateToProps2 = function(store) {
    return {
        token: store.redOne.token,
        userInfo: store.redOne.userInfo,
        localMarkers: store.redOne.localMarkers
    };
}



// export default SimpleMapContainer = connect(mapStateToProps,mapDispatchToProps)(SimpleMap)
export default MapWrapperContainer = connect(mapStateToProps2)(MapWrapper)



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
        paddingLeft: 15,
        marginRight:20,
        backgroundColor: '#f1f1a1'
    },
    action2Link: {
        paddingVertical: 15,
        paddingLeft: 15,
        paddingRight: 15,
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