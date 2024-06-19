import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar, ScrollView, Dimensions, Keyboard, TouchableWithoutFeedback  } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FIREBASE_AUTH, FIRESTORE_DB } from "../FirebaseConfig";
import { addDoc, collection, serverTimestamp, sum } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { query, where, getDocs } from "firebase/firestore";
import { useFocusEffect } from '@react-navigation/native';
import { getDoc, setDoc } from "firebase/firestore";
import { Linking, ActivityIndicator } from "react-native";
import RNSharePdf from 'react-native-share-pdf';
import { Modal, Button } from 'react-native';




const width = Dimensions.get('window').width * 0.9;





const HomeScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showText, setShowText] = useState(false);

    const [userSearch, setUserSearch] = useState('');
    const [mySampleText, setMySampleText] = useState('');
    const [anotherSampleText, setAnotherSampleText] = useState([]);

    const [searchID, setSearchID] = useState('');

    const [currentViewIndex, setCurrentViewIndex] = useState(0);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const showModal = (message) => {
        setModalMessage(message);
        setModalVisible(true);
    };
    
    const hideModal = () => {
        setModalVisible(false);
    };


    const toggleSave = async () => {
        const newSavedValue = !isSaved;
        setIsSaved(newSavedValue);

        if (searchID) {
            await saveSearch(searchID, newSavedValue);
        } else {
            console.log("No search ID available to update");
        }
    }

    const handleSearch = async () => {
        //setup for result showing
        Keyboard.dismiss();
        setIsLoading(true);
        setButtonDisabled(true);
        setMySampleText('');
        setAnotherSampleText([]);
        setShowText(true);
        setIsSaved(false);

        let articlesAndSummary = [];
        let articles = [];
        let summary = '';

        //AWS rest API endpoint URL
        const apiUrl = 'http://3.147.85.26:8000/search';

        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout: Search took too long'));
            }, 180000);
        });

        try {
            const fetchPromise = fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userSearch: userSearch }),
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log(data)
            console.log(data.message)


            if (data.message === "None") {
                //If no articles are found
                summary = "We were unable to find any articles related to your search input in our databases. Please try modifying your search input.";
                showModal(summary);
                setMySampleText();
                setAnotherSampleText([]);

            } else if (Array.isArray(data.message)) {
                articlesAndSummary = data.message;
    
                summary = articlesAndSummary[articlesAndSummary.length - 1].summary;
                articles = articlesAndSummary.slice(0, -1);
    
                console.log("Articles:", articles);
                console.log("Summary:", summary);

                setMySampleText(summary);
                // const linksArray = articles.map(article => article.Link);
                // setAnotherSampleText(linksArray);

                setAnotherSampleText(articles);
            } else {
                showModal('Sorry! It seems that our servers are down. Please try again later.');
                setMySampleText();
                setAnotherSampleText([]);
            }
            // setMySampleText(summary);
            // const linksArray = articles.map(article => article.Link);
            // setAnotherSampleText(linksArray); 
        } 
        
        catch (error) {
            showModal('Sorry! It seems that our servers are down. Please try again later.');
            setMySampleText();
            setAnotherSampleText([]);
        } 
        
        finally {
            setButtonDisabled(false); 
            setIsLoading(false);
        }

        //stores user's input into Searches collection then stores the Document ID of the search in newSearchID
        const newSearchID = await storeUserSearch(userSearch); 
        
        if (newSearchID) {
            setSearchID(newSearchID); 
            storeSearchResults(newSearchID, articles, summary);
        } else {
            console.log("Error with getting searchID from storeUserSearch in handleSearch");
        }
    };

    const storeUserSearch = async (userSearch) => {
        try {
            const user = FIREBASE_AUTH.currentUser;

            // if(!user) {
            //     //just in case but likely not neccessary
            //     console.log("user wasnt logged in")
            //     return;
            // }

            const docRef = await addDoc(collection(FIRESTORE_DB, "Searches"), {
                searchString: userSearch,
                UID: user.uid,
                timestamp: serverTimestamp(),
                saved: false
            });

            return docRef.id;

        } catch (error) {
            console.log(error);
        }
    };


    const storeSearchResults = async (searchID, articles, summary) => {

        const allArticleLinks = articles.map(article => article.Link).join(" ");
        const allArticleTitles = articles.map(article => article.Title).join(" | ");

        try {
            const docRef = doc(FIRESTORE_DB, "SampleSearchIDsAndOutputs", searchID);

            await setDoc(docRef, {
                SearchID: searchID,
                ArticleLinks: allArticleLinks,
                ArticleTitles: allArticleTitles,
                ArticleSummary: summary,
            })
        }

        catch (error) {
            console.error("Error storing search results:", error);
        }
    };


    //     try {
    //         // Will be changed in 404 to use each the current search's actual ID held in the unmodified searchID variable
    //         //***FOR DEMO REPLACED "<SampleSearchID>" with searchID and filled db with sample data that use above <SampleSearchID>
    //         const q = query(collection(FIRESTORE_DB, "SampleSearchIDsAndOutputs"), where("SearchID", "==", searchID));
    //         const querySnapshot = await getDocs(q);

    //         if (!querySnapshot.empty) {
    //             const firstDoc = querySnapshot.docs[0];
    //             const data = firstDoc.data();
    //             setMySampleText(data.ArticleSummary);
    //             const links = data.ArticleLinks.split(" ");
    //             setAnotherSampleText(links);
    //         }

    //         else {
    //             console.log("get Article Info Sample ID Error")
    //         }

    //     } catch (error) {
    //         console.log(error);
    //     }
    // };


    const saveSearch = async (searchID, savedValue) => {
        try {
            const searchesDocRef = doc(FIRESTORE_DB, "Searches", searchID);
            await updateDoc(searchesDocRef, {
                saved: savedValue
            });
        } catch (error) {
            console.log(error);
        }
    }
    

    const checkSavedStatus = async (searchID) => {
        try {
            const searchesDocRef = doc(FIRESTORE_DB, "Searches", searchID);
            const docSnap = await getDoc(searchesDocRef);

            if (docSnap.exists()) {
                setIsSaved(docSnap.data().saved);
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            console.log("Error getting document:", error);
        }
    };
    

    useFocusEffect(
        React.useCallback(() => {
            if (searchID) {
                checkSavedStatus(searchID);
            } else {
                console.log("No searchID available for checking saved status");
            }
            return () => {};
        }, [searchID]) 
    );


    // const createAndSharePDF = async () => {
    //     const mySampleText = "This is the sample text that will be included in the PDF.";
    
    //     try {
    //         const options = {
    //             html: `<h1 style="text-align:center;">PDF Title</h1><p>${mySampleText}</p>`,
    //             fileName: 'SamplePDF',
    //             directory: 'Documents', // or 'docs'
    //             base64: false, // Set to true if you want to get the base64 representation of the file
    //         };
    
    //         // Generating the PDF
    //         RNSharePdf.createPDF(options)
    //             .then((filePath) => {
    //                 console.log('PDF file created at: ', filePath);
    
    //                 // Sharing the PDF
    //                 RNSharePdf.sharePDF(filePath, options.fileName)
    //                     .then((res) => console.log('PDF shared successfully: ', res))
    //                     .catch((error) => console.error('Error sharing PDF: ', error));
    //             })
    //             .catch((error) => console.error('Error creating PDF: ', error));
    //     } catch (error) {
    //         console.error('An error occurred: ', error);
    //     }
    // };
    


    return (
        <View style = { showText? styles.allComponentsContainerResultShown :  styles.allComponentsContainerResultHidden}>

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    hideModal();
                }}
            >
                <TouchableWithoutFeedback onPress={() => hideModal()}>
                    <View style={styles.centeredView}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>{modalMessage}</Text>
                                <TouchableOpacity onPress={() => hideModal()} style={styles.modalButton}>
                                    <Text style={styles.modalButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Text style = { showText ? styles.TitleResultShown : styles.TitleResultHidden }>
                {showText ? "Would you like to research something else?" : "What would you like to research?"}
            </Text>
            <View style = { styles.InputContainer }>
                <TextInput
                    placeholder="Enter your search here..."
                    value={userSearch}
                    onChangeText={text => setUserSearch(text)}
                    style={showText ? styles.InputResultShown : styles.InputResultHidden}
                />
            </View>

            <TouchableOpacity
                onPress={ handleSearch }
                disabled={ buttonDisabled }
                style={showText ? 
                    (buttonDisabled ? styles.buttonContainerResultShownDisabled : styles.buttonContainerResultShown) :
                    styles.buttonContainerResultHidden
                }
            >
                <Text style={styles.buttonText}>Search</Text>

            </TouchableOpacity>

            {/* <TouchableOpacity onPress={createAndSharePDF} style={styles.buttonStyle}>
                <Text style={styles.buttonText}>Create and Share PDF</Text>
            </TouchableOpacity> */}

            

            {showText && ( 
                <View style={styles.ResultWrapper}>
                    {isLoading && (
                        <ActivityIndicator size="large" color="#000000" style={styles.activityIndicator}/>
                    )}
                    {showText && ( 
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
                                            onPress={() => {
                                                Linking.openURL(article.Link).catch(err => console.error("An error occurred", err));
                                            }}
                                            style={{ marginVertical: 5 }}
                                        >
                                            <Text style={{ color: 'blue', textDecorationLine: 'underline', fontSize: 18, fontWeight: 'bold' }}
                                            numberOfLines={3}  
                                            ellipsizeMode="tail"
                                            >
                                                {article.Title}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </ScrollView>
                    )}
               </View>                
            )}

            {showText && (             
                <View style={styles.RadioContainer}>
                    <Ionicons name={currentViewIndex === 0 ? "radio-button-on" : "radio-button-off"} size={15} color="black"  style={{ marginRight: 2 }} />
                    <Ionicons name={currentViewIndex === 1 ? "radio-button-on" : "radio-button-off"} size={15} color="black" style={{ marginLeft: 2 }}/>
                </View>
            )}

            {showText && (             
                <TouchableOpacity onPress={toggleSave} style={styles.SaveHeart}>
                    <Ionicons name={isSaved ? "heart" : "heart-outline"} size={24} color="red" />
                </TouchableOpacity>
            )}

        </View>
    )
}


