import * as React from 'react';
import {StyleSheet, View, Text, ScrollView } from 'react-native';
import { getDocs, query, where, collection } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect




import SavedSearchItem from './../components/SavedSearchItem.js';


const getSavedSearches = async () => {
    try {
        const user = FIREBASE_AUTH.currentUser;

        const savedSearchesQuery = query(collection(FIRESTORE_DB, "Searches"), where("UID", "==", user.uid), where("saved", "==", true));
        const savedSearchesSnapShot = await getDocs(savedSearchesQuery);

        return savedSearchesSnapShot.docs.map(doc => ({
            searchString: doc.data().searchString,
            searchID: doc.id
        }));

    } catch(error) {
        console.log("getSavedSearches ", error);
        return [];
    }
}




export default function SavedSearches({navigation}) {
    const [savedSearches, setSavedSearches] = useState([]);

    useEffect(() => {
        getSavedSearches().then(searchStrings => {
            setSavedSearches(searchStrings);
        });
    }, []);



    const updateSavedSearchesList = async () => {
        const updatedSavedSearchesList = await getSavedSearches();
        setSavedSearches(updatedSavedSearchesList);
    }

    useEffect(() => {
        updateSavedSearchesList();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            updateSavedSearchesList();
            return () => {};
        }, [])
    );


    return (
        <View style={styles.container}>
            <View style={styles.savedSearchesWrapper}>
                <Text style={styles.pageTitle}>Your Saved Searches</Text>
                <ScrollView style={styles.scrollViewStyle}>
                    <View style={styles.savedSearchItems}>
                        {savedSearches.map(({ searchString, searchID }) => (
                            <SavedSearchItem 
                                key={searchID} 
                                text={searchString} 
                                navigation={navigation} 
                                searchID={searchID} 
                                updateSavedSearchesList={updateSavedSearchesList}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },

    savedSearchesWrapper: {
        flex: 1,
        paddingTop: 65,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15
    },

    savedSearchItems: {
        flex: 1,
        marginTop: 15
    },
});