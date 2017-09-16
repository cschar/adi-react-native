import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
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


@observer
export class LoginScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    @observable query = 'zup';
    @observable token = null;


    constructor(){
        super();
        this.state = {
            viewType: LOGIN,
            loginEmailText: 'test@z.ca',
            loginPasswordText: 'horahora',
            signupEmailText: 'test@z.ca',
            signupPasswordText: 'horahora'
        }
    }

    onClick = (e) => {
        console.log('click')
        // console.log(this.query)
        // this.query = this.query + "HEY"
        // console.log(this.query)

        console.log(this.token)
        console.log(this.query)

    }

    submitSignup = (e) => {
        console.log('signing UP!  ')
        this.props.signUpMutation({
            variables: { email: this.state.signupEmailText,
                        password: this.state.signupPasswordText}
        })
            .then(({ data }) => {
                console.log('got data', data);
                this.query = data;
                if(data.createUser && data.createUser.token) {
                    this.token = data.createUser.token
                }

            }).catch((error) => {
            console.log('there was an error sending the query', error);
        });

        console.log('sing up')
    }

    submitLogin = (e) => {
        console.log('logging in  ')
        this.props.loginMutation({
            variables: { email: this.state.loginEmailText,
                         password: this.state.loginPasswordText}
        })
            .then(({ data }) => {
                console.log('got data', data);
                this.query = data;

                if(data.signInUser && data.signInUser.token) {
                    this.token = data.signInUser.token
                }
            }).catch((error) => {
            console.log('there was an error sending the query', error);
        });
    }

    render() {

        let view = null;
        if( this.state.viewType === LOGIN){
            view = (
                <View style={{backgroundColor: '#c6dddc', paddingTop:40 }}>
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
                <View style={{backgroundColor: '#c6dddc', paddingTop:40}}>
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

        let loginSignupText = "Or... " + this.state.viewType === LOGIN ? SIGNUP : LOGIN;
        console.log(loginSignupText)

        return (
            <View style={styles.container}>
                <ScrollView
                    style={styles.container}
                    >

                    <View style={{margin: 20}}>
                        {view}

                    </View>

                </ScrollView>
            </View>
        );
    }

}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

});


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

export default LoginScreenWithMutations;
