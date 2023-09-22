import React, { useEffect, useState, useLayoutEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { auth, db, rdb } from "./firebase/FirebaseConfig";
import * as Location from "expo-location";

import {
  getDatabase,
  ref,
  child,
  get,
  push,
  onValue,
  off,
  set,
} from "firebase/database";
import { signOut } from "firebase/auth";
const Home = ({ navigation }) => {
  const openRouteServiceApiKey =
    "write you API here";
  const [initialRegion, setInitialRegion] = useState(null);
  const [move, setMove] = useState(null);
  const [destination, setDestination] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [data, setData] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [car, setCar] = useState();
  const [currentStep, setCurrentStep] = useState(0);
  const [route, setRoute] = useState([]);
  const StopCar = async () => {
    const userId = "jduZpnpKIya0TrBcWcHsaQsUHK12";
    set(ref(rdb, "finalCoordinates/" + userId), {
      longitude: 0,
      latitude: 0,
    });
    setDestination(null);
    setRouteCoordinates([]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Autonomous Vechile",
      headerTintColor: "#fff", // Set title color to white
      headerTitleAlign: "center",
      headerTitleStyle: {
        fontSize: 15, // Set title size to 10
        textShadowColor: "rgba(255, 255, 255, 0.7)", // Add text shadow color
        textShadowOffset: { width: 0, height: 5 }, // Set text shadow offset
        textShadowRadius: 5,
      },
      headerStyle: {
        backgroundColor: "black", // Set background color of the header to black
      },
      headerRight: () => (
        <TouchableOpacity
          style={{
            margin: 10,
          }}
          onPress={() => logout()}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>Log out</Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const logout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("LoginScreen");
        alert("Logout Successfully");
      })
      .catch((error) => {
        alert(error.Message);
      });
  };
  useEffect(() => {
    const dbRef = ref(rdb, "data");
    const onDataChange = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const coordinates = Object.values(data);
        setCoordinates(coordinates);
      } else {
        setCoordinates([]);
      }
    };

    const dbRefListener = onValue(dbRef, onDataChange);

    return () => {
      off(dbRef, "value", dbRefListener); // Unsubscribe from the database reference when the component unmounts
    };
  }, []);

  useEffect(() => {
    if (destination) {
      const { longitude, latitude } = destination; // Destructure the longitude and latitude from the destination object
      const userId = "jduZpnpKIya0TrBcWcHsaQsUHK12";
      set(ref(rdb, "finalCoordinates/" + userId), {
        longitude: longitude,
        latitude: latitude,
      });
    }
  }, [destination]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setInitialRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setCurrentLocation({ latitude, longitude });
    })();
  }, []);

  useEffect(() => {
    if (coordinates.length > 0) {
      coordinates.map((coordinate) => {
        setMove({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      });
    }
    // console.log(move);
  }, [coordinates]);

  // from car to final
  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setDestination(coordinate);

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${openRouteServiceApiKey}&start=${move.longitude},${move.latitude}&end=${coordinate.longitude},${coordinate.latitude}`;
    const response = await fetch(url);
    const data = await response.json();
    const route = data.features[0].geometry.coordinates.map((coordinate) => ({
      latitude: coordinate[1],
      longitude: coordinate[0],
    }));
    setRouteCoordinates(route);
    // console.log(routeCoordinates);
  };

  return (
    <View style={styles.container}>
      {initialRegion && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType="roadmap"
          zoomEnabled={true}
          showsUserLocation={true}
          initialRegion={initialRegion}
          onPress={handleMapPress}
        >
          {destination && (
            <Marker
              coordinate={destination}
              title="Destination"
              description="This is your destination"
            />
          )}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={3}
              strokeColor="hotpink"
            />
          )}

          <Marker
            coordinate={initialRegion}
            title="Your Location"
            description="This is your current location"
          >
          <Image 
            source={{
              uri:"https://i.pinimg.com/originals/2a/4d/1a/2a4d1aaf4dfa694bd052de04776bc686.png"
            }}
            style={{
              height:100,
              width:100,
            }}
          />
          </Marker>

          {move && (
            <Marker
              coordinate={move}
              title="Your Car Location"
              description="This is your car location"
            >
             <Image 
            source={{
              uri:"https://w7.pngwing.com/pngs/44/730/png-transparent-sports-car-cartoon-car-compact-car-car-vehicle-thumbnail.png"
            }}
            style={{
              height:25,
              width:50,
              borderRadius:50,
            }}
          />
          </Marker>

          )}
        </MapView>
      )}
      <View
        style={{
          flex: 0.4,
        }}
      >
      {!destination && (
      <View style={{
        alignItems:'center',
        justifyContent:'center',
        marginTop:5,
      }}>
        <Text style={{
          color:'white',
          fontSize:15,
        }}>
          Mark your destination
        </Text>
      </View>
      )
      }
        {destination && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                marginBottom: 10,
                fontSize: 15,
                textShadowColor: "rgba(255, 255, 255, 0.7)", // Add text shadow color
                textShadowOffset: { width: 0, height: 5 }, // Set text shadow offset
                textShadowRadius: 5,
              }}
            >
              Information
            </Text>
            <Text style={styles.text}>Your Location</Text>
            <Text style={styles.text}>
              Latitude: {currentLocation.latitude}
            </Text>
            <Text style={styles.text}>
              Longitude: {currentLocation.longitude}
            </Text>
            <Text style={styles.text}>Destination Location</Text>
            <Text style={styles.text}>Latitude: {destination.latitude}</Text>
            <Text style={styles.text}>Longitude: {destination.longitude}</Text>
            <Text style={styles.text}>Car Location</Text>
            <Text style={styles.text}>Latitude: {move.latitude}</Text>
            <Text style={styles.text}>Longitude: {move.longitude}</Text>
          </View>
        )}
        {destination && (
          <View>
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => StopCar()}
                style={{
                  backgroundColor: "white",
                  width: 120,
                  height: 40,
                  justifyContent: "center",
                  borderRadius: 40,
                }}
              >
                <Text style={{ textAlign: "center" }}>STOP</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
export default Home;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  map: {
    flex: 0.5,
    margin: 6,
    borderRadius: 15,
    // backgroundColor: 'black',
  },
  coordinatesContainer: {
    flex: 0.2,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 12,
    // fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
});
