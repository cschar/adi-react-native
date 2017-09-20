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
} from 'react-native';
import { FormLabel, FormInput, FormValidationMessage, Button } from 'react-native-elements'

import { gql, graphql, compose } from 'react-apollo';

import flagPinkImg from '../assets/icons/notification-icon.png';
import papergif from '../assets/images/paper2.gif';


const MessageBarAlert = require('react-native-message-bar').MessageBar;
const MessageBarManager = require('react-native-message-bar').MessageBarManager;

import { Col, Row, Grid } from "react-native-easy-grid";
// import {MessageBarAlert, MessageBarManager} from 'react-native-message-bar';
import config from '../config.js'

const LOGIN = 'login'
const SIGNUP = 'singup'



export class LoginScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };


    constructor(){
        super();
        this.state = {
            loading: false,
            viewType: LOGIN,
            loginEmailText: 'test@z.ca',
            loginPasswordText: 'horahora',
            loginErrorMessage: '',
            signupEmailText: 'test@z.ca',
            signupPasswordText: 'horahora',
            signupErrorMessage: '',
        }
    }
    componentDidMount() {
        // Register the alert located on this master page
        // This MessageBar will be accessible from the current (same) component, and from its child component
        // The MessageBar is then declared only once, in your main component.
        MessageBarManager.registerMessageBar(this.refs.alert);
    }
    componentWillUnmount() {
        // Remove the alert located on this master page from the manager
        MessageBarManager.unregisterMessageBar();
    }

    onClick = (e) => {

        console.log("show alert");
        MessageBarManager.showAlert({
            title: 'Login already!',
            message: 'enter your email/password & click submit',
            alertType: 'success',
            avatarStyle: { height: 40, width: 40, borderRadius: 20 },

            // require doesnt work...?!
            //  avatar: "<URL/require('<path>') of your icon/avatar>", // Avatar/Icon <URL> of the alert or enter require('LOCALPATH') for local image
            avatar: config.ADI_IMAGE_SERVER + "/paper2.gif"
    });

    }

    logout = (e) => {
        // this.props.dispatchSetToken(null)
        this.props.dispatchSetUserInfo({userInfo: {}, token: null})
    }

    submitSignup = (e) => {
        console.log('signing UP!  ')
        this.setState({loading: true})
        this.props.signUpMutation({
            variables: { email: this.state.signupEmailText,
                        password: this.state.signupPasswordText}
        })
            .then(({ data }) => {
                console.log('got data', data);
                this.setState({loading: false})

                if(data.createUser && data.createUser.token) {

                    this.props.dispatchSetUserInfo({userInfo:data.createUser.user, token: data.createUser.token});
                    global.storage.save({
                        key: 'userInfo',   // Note: Do not use underscore("_") in key!
                        data: {
                            id: data.createUser.user.id,
                            email: data.createUser.user.email,
                            token: data.createUser.token
                        }
                    });
                }

            }).catch((error) => {
            // this.setState({loading: false, signupErrorMessage: error})
            this.setState({loading: false,
                signupErrorMessage: 'Error invalid email/password'})
            console.log('there was an error sending the query', error);


        });

    }

    submitLogin = (e) => {
        console.log('logging in  ')
        this.setState({loading: true})

        this.props.loginMutation({
            variables: { email: this.state.loginEmailText,
                         password: this.state.loginPasswordText}
        })
            .then(({ data }) => {
                console.log('got data', data);

                if(data.signInUser && data.signInUser.token) {
                    this.props.dispatchSetUserInfo({userInfo:data.signInUser.user, token: data.signInUser.token});

                    global.storage.save({
                        key: 'userInfo',
                        data: {
                            id: data.signInUser.user.id,
                            email: data.signInUser.user.email,
                            token: data.signInUser.token
                        }
                    });

                    this.setState({loading: false})
                }else if(data.signInUser == null){
                    this.setState({loading: false, loginErrorMessage: 'Bad email/password'});
                }
            }).catch((error) => {
            this.setState({loading: false, loginErrorMessage: 'Bad email/password'});
            console.log('there was an error sending the query', error);
        });
    }

    render() {
        let view = null;
        if (this.state.loading){
            view = (
            // return (
                <View style={{backgroundColor: '#c6dddc', paddingBottom:40, paddingTop:40, margin:20}}>
                    <View style={styles.centering}>
                        <Text style={{fontSize: 24}}> Loading... </Text>
                        <ActivityIndicator color="green"
                                           size="large"
                        />
                    </View>
                </View>

            )
        }

        else if(this.props.token){
            view = (
                <View>
                    <Button backgroundColor={'#62cd91'}
                            fontSize={24}
                            icon={{name: 'settings-input-component', size:40}}
                            title={'Signed In!'} />
                    <Text> {this.props.token} </Text>
                    <Text> ID: {this.props.userInfo.id} </Text>
                    <Text> Email: {this.props.userInfo.email} </Text>
                    {/*<Text> Points: 0 </Text>*/}

                    <Button backgroundColor={'#cd9258'}
                            onPress={this.logout}
                            fontSize={24}
                            icon={{name: 'settings-input-component', size:40}}
                            title={'Log out'} />
                </View>
            )
        }else if
        (this.state.viewType === LOGIN){
            view = (
                <View style={{flexGrow: 1}}>
                    <Button backgroundColor={'#62cd91'}
                            onPress={this.onClick}
                            fontSize={24}
                            icon={{name: 'settings-input-component', size:40}}
                            title={'Login to your Account'} />

                <FormLabel>Email</FormLabel>
                <FormInput onChangeText={(text) => this.setState({loginEmailText: text})}
                            inputStyle={styles.inputFont}
                           placeholderTextColor={'#000'}
                           value={this.state.loginEmailText} />


                <FormLabel>Password</FormLabel>
                <FormInput onChangeText={(text) => this.setState({loginPasswordText: text})}
                           inputStyle={styles.inputFont}
                           secureTextEntry={true}
                           value={this.state.loginPasswordText} />
                    <FormValidationMessage labelStyle={{fontSize:20, color:'#ff3049'}}>
                        {this.state.loginErrorMessage}
                    </FormValidationMessage>

                <Button onPress={this.submitLogin}
                        raised
                        large
                        iconRight
                        icon={{name: 'account-box'}}
                        title="SUBMIT" />

                    <Button style={{marginTop: 50}}
                            onPress={() =>(this.setState({viewType: this.state.viewType === LOGIN ? SIGNUP : LOGIN}))}
                            title={'Or... Signup'} />

            </View>
            )
        }else{
            view = (
                <View>
                    <Button backgroundColor={'#62cd91'}
                            fontSize={24}
                            icon={{name: 'settings-input-component', size:40}}
                            title={'Sign Up for a New Account!'} />

                    <FormLabel>Email</FormLabel>
                    <FormInput onChangeText={(text) => this.setState({signupEmailText: text})}
                               inputStyle={styles.inputFont}
                               value={this.state.signupEmailText} />

                    <FormLabel>Password</FormLabel>
                    <FormInput onChangeText={(text) => this.setState({signupPasswordText: text})}
                               inputStyle={styles.inputFont}
                               secureTextEntry={true}
                               value={this.state.signupPasswordText} />
                    <FormValidationMessage labelStyle={{fontSize:20, color:'#ff3049'}}>
                        {this.state.signupErrorMessage}
                    </FormValidationMessage>

                    <Button onPress={this.submitSignup}
                            raised
                            large
                            iconRight
                            icon={{name: 'account-box'}}
                            title="SUBMIT" />

                    <Button style={{marginTop: 50}}
                            onPress={() =>(this.setState({viewType: this.state.viewType === LOGIN ? SIGNUP : LOGIN}))}
                            title={'Or... Login'} />

                </View>
            )
        }


        return (

            <Grid >
                <Col style={{backgroundColor: '#8ad1dd', paddingTop:40, margin:20}}>

                {view}
                <MessageBarAlert ref="alert" />

                </Col>

            </Grid>

        );
    }

}





