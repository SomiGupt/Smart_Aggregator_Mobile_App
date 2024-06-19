import * as React from 'react';
import {StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import { useEffect, useState } from 'react';
import { query, where, getDocs, collection } from "firebase/firestore";
import { sendPasswordResetEmail, updateEmail } from "firebase/auth";
import { Modal, TextInput, Button } from 'react-native';
import { updateDoc, addDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { Alert } from 'react-native';





    




export default function AccountOptions({navigation}) {
    const [modalVisible, setModalVisible] = useState(false);
    const [inputText, setInputText] = useState('');
    const [modalPurpose, setModalPurpose] = useState('');
    
    const [userName, setUserName] = useState('');


    useEffect(() => {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
            fetchUserName(user.email);
        }
    }, []);


    const fetchUserName = async (email) => {
        const q = query(collection(FIRESTORE_DB, "User Names"), where("email", "==", email));
    
        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                setUserName(doc.data().name);
            });

        } catch (error) {
            console.error("fetchUserNameError: ", error);
        }
    };


    const handlePasswordChange = async () => {
        const user = FIREBASE_AUTH.currentUser;

        try {
            await sendPasswordResetEmail(FIREBASE_AUTH, user.email);
            Alert.alert("","Password reset email sent!");
        } catch (error) {
            console.error("handlePasswordChange: ", error);
            alert("Failed to send password reset email. Please try again.");
        }
    };


    const updateUserName = async (newName) => {
        const user = FIREBASE_AUTH.currentUser;

        const q = query(collection(FIRESTORE_DB, "User Names"), where("email", "==", user.email));

        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (doc) => {
                await updateDoc(doc.ref, { name: newName });
            });
            setModalVisible(false);
            fetchUserName(user.email); 
            Alert.alert("","Your name has been changed.");
        } catch (error) {
            console.error("updateUserName: ", error);
            alert("Failed to update your name.");
        }
    
    }

    const openModal = (purpose) => {
        setModalPurpose(purpose);
        setModalVisible(true);
    };


    const handleSubmit = async () => {
        const user = FIREBASE_AUTH.currentUser;

        if (modalPurpose === 'changeName') {
            updateUserName(inputText);
        } else if (modalPurpose === 'reportProblem') {
            try {
                await addDoc(collection(FIRESTORE_DB, "User Feedback"), {
                    Email: user.email,
                    Problem: inputText
                });
                Alert.alert("","Thank you for your submission, we will take care of the issue and get back to you if needed.");
            } catch (error) {
                console.error("Error submitting feedback: ", error);
                alert("Failed to submit feedback.");
            }
        } else if (modalPurpose === 'changeEmail') {
            Alert.alert("","Your email will be changed after you verify your email...");
            console.log("New email: ", inputText);
        }
        setInputText('');
        setModalVisible(false);
    };

    // const handleEmailChange = async (user, newEmail) => {
    
    //     if (!user.emailVerified) {
    //         try {
    //             await sendEmailVerification(user);
    //             Alert.alert("", "Please verify your current email first. We have sent you a verification email.");
    //         } catch (error) {
    //             console.error("handleEmailChange: ", error);
    //             Alert.alert("", "Failed to send verification email. Please try again.");
    //         }
    //     } else {

    //         try {
    //             await updateEmail(user, newEmail);
    //             Alert.alert("", "Email updated successfully.");
    //         } catch (error) {
    //             console.error("Error updating email: ", error);
    //             Alert.alert("", "Failed to update email.");
    //         }
    //     }

    // };


    const handleDeleteAccount = async () => {
        const user = FIREBASE_AUTH.currentUser;
        FIREBASE_AUTH.signOut()
        if (user) {
            try {
                await deleteUser(user);
                Alert.alert("","Account deleted successfully.");
            } catch (error) {
                console.error("Error deleting account: ", error);
                alert("Failed to delete account.");
            }
        } else {
            alert("No user logged in.");
        }
    };


    const confirmDeleteAccount = () => {
        Alert.alert
        (
            "","Are you sure you want to delete your account?", 
            [{text: "No"} , {text: "Yes", onPress: () => handleDeleteAccount()},],
        );
    };


    const handleChangeEmailPress = () => {
        setModalPurpose('changeEmail');
        setModalVisible(true);
    };



    return (
        <View style = {styles.container}>
            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { setModalVisible(!modalVisible); }}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.centeredView}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalView}>
                                <TextInput 
                                    style={[styles.modalTextInput, modalPurpose === 'reportProblem' && styles.largeTextInput]}
                                    onChangeText={setInputText}
                                    value={inputText}
                                    placeholder={
                                        modalPurpose === 'changeName' ? "Enter your new name..." :
                                        modalPurpose === 'changeEmail' ? "Enter your new email..." :
                                        "Describe your issue..."
                                    }
                                    placeholderTextColor="#333"
                                    multiline={modalPurpose === 'reportProblem'}
                                    keyboardType={modalPurpose === 'changeEmail' ? 'email-address' : 'default'}
                                />
                                <TouchableOpacity onPress={handleSubmit} style={styles.modalSubmitButton}>
                                    <Text style={styles.modalSubmitButtonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <Text style={styles.Title1}>Hello</Text>
            <Text style={styles.Title2}>{userName}</Text>
            <Text style={styles.subTitle}>Here are some options for managing your account:</Text>
            <View style={styles.AccountOptionsWrapper}>
                <View style={styles.AccountInformationOptionsWrapper}>
                

                    <TouchableOpacity  onPress={() => openModal('changeName')} style={styles.savedSearchItem}>
                        <View style={styles.SearchBlurbWrapper}>
                            <Text style={styles.SavedSearchBlurb}>Change Name</Text>
                        </View>
                    </TouchableOpacity>


                    {/* <TouchableOpacity onPress={handleChangeEmailPress} style={styles.savedSearchItem}>
                        <View style={styles.SearchBlurbWrapper}>
                            <Text style={styles.SavedSearchBlurb}>Change Email</Text>
                        </View>
                    </TouchableOpacity> */}


                    <TouchableOpacity onPress={handlePasswordChange} style={styles.savedSearchItem}>
                        <View style={styles.SearchBlurbWrapper}>
                            <Text style={styles.SavedSearchBlurb}>Change Password</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.AppFeedbackOptionWrapper}>
                    <TouchableOpacity  onPress={() => openModal('reportProblem')} style={styles.savedSearchItem}>
                        <View style={styles.SearchBlurbWrapper}>
                            <Text style={styles.SavedSearchBlurb}>Report a Problem</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.AccountManagementOptionsWrapper}>
                    <TouchableOpacity  onPress={() => FIREBASE_AUTH.signOut()} style={styles.savedSearchItem}>
                        <View style={styles.SearchBlurbWrapper}>
                            <Text style={styles.SavedSearchBlurb}>Log Out</Text>
                        </View>
                    </TouchableOpacity>


                    <TouchableOpacity onPress={confirmDeleteAccount} style={styles.savedSearchItem}>
                        <View style={styles.SearchBlurbWrapper}>
                            <Text style={styles.SavedSearchBlurb}>Delete Account</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    Title1: {
        fontSize: 30,
        fontWeight: 'bold',
        paddingTop: 4,
        textAlign: 'center',
        width: '90%',
        marginTop: 60,
    },
    Title2: {
        fontSize: 30,
        fontWeight: 'bold',
        paddingBottom: 8,
        textAlign: 'center',
        width: '90%',
    },
    subTitle: {
        fontSize: 25,
        fontWeight: '500',
        paddingTop: 4,
        marginTop: 8,
        textAlign: 'center',
        width: '95%',
    },
    AccountOptionsWrapper: {
        flex: 1,
        justifyContent: 'flex-start',
        width: '95%',
        alignItems: 'center',
    },

    AccountInformationOptionsWrapper: {
        flex: 1,
        marginTop: 30,
        alignItems: 'flex-start',
        width: '95%'
    },

    AppFeedbackOptionWrapper: {
        marginTop: 40,
        alignItems: 'flex-start',
        width: '95%'
    },

    AccountManagementOptionsWrapper: {
        marginTop: 80,
        alignItems: 'flex-start',
        width: '95%',
        marginBottom: 20
    },

    savedSearchItem: {
        backgroundColor: '#D9D9D9',
        padding: 15,
        width: '100%',
        borderRadius: 50,
        marginBottom: 10,
    },

    SearchBlurbWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',       
    },

    SavedSearchBlurb: {
        fontWeight: '600',
    },

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
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
    largeTextInput: {
        height: 100, 
    },

});