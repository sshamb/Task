# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

---

## 📱 Project Overview

This app is built with **React Native + Expo** and demonstrates a complete flow with **WebView, Notifications, and Video Player**.

### 🔹 WebView Screen
- Loads [reactnative.dev](https://reactnative.dev/) inside the app using `react-native-webview`.
- Buttons to trigger **local notifications** (delivered after random 2–5s delay).
- Manual button to navigate to the **Video Player screen**.

### 🔹 Video Player Screen
Advanced media player with:
- Play/Pause, Mute/Unmute.  
- Skip forward/backward (10s).  
- Double-tap gestures for skipping.  
- Fullscreen toggle with orientation lock.  
- Auto-hide controls for immersive experience.  
- Slider with real-time playback updates.
- Next/Previous video switching between multiple streams.
- Loader visible only while buffering.
  
  
### 🔹 Navigation & Notifications (index.tsx)
- Built with React Navigation (@react-navigation/native + Stack).
- Integrated Expo Notifications:
  Local notifications triggered from WebView Screen.

---

## ⚡ Usage Flow

1. App opens on **WebView Screen** showing React Native docs.  
2. Tap **Show Notification** → a local notification is scheduled after 2–5s.  
3. Tap the notification → navigates automatically to **Video Player Screen**.  
4. On Video Player Screen → control playback, skip, use gestures, or go fullscreen.
    

---
/screens
├── WebViewScreen.tsx # WebView + Local Notifications + Navigation
├── VideoScreen.tsx # Custom Advanced Video Player
/index.tsx # Navigation + Notification handling


---

## 📦 Installation Steps:

1. Install dependencies:
   npm install
   
3. Install required packages:
   npx expo install react-native-webview expo-notifications expo-av expo-screen-orientation @react-navigation/native @react-navigation/native-stack @react-native-community/slider react-native-size-matters @expo/vector-icons

4. Start the app:
   npx expo start