export default HomeScreen

const styles = StyleSheet.create({
    allComponentsContainerResultShown: {
        flex: 1,
        justifyContent: "flex-start", 
        alignItems: "center", 
        backgroundColor: 'white'
    },

    allComponentsContainerResultHidden: {
        flex: 1,
        justifyContent: "center", //verticalcentering
        alignItems: "center", //horizontal centering
        backgroundColor: 'white'
    },
    
    TitleResultShown: {
        fontSize: 25,
        fontWeight: '500',
        paddingTop: 4,
        paddingBottom: 8,
        textAlign: 'center',
        width: '90%',
        marginTop: 60
    },

    TitleResultHidden: {
        fontSize: 25,
        fontWeight: '500',
        paddingBottom: 4,
        textAlign: 'center',
        width: '90%',
    },

    InputContainer: {
        width: '85%',
    },

    InputResultShown:{
        padding: 15,
        borderRadius: 10,
        marginTop: 6,
        marginBottom: 4,
        fontSize: 15,
        backgroundColor: '#E5E7EB',
    },

    InputResultHidden: {
        padding: 15,
        borderRadius: 10,
        marginTop: 6,
        marginBottom: 8,
        fontSize: 15,
        backgroundColor: '#E5E7EB',
    },

    buttonContainerResultShown: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        padding: 10,
        borderRadius: 50,
        marginTop: 4,
        marginBottom: 4,
        height: 45,
        width: '85%',
    },

    buttonContainerResultShownDisabled: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C0C0C0',
        padding: 10,
        borderRadius: 50,
        marginTop: 4,
        marginBottom: 4,
        height: 45,
        width: '85%',
    },

    buttonContainerResultHidden: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        padding: 10,
        borderRadius: 50,
        marginTop: 4,
        height: 45,
        width: '85%',
    },

    buttonText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        width: '100%'
    },

    ResultWrapper: {
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        marginHorizontal: '5%', 
        marginTop: 12, 
        marginBottom: 295
    },

    scrollViewStyle: {
        margin: 15,
        marginTop: 10,
        marginBottom: 5,
    },

    textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
    },

    SaveHeart: {
        position: 'absolute',
        right: 28,
        bottom: 8,
    },
    RadioContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 15,
    },
    activityIndicator: {
        position: 'absolute',   
        left: '46%',           
        top: '46%',            
    },

    // buttonStyle: {
    //     padding: 10,
    //     backgroundColor: '#007bff',
    //     borderRadius: 5,
    // },
    // buttonText: {
    //     color: 'white',
    //     textAlign: 'center',
    // },

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
        width: '75%',
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    modalButton: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        height: 35
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },

})