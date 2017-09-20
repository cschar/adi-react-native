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





class OtherMarker extends React.Component{
    // lmarker (api)

    constructor(){
        super()
    }

    render(){
        let markerImg = null
        if(this.props.marker.ltype == 'rock'){
            markerImg = rockImg
        }
        if(this.props.marker.ltype == 'paper'){
            markerImg = paperImg
        }
        if(this.props.marker.ltype == 'scissors'){
            markerImg = scissorsImg
        }
        let marker = this.props.marker

        let latlng = {latitude: marker.lat,
            longitude: marker.lng};

        let innerText = `${marker.ltype} -- lat/lng:
             ${marker.lat.toFixed(3)}, ${marker.lng.toFixed(3)}
             ID: ${marker.id},  USER_ID: ${marker.user_id} `;

        return (
                <MapView.Marker
                    image={markerImg}
                    // key={marker.id + index.toString()}
                    coordinate={latlng}
                >
                    <MapView.Callout>
                        <View style={{ backgroundColor: '#d1d1d1'}}>
                            <Text style={{ color: 'blue'}}>
                                {innerText}

                            </Text>
                        </View>
                    </MapView.Callout>
                </MapView.Marker>
        )
    }
}

export default OtherMarker