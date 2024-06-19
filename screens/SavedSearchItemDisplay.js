import * as React from 'react';
import  {ScrollView, StyleSheet, View, Text, Dimensions, TouchableOpacity} from 'react-native';
import { query, collection, where, getDocs } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';
import { useState, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Linking } from "react-native";



const width = Dimensions.get('window').width* 0.9;



export default function SavedSearchItemDisplay({route, navigation}) {
    const { itemText, searchID } = route.params;
    const [currentViewIndex, setCurrentViewIndex] = useState(0);


    //Manually modifies searchID, normal functionality would pass searchID as is and expect SampleSearchIDsAndOutputs or whatever database we use to have the given searchID saved.
    //Remove this later, only for Demo purposes
    // let demoSearchID = searchID

    // if (itemText == "mRNA") {
    //     demoSearchID = "sampleSearch_mRNA"
    // } else if (itemText == "Superconductors") {
    //     demoSearchID = "sampleSearch_SC"
    // } else if (itemText == "Electric aircrafts") {
    //     demoSearchID = "sampleSearch_EA"
    // } else {
    //     demoSearchID = "sampleSearch_general"
    // }

    const [mySampleText, setMySampleText] = useState('');
    const [anotherSampleText, setAnotherSampleText] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const q = query(collection(FIRESTORE_DB, "SampleSearchIDsAndOutputs"), where("SearchID", "==", searchID)); //Note change to searchID for none demo purposes
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docData = querySnapshot.docs[0].data();
                setMySampleText(docData.ArticleSummary);
                const links = docData.ArticleLinks.split(" ");
                const titles = docData.ArticleTitles.split(" | ");
                const articleObjects = titles.map((title, index) => ({
                    title: title,
                    link: links[index]
                }));
                setAnotherSampleText(articleObjects);
            }
        };

        fetchData();
    }, [searchID]);

    return (
        <View style={styles.container}>
            <View style={styles.blurbContainer}>
                <Text style={styles.titleText}
                    numberOfLines={2}  
                    ellipsizeMode="tail"
                >
                    {itemText}
                </Text>
            </View>
            <View style={styles.ResultWrapper}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={({nativeEvent}) => {
                        if (nativeEvent.contentOffset.x === 0) {
                            setCurrentViewIndex(0);
                        } else {
                            setCurrentViewIndex(1);
                        }
                    }}
                    scrollEventThrottle={16}
                >
                    <View style={{ width, justifyContent: 'center', alignItems: 'center' }}>
                        <ScrollView style={styles.scrollViewStyle}>
                            <Text style={styles.textStyle}>{mySampleText}</Text>
                        </ScrollView>
                    </View>
                    <View style={{ width, justifyContent: 'center', alignItems: 'flex-start' }}>
                        <ScrollView style={styles.scrollViewStyle}>
                            {anotherSampleText.map((article, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => Linking.openURL(article.link).catch(err => console.error("An error occurred", err))}
                                    style={{ marginVertical: 5 }}
                                >
                                    <Text style={{ color: 'blue', textDecorationLine: 'underline', fontSize: 18, fontWeight: 'bold' }}
                                    numberOfLines={3}  
                                    ellipsizeMode="tail"
                                    >
                                        {article.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </ScrollView>
            </View> 
            <View style={styles.RadioContainer}>
                    <Ionicons name={currentViewIndex === 0 ? "radio-button-on" : "radio-button-off"} size={15} color="black" style={{ marginRight: 2 }} />
                    <Ionicons name={currentViewIndex === 1 ? "radio-button-on" : "radio-button-off"} size={15} color="black" style={{ marginLeft: 2 }}/>
                </View>  
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start", 
        alignItems: "center", 
        backgroundColor: 'white',
    },

    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    ResultWrapper: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        marginHorizontal: '5%', 
        marginTop: 12, 
        marginBottom: 5, 
    },
    scrollViewStyle: {
        marginTop: 10,
        marginBottom: 5,
        width: '100%', 
        paddingHorizontal: 15,
    },

    textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    blurbContainer: {
        backgroundColor: '#D9D9D9',
        padding: 15,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginHorizontal: 20,
        marginTop: 20,
        width: '90%',
    },
    RadioContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 15,
    },
});

