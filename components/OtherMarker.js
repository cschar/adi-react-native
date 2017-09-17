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
        if(this.props.lmarker.ltype == 'rock'){
            markerImg = rockImg
        }
        if(this.props.lmarker.ltype == 'paper'){
            markerImg = paperImg
        }
        if(this.props.lmarker.ltype == 'scissors'){
            markerImg = scissorsImg
        }
        let marker = this.props.lmarker

        let latlng = {latitude: this.props.lmarker.lat,
            longitude: this.props.lmarker.lng};

        let innerText = `${marker.id} -- lat/lng:
             ${marker.lat.toFixed(3)}, ${marker.lng.toFixed(3)}`;

        return (
            <View>
                <MapView.Marker
                    title={this.props.lmarker.id}
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

                <MapView.Circle radius={400}
                                // key={'lmarker-key' + index.toString()}
                                fillColor="rgba(133, 133, 200, 0.2)"
                                strokeColor="rgba(0, 0, 0, 0.7)"
                                center={latlng}
                />
            </View>
        )
    }
}

export default OtherMarker