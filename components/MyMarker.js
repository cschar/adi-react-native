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
import scissorsImg from '../assets/images/scissors3.png';

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
            ltype: props.marker.ltype,
            lat: props.marker.lat,
            lng: props.marker.lng,
            id: props.marker.id,
            user_id: props.marker.user_id,
            deleting: false
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
                if(data.removeLmarker && data.removeLmarker == 'success'){

                }
            }).catch((error) => {
            console.log('there was an error sending the query', error);
        });
    }

    deleteButton = (id) => {
        if( id == -1){ console.log("not set"); return}
        console.log("deleting marker")
        this.setState({deleting: true})
        // this.marker1.hideCallout();
        this.props.removeLmarkerMutation({
            variables: {
                id: parseInt(id)
            }
        })
            .then(({data}) => {
                console.log('got data', data);
                this.setState({deleting: false})
                this.props.onDelete()

            }).catch((error) => {
            this.setState({deleting: false})
            console.log('there was an error sending the query', error);
        });
        // store.dispatch({
        //     type:'DELETE_MARKER',
        //     markerId: this.props.marker.id
        // })
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


        let calloutView = null
        if (this.state.deleting){
            calloutView = (<ActivityIndicator color="green"
                                              size="large"/>)
        }else{
            calloutView = (
                <View>
                    <View style={{flexDirection:'row', alignItems:'stretch'}}>
                        <SimpleButton text="rock" buttonStyle={{marginTop:5, marginRight: 10, paddingRight:10, paddingBottom:30, backgroundColor: '#bbb'}}
                                      onPress={()=>(this.setState({ltype: 'rock'}))}/>
                        <SimpleButton text="paper" buttonStyle={{marginTop:5,marginRight: 10, paddingRight:10, paddingBottom:30, backgroundColor: '#bbb'}}
                                      onPress={()=>(this.setState({ltype: 'paper'}))}/>
                        <SimpleButton text="scissors" buttonStyle={{marginTop:5,marginRight: 10, paddingRight:10, paddingBottom:30, backgroundColor: '#bbb'}}
                                      onPress={()=>(this.setState({ltype: 'scissors'}))}/>
                    </View>

                    <View style={{flexDirection:'row', alignItems:'stretch'}}>
                        <SimpleButton text="place " buttonStyle={{paddingLeft: 30, paddingBottom:30, backgroundColor: '#beb'}}
                                      onPress={this.placeLMarkerButton}/>
                        <SimpleButton text="delete" buttonStyle={{marginLeft:20, padding: 15, marginTop:5, backgroundColor: '#bbb'}}
                                      onPress={() => this.deleteButton(this.state.id)}/>
                    </View>
                </View>
            )
        }
        return (
                <MapView.Marker
                    ref={ref => { this.marker1 = ref; }}
                    title={this.props.markerId.toString()}
                    image={markerImg}
                    key={'Mymarker=' + this.props.markerId }
                    coordinate={this.props.latlng}
                >


                    <MapView.Callout
                    >

                        <View style={{ backgroundColor: '#d1d1d1'}}>
                            <Text>Current Lmarker at {this.props.latlng.latitude.toFixed(3)}, {this.props.latlng.longitude.toFixed(3)} </Text>
                            <Text>Ltype {this.state.ltype} </Text>
                            <Text> {`user_id ${this.state.user_id}  id: ${this.state.id}`} </Text>

                            {calloutView}


                        </View>
                    </MapView.Callout>



                </MapView.Marker>


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
const removeLmarker = gql`
mutation($id: Int!){ 
 removeLmarker(id:$id)
}
`;
const MyMarkerWithMutations = compose(
    graphql(placeLmarker, { name: 'placeLmarkerMutation' }),
    graphql(removeLmarker, { name: 'removeLmarkerMutation' }),
)(MyMarker);




export default MyMarkerWithMutations