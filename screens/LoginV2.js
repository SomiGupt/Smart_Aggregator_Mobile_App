import React, { useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Modal, TouchableWithoutFeedback, Alert } from "react-native";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { addDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig";

const LoginScreen = ({navigation}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [inputText, setInputText] = useState('');
    
    const auth = FIREBASE_AUTH;

    const SignIn = async () => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password)
            console.log(response);
        } catch (error) {
            console.log(error);
            Alert.alert("", "Please check that you entered the correct email and password.");
        }

        try {
            await addDoc(collection(FIRESTORE_DB, "Session ID"), {
            TimeStamp: serverTimestamp()
        });

        } catch (error) {
            console.log(error);
        }

    }

    const handlePasswordChange = async () => {
        try {
            await sendPasswordResetEmail(FIREBASE_AUTH, inputText);
            Alert.alert("", "Password reset email sent!");
            setModalVisible(false);
        } catch (error) {
            Alert.alert("", "Failed to send password reset email.");
        }        
    };

    const handleForgotPasswordPress = () => {
        setModalVisible(true);
    };



    return (

        <View
            style = { styles.allComponentsContainer }
            behavior="padding"
        >
            <StatusBar style="dark"/>
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.centeredView}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalView}>
                                <TextInput 
                                    style={styles.modalTextInput}
                                    onChangeText={setInputText}
                                    value={inputText}
                                    placeholder= "Enter your Email..."
                                    placeholderTextColor="#333"
                                />
                                <TouchableOpacity onPress={() => handlePasswordChange(inputText)} style={styles.modalSubmitButton}>
                                    <Text style={styles.modalSubmitButtonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <Text style = { styles.Title }>The Smart Aggregator</Text>
            <KeyboardAvoidingView style = { styles.InputContainer }>
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
            </KeyboardAvoidingView>

            <TouchableOpacity
                onPress={ SignIn }
                style={ styles.buttonContainer }
            >
                <Text style={styles.buttonText}>Login</Text>

            </TouchableOpacity>

            <View style = { styles.linkAndPromptContainer }>
                <Text >Don't have an account?</Text>
                <TouchableOpacity
                    onPress={ () => navigation.navigate("SignUpScreen") }
                >
                    <Text style={styles.linkText}>Sign Up Here!</Text>

                </TouchableOpacity>
                <TouchableOpacity
                    onPress={ handleForgotPasswordPress }
                >
                    <Text style={styles.linkText2}>Forgot Password?</Text>

                </TouchableOpacity>
            </View>
        </View>
    )
}


export default LoginScreen

const styles = StyleSheet.create({

    allComponentsContainer: {
        flex: 1,
        justifyContent: "flex-start", 
        alignItems: "center", 
        backgroundColor: 'white',
    },

    Title: {
        fontSize: 40,
        fontWeight: 'bold',
        padding: 10,
        textAlign: 'center',
        marginTop: '40%',
        marginBottom: 45,
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

    linkText2: {
        marginTop:10,
        color: '#0000FF'
    },

    modalView: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
    },

    modalTextInput: {
        marginBottom: 15,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        width: 250,
    },

    modalSubmitButton: {
        backgroundColor: '#000', 
        paddingHorizontal: 20,
        paddingVertical: 8,
        width: '100%',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },

    modalSubmitButtonText: {
        fontWeight: '400', 
        color: 'white', 
        fontSize: 14, 
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
})
