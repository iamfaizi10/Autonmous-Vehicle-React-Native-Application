import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet, Text, View } from "react-native";
import Home from "./Home";
import LoginScreen from "./Src/Screen/LoginScreen";



export default function App() {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator
      initialRouteName="LoginScreen"
      >
      
    
        <Stack.Screen name="LoginScreen" component={LoginScreen}  options={{ header: () => null }}/>
        <Stack.Screen name="Home" component={Home} />
      
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
