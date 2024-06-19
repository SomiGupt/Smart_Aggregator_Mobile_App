import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'

import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../FirebaseConfig';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';




//Screens
import SignUpScreen from '../screens/SignUpV2';
import HomeScreen from '../screens/HomeV2';
import LoginScreen from '../screens/LoginV2';
import SavedSearches from '../screens/SavedSearches';
import SavedSearchItemDisplay from '../screens/SavedSearchItemDisplay';
import AccountOptions from '../screens/AccountOptions';



const LoginStack = createNativeStackNavigator();

const InsideAppTab = createBottomTabNavigator();

const SavedSearchStack = createNativeStackNavigator();



const AuthStack = () => {
    const [user, setUser] = React.useState(null);

    React.useEffect( () => {
        onAuthStateChanged(FIREBASE_AUTH, (user) => {
            console.log(user);
            setUser(user);
        });

        setSessionID();
        
    }, []);

    const setSessionID = async ()  => {
        try {
            await addDoc(collection(FIRESTORE_DB, "Session ID"), { TimeStamp: serverTimestamp() });

        } catch (error) {
            console.log(error);
        }
    }


    return (
        <NavigationContainer>
                { user ? (
                    <InsideAppTabNavigator />
                ) : (
                    <LoginStack.Navigator>
                        <LoginStack.Screen
                            name="LoginScreen"
                            component={LoginScreen}
                            options={{headerShown: false}}
                        />
                        <LoginStack.Screen 
                            name="SignUpScreen"
                            component={SignUpScreen}
                            options={{headerShown: false}}
                        />
                    </LoginStack.Navigator>
                )}
        </NavigationContainer>
    );
};


const SavedSearchStackNavigator = () => {
    return (
        <SavedSearchStack.Navigator>
            <SavedSearchStack.Screen 
                name='SavedSearches' 
                component={SavedSearches} 
                options={{ headerShown: false }}
            />
            <SavedSearchStack.Screen 
                name='SavedSearchItemDisplay' 
                component={SavedSearchItemDisplay} 
                options={{ 
                    headerShown: true,
                    title: '',
                    headerBackTitle: 'Saved Searches',
                }}
            />
        </SavedSearchStack.Navigator>
    )
}



const InsideAppTabNavigator = () => {
    return (
        <InsideAppTab.Navigator
            initialRouteName='Search'
            screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                    let iconName;
                    let routeName = route.name;

                    if (routeName == "Search") {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (routeName == "Saved Searches") {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (routeName == "Account Settings") {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name = {iconName} size={size} color={color}/>

                },
                headerShown:false
            })}
        >
            <InsideAppTab.Screen name="Saved Searches" component={SavedSearchStackNavigator}/>
            <InsideAppTab.Screen name="Search" component={HomeScreen}/>
            <InsideAppTab.Screen name="Account Settings" component={AccountOptions}/>
        </InsideAppTab.Navigator>
    );
};



export default AuthStack;