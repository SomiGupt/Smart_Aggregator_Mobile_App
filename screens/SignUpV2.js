import React, { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert } from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, setDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";

const SignUpScreen = ({navigation}) => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const auth = FIREBASE_AUTH;

    const SignUp = async () => {

        const nameRegex = /^[A-Za-z\s'-]+$/;
        if (!name ||!nameRegex.test(name)) {
            Alert.alert("", 'Please enter a valid name.');
            return;
        }

        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!email ||!emailRegex.test(email)) {
            Alert.alert("",'Please enter a valid email address.');
            return;
        }
    
        const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
        if (!password ||!passwordRegex.test(password)) {
            Alert.alert("",'Password contains invalid characters.');
            return;
        }

        if (password.length < 8) {
            Alert.alert("",'Password must be at least 8 characters long.');
            return;
        }

        if (password != confirmPassword) {
            Alert.alert("","Your passwords do not match. Please try again.");
            return;
        }

        try {
            const response = await createUserWithEmailAndPassword(auth, email, password)
            console.log(response);
            setUserName(response.user);
        } catch (error) {
            console.log(error);
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('', 'An account with this email already exists.');
            } else {
            Alert.alert('Sign Up Failed: ', error);
            }
        }


        try {
            await addDoc(collection(FIRESTORE_DB, "Session ID"), {
            TimeStamp: serverTimestamp()
        });

        } catch (error) {
            console.log(error);
        }
    }

    
    const setUserName = async (user) => {
        try {
            const docRef = await setDoc(doc(FIRESTORE_DB, "User Names", user.uid), {
                name,
                email: user.email
            });
        } catch (error) {
            console.log(error);
        }
    };



    return (
        <KeyboardAvoidingView
            style = { styles.allComponentsContainer }
            behavior="padding"
        >
            <StatusBar style="dark"/>

            <Text style = { styles.Title }>Sign up for an Account</Text>


            <View style = { styles.InputContainer }>
                <Text>Preffered Name</Text>
                <TextInput
                    placeholder="John Doe"
                    value={name}
                    onChangeText={text => setName(text)}
                    style={styles.Input}
                />
                <Text>Email Address</Text>
                <TextInput
                    placeholder="example@mail.com"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.Input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Text>Password</Text>
                <TextInput
                    placeholder="*******"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.Input}
                    secureTextEntry
                />
                <Text>Confirm Password</Text>
                <TextInput
                    placeholder="*******"
                    value={confirmPassword}
                    onChangeText={text => setConfirmPassword(text)}
                    style={styles.Input}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity
                onPress={ SignUp }
                style={ styles.buttonContainer }
            >
                <Text style={styles.buttonText}>Create Account</Text>

            </TouchableOpacity>

            <View style = { styles.linkAndPromptContainer }>
                <Text >Already have an account?</Text>
                <TouchableOpacity
                    onPress={ () => navigation.navigate("LoginScreen") }
                >
                    <Text style={styles.linkText}>Login Here!</Text>

                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}


export default SignUpScreen

const styles = StyleSheet.create({

    allComponentsContainer: {
        flex: 1,
        justifyContent: "center", //verticalcentering
        alignItems: "center", //horizontal centering
        backgroundColor: 'white'
    },

    Title: {
        fontSize: 25,
        fontWeight: '500',
        padding: 10,
        textAlign: 'center',
        marginBottom: 25,
        width: '80%',
    },

    InputContainer: {
        width: '80%',
    },
    
    Input: {
        padding: 15,
        borderRadius: 10,
        marginTop: 3,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#E5E7EB',
    },

    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        height: 50,
        width: '80%',
    },

    buttonText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        width: '100%'
    },

    linkAndPromptContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: 8,
    },

    linkText: {
        color: '#0000FF'
    },
})
