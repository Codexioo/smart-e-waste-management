//tab _layout

import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons"


export default function TabLayout() {
  return (
<Tabs
screenOptions={{
  tabBarShowLabel: false,
  headerShown: false,
  tabBarActiveTintColor:"#00A52C",
  tabBarInactiveTintColor:"gray",
  tabBarStyle:{
    backgroundColor: "black",
    borderTopWidth: 0,
    position: "absolute",
    elevation: 0,
    height: 40,
    paddingBottom: 8,
  }
}}
> 

<Tabs.Screen name ='userdashboard'
options={{
  tabBarIcon: ({size,color}) => <Ionicons name="home" size={size} color={color}/>
}}
/>

<Tabs.Screen name ='profile'
options={{
  tabBarIcon: ({size,color}) => <Ionicons name="person-circle" size={size} color={color}/>
}}
/>

<Tabs.Screen name ='index'
options={{
  tabBarIcon: ({size,color}) => <Ionicons name="call" size={size} color={color}/>
}}
/>


</Tabs>
  );
}