const submitLogin = gql`
mutation($email: String!, $password: String!){
 signInUser(input: {email: $email, password:$password}){
    token
    user{
        id
        email
    }
 }
}
`;

//mutation($email: String!, $password: String!)
// has to match schema returned by server

const submitSignup = gql`
mutation($email: String!, $password: String!){ 
 createUser(input: {email: $email, password:$password}){
    token
    user{
      id 
      email
    }
  }
}
`;

const LoginScreenWithMutations = compose(
    graphql(submitSignup, { name: 'signUpMutation' }),
    graphql(submitLogin, { name: 'loginMutation' })
)(LoginScreen);

// export default LoginScreenWithMutations;

import { connect } from 'react-redux';
const mapStateToProps = function(store) {

    return {
        token: store.redOne.token,
        userInfo: store.redOne.userInfo
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        dispatchSetToken : (token) => (
            dispatch({
                type:'SET_TOKEN',
                token: token
            })
        ),
        dispatchSetUserInfo : ({userInfo, token}) => (
            dispatch({
                type: 'SET_USER_INFO',
                userInfo: userInfo,
                token: token
            })
        )
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreenWithMutations)


const styles = StyleSheet.create({
    inputFont:{
        fontSize:20,
        color:'#000'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centering: {
        marginTop:50,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },

});

