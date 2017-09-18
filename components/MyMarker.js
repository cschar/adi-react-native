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

import { MapView } from 'expo';

import rockImg from '../assets/images/rock3.png';
import paperImg from '../assets/images/paper3.png';
import scissorsImg from '../assets/images/scissors2.png';

import store from '../Stores.js'


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

class MyMarker extends React.Component {
    //latlng
    //markerId

    constructor(props){
        super()
        this.state = {
            ltype: props.ltype

        }
    }

    placeLMarkerButton = () => {
        this.props.placeLmarkerMutation({
            variables: {
                lat: this.props.latlng.latitude,
                lng: this.props.latlng.longitude,
                ltype: this.state.ltype
            }
        })
            .then(({data}) => {
                console.log('got data', data);

            }).catch((error) => {
            console.log('there was an error sending the query', error);
        });
    }

    deleteButton = () => {
        store.dispatch({
            type:'DELETE_MARKER',
            markerId: this.props.markerId
        })
    }

    render(){

        //cant set dynamic image paths?
        //https://github.com/facebook/react-native/issues/2481
        //this is slow i think because it has to load image each time...
        let markerImg = null
        if(this.state.ltype == 'rock'){
            markerImg = rockImg
        }
        if(this.state.ltype == 'paper'){
            markerImg = paperImg
        }
        if(this.state.ltype == 'scissors'){
            markerImg = scissorsImg
        }

        console.log("My Marker rendering with markerId: " + this.props.markerId)
        return (
            <View>
                <MapView.Marker
                    title={this.props.markerId.toString()}
                    image={markerImg}
                    key={this.props.markerId }
                    coordinate={this.props.latlng}
                    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation" // eslint-disable-line max-len
                >

                    <MapView.Callout
                        // style={{ height: height/4, width: width/2 }}
                    >

                        <View style={{ backgroundColor: '#d1d1d1'}}>
                            {/*<Row style={{height: 50}}>*/}
                            <Text>Current Lmarker at {this.props.latlng.latitude.toFixed(3)}, {this.props.latlng.longitude.toFixed(3)} </Text>
                            <Text>Ltype {this.state.ltype} </Text>
                            {/*</Row>*/}

                            {/*<Row style={{height: 50}}>*/}
                            <View style={{flexDirection:'row'}}>
                            <SimpleButton text="rock" buttonStyle={{marginTop:5, paddingBottom:30, backgroundColor: '#bbb'}}
                                          onPress={()=>(this.setState({ltype: 'rock'}))}/>
                            <SimpleButton text="paper" buttonStyle={{marginTop:5, paddingBottom:30, backgroundColor: '#bbb'}}
                                          onPress={()=>(this.setState({ltype: 'paper'}))}/>
                            <SimpleButton text="sci" buttonStyle={{marginTop:5, paddingBottom:30, backgroundColor: '#bbb'}}
                                          onPress={()=>(this.setState({ltype: 'scissors'}))}/>
                            {/*</Row>*/}
                            </View>

                            {/*<Row style={{height: 50}}>*/}
                            <Button backgroundColor={'#bbb'}
                                    fontSize={18}
                                    icon={{name: 'settings-input-component', size:20}}
                                    title={'place lmarker'}
                                    onPress={this.placeLMarkerButton}/>
                            <Button backgroundColor={'#f99'}
                                    fontSize={10}
                                    icon={{name: 'settings-input-component', size:10}}
                                    title={'remove'}
                                    onPress={this.deleteButton}/>

                            {/*<SimpleButton text="delete" buttonStyle={{backgroundColor: '#dac'}}*/}
                                          {/*onPress={this.deleteButton}/>*/}
                            {/*</Row>*/}
                        </View>
                    </MapView.Callout>



                </MapView.Marker>

                <MapView.Circle radius={400}
                                fillColor="rgba(133, 133, 200, 0.2)"
                                strokeColor="rgba(0, 0, 0, 0.7)"
                                center={this.props.latlng}
                />
            </View>
        )
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
const MyMarkerWithMutations = compose(
    graphql(placeLmarker, { name: 'placeLmarkerMutation' }),
)(MyMarker);




export default MyMarkerWithMutations