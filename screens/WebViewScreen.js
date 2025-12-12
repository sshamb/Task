import Buttons from "@/components/Buttons";
import * as Notifications from "expo-notifications";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

// Needed for APK to actually display notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function WebViewScreen({ navigation }) {
  // Ask for permissions (Expo Go auto-grants, APK doesn’t)
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
      }
    })();


  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) {
        navigation.navigate(screen);
      }
    }
  );

  return () => subscription.remove();
}, []);


  // helper to trigger local notification
  const triggerNotification = async (message) => {
    const delay = Math.floor(Math.random() * 4) + 2; // 2–5 seconds
    console.log(`⏱ Notification will arrive in ${delay} seconds`);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📢 Notification",
        body: `${message} (arrives in ${delay}s)`, // shows delay in body too
        data: { screen: "Video" },
      },
      trigger: { seconds: delay },
    });
  };

  return (
    <View style={styles.container}>
      <WebView source={{ uri: "https://developer.android.com/develop/ui/views/layout/webapps/webview" }} style={{ flex: 1 }}/>
      <View style={{flexDirection:"row" ,width:"100%",justifyContent:"space-between",padding:10}}>
      <Buttons width="45%" title="First Notification" functions={()=>triggerNotification("Hello! ")}/>
      <Buttons width="45%"title="Second Notification"functions={()=>triggerNotification("How r u?")}/>
      </View>
<Buttons width="95%" background="red" style={{alignSelf:"center",}}title="Video" functions={()=>navigation.navigate("Video")}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", },
  
});
