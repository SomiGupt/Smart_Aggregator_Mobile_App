import React, {useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FIRESTORE_DB } from "../FirebaseConfig";
import { updateDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";


const SavedSearchItem = ({ text, navigation, searchID, updateSavedSearchesList }) => {
    const [isSaved, setIsSaved] = useState(true);


    const handlePress = () => {
        navigation.navigate('SavedSearchItemDisplay', { itemText: text, searchID: searchID });
    };

    const toggleSave = async () => {
        const newSavedValue = !isSaved;
        setIsSaved(newSavedValue);

        try {
            const SearchesDocRef = doc(FIRESTORE_DB, "Searches", searchID);
            await updateDoc(SearchesDocRef, {
                saved: newSavedValue
            });

            setTimeout(() => {
                updateSavedSearchesList();
            }, 2000);

        } catch (error) {
            console.log(error);
        }
    };


    return (
        <View style = {styles.savedSearchItem}>
            <TouchableOpacity onPress={handlePress} style={styles.SearchBlurbWrapper}>
                <Text style={styles.SavedSearchBlurb}
                    numberOfLines={2}
                    ellipsizeMode="tail">
                    {text}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleSave} style={styles.SaveHeart}>
                <Ionicons name={isSaved ? "heart" : "heart-outline"} size={24} color="red" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    savedSearchItem: {
        backgroundColor: '#D9D9D9',
        padding: 15,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 15,
    },

    SearchBlurbWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        flex: 0.96,
    },

    SavedSearchBlurb: {
        fontWeight: '600'
    },

    SaveHeart: {
    },


    
});

export default SavedSearchItem;