import React, { useEffect } from "react";
import {createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import WebViewScreen from "../../screens/WebViewScreen";
import VideoScreen from "../../screens/VideoScreen";

export const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Local notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data?.screen;
        if (screen && navigationRef.isReady()) {
          navigationRef.navigate(screen);
        }
      }
    );
    return () => subscription.remove();
  }, []);

  return (
      <Stack.Navigator initialRouteName="WebView">
        <Stack.Screen name="WebView" component={WebViewScreen} options={{ title: "WebView + Notifications"}}/>
        <Stack.Screen name="Video" component={VideoScreen} options={{ title: "Video Player" }}/>
      </Stack.Navigator>
  );
}
