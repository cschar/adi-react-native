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


const LOGIN = 'login'
const SIGNUP = 'singup'

export class LoginScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(){
        super();
        this.state = {
            viewType: LOGIN,
            loginEmailText: '',
            loginPasswordText: '',
            signupEmailText: '',
            signupPasswordText: ''
        }
    }

    onClick() {

    }

    submitSignup = (e) => {
        this.props.signUpMutation({
            variables: { email: this.state.loginEmailText,
                        password: this.state.loginPasswordText}
        })
            .then(({ data }) => {
                console.log('got data', data);
            }).catch((error) => {
            console.log('there was an error sending the query', error);
        });

        console.log('sing up')
    }

    submitLogin = (e) => {
        console.log('logging in ')
        this.props.loginMutationmutate({
            variables: { email: this.state.signupEmailText,
                         password: this.state.signupPasswordText}
        })
            .then(({ data }) => {
                console.log('got data', data);
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
                <View style={{backgroundColor: '#c6dddc'}}>
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
mutation{
 signInUser(input: {email: $email, password:$password}){
    token
    user{
        id
        email
    }
 }
}
`;

const submitSignup = gql`
mutation{ 
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
