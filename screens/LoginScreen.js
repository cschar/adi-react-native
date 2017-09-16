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
import { WebBrowser } from 'expo';
import { FormLabel, FormInput, FormValidationMessage, Button } from 'react-native-elements'

import { gql, graphql, compose } from 'react-apollo';

import { MonoText } from '../components/StyledText';

import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';


const LOGIN = 'login'
const SIGNUP = 'singup'


let timerData2 = observable({
    secondsPassed: 0
});

//@observer
export class LoginScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

  //  @observable query = 'zup';
    //@observable token = null;


    constructor(){
        super();
        this.state = {
            loading: false,
            viewType: LOGIN,
            loginEmailText: 'test@z.ca',
            loginPasswordText: 'horahora',
            signupEmailText: 'test@z.ca',
            signupPasswordText: 'horahora'
        }
    }

    onClick = (e) => {

        console.log('click')
        this.props.setToken(this.token);

    }

    logout = (e) => {
        this.props.setToken(null)
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
                this.setState({loading: false})


                if(data.createUser && data.createUser.token) {

                    this.props.setToken(data.createUser.token);
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
            this.setState({loading: false})
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
                this.setState({loading: false})

                if(data.signInUser && data.signInUser.token) {

                    this.props.setToken(data.signInUser.token);
                    global.storage.save({
                        key: 'userInfo',   // Note: Do not use underscore("_") in key!
                        data: {
                            id: data.signInUser.user.id,
                            email: data.signInUser.user.email,
                            token: data.signInUser.token
                        }
                    });
                }
            }).catch((error) => {
            this.setState({loading: false})
            console.log('there was an error sending the query', error);
        });
    }

    render() {
        if (this.state.loading){
            return (
                <View style={{backgroundColor: '#c6dddc', paddingTop:40, margin:20}}>
                    <View style={styles.centering}>
                        <Text style={{fontSize: 24}}> Loading... </Text>
                        <ActivityIndicator color="green"
                                           size="large"
                        />
                    </View>
                </View>
            )
        }
        let view = null;
        if( this.props.token){
            view = (
                <View>
                    <Button backgroundColor={'#62cd91'}
                            onPress={this.onClick}
                            fontSize={24}
                            icon={{name: 'settings-input-component', size:40}}
                            title={'Signed In!'} />
                    <Text> {this.props.token} </Text>

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
                value={this.state.loginEmailText} />
                {/*<FormValidationMessage>Error message</FormValidationMessage>*/}

                <FormLabel>Password</FormLabel>
                <FormInput onChangeText={(text) => this.setState({loginPasswordText: text})}
                    value={this.state.loginPasswordText} />
                {/*<FormValidationMessage>Error3 message</FormValidationMessage>*/}

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
                               value={this.state.signupEmailText} />
                    {/*<FormValidationMessage>Error message</FormValidationMessage>*/}

                    <FormLabel>Password</FormLabel>
                    <FormInput onChangeText={(text) => this.setState({signupPasswordText: text})}
                               value={this.state.signupPasswordText} />
                    {/*<FormValidationMessage>Error3 message</FormValidationMessage>*/}

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
            <View style={styles.container}>
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={{
                        flexDirection:'column',
                        alignItems: 'stretch',
                        flexBasis: 'auto'}}
                    >

                    <View style={{flexDirection:'column',
                        alignItems: 'stretch',
                        flexBasis: 'auto',
                        backgroundColor: '#c6dddc', paddingTop:40, margin:20}}>

                        {view}

                    </View>
                    <Text> {this.props.token} </Text>


                </ScrollView>
            </View>
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
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        setToken : (token) => (
            dispatch({
                type:'SET_TOKEN',
                token: token
            })
        ),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreenWithMutations)


const styles = StyleSheet.create({
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

