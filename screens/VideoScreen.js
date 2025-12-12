import React, { useRef, useState, useEffect } from "react";
import {View,StyleSheet,TouchableOpacity,Text,TouchableWithoutFeedback,Animated,StatusBar,BackHandler,useWindowDimensions,ActivityIndicator} from "react-native";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { moderateScale } from "react-native-size-matters";
import * as ScreenOrientation from "expo-screen-orientation";

export default function VideoScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const videoRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPlayNext, setPendingPlayNext] = useState(false);
  const controlOpacity = useRef(new Animated.Value(1)).current;
  const playScale = useRef(new Animated.Value(1)).current;

  // Multiple video sources
  const videoUrls = [
    "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    // "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const videoHeight = isFullScreen ? height : width * 0.56;
  const lastTap = useRef(0);
  const dynamicControls = {
  paddingVertical: isFullScreen ? moderateScale(20) : moderateScale(80),
  paddingBottom: isFullScreen ? moderateScale(30) : 0,
};

  // Hide header in fullscreen
  useEffect(() => {
    navigation.setOptions({ headerShown: !isFullScreen });
  }, [isFullScreen]);

  // Handle Back Button
  useEffect(() => {
    const backAction = () => {
      if (isFullScreen) {
        exitFullScreen();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isFullScreen]);

  // Animate controls opacity
  useEffect(() => {
    Animated.timing(controlOpacity, {
      toValue: showControls ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showControls]);

  // Update playback status
  const onPlaybackStatusUpdate = (status) => {
    if (!status) return;
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);

      // show loader only if buffering AND playback isn't currently playing
      if (status.isBuffering && !status.isPlaying) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }

      // if the video just finished, auto-advance to next and autoplay
      // if (status.didJustFinish) {
      //   changeVideo(true);
      // }
    }
  };

  // Called when the new source has loaded metadata - safe place to start playback
  const handleOnLoad = async () => {
    // stop any loader that was from network load
    setIsLoading(false);

    if (pendingPlayNext || isPlaying) {
      // ensure flag cleared and attempt to start playback
      setPendingPlayNext(false);
      try {
        await videoRef.current?.playAsync();
        setIsPlaying(true);
      } catch (e) {
        // ignore play errors (network etc.) — onPlaybackStatusUpdate will update state
      }
    }
  };

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    Animated.sequence([
      Animated.timing(playScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(playScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const skipForward = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (!status?.isLoaded) return;

    const wasPlaying = status.isPlaying;
    const newPos = Math.min(status.positionMillis + 10000, status.durationMillis);

    await videoRef.current.setPositionAsync(newPos);

    if (wasPlaying) {
      setTimeout(() => videoRef.current?.playAsync(), 100);
    }
  };

  const skipBackward = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (!status?.isLoaded) return;

    const wasPlaying = status.isPlaying;
    const newPos = Math.max(status.positionMillis - 10000, 0);

    await videoRef.current.setPositionAsync(newPos);

    if (wasPlaying) {
      setTimeout(() => videoRef.current?.playAsync(), 100);
    }
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  const enterFullScreen = async () => {
    setIsFullScreen(true);
    StatusBar.setHidden(true, "fade");
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  };

  const exitFullScreen = async () => {
    setIsFullScreen(false);
    StatusBar.setHidden(false, "fade");
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT
    );
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor((millis || 0) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTapArea = (side) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (side === "left") skipBackward();
      else skipForward();
      lastTap.current = 0;
    } else {
      setShowControls((prev) => !prev);
      lastTap.current = now;
    }
  };

  // Transition between videos with fade animation and reliable autoplay
  // const changeVideo = async (next = true) => {
  //   let newIndex = next ? currentIndex + 1 : currentIndex - 1;
  //   if (newIndex >= videoUrls.length) newIndex = 0;
  //   if (newIndex < 0) newIndex = videoUrls.length - 1;

  //   // mark we want to autoplay when the new source finishes loading
  //   setPendingPlayNext(true);
  //   setIsLoading(true); // show loader during switch
  //   setIsPlaying(true); // ensure UI reflects that we want playback

  //   Animated.timing(fadeAnim, {
  //     toValue: 0,
  //     duration: 400,
  //     useNativeDriver: true,
  //   }).start(async () => {
  //     try {
  //       // stop previous, then switch source - onLoad will start playback
  //       await videoRef.current?.stopAsync();
  //     } catch (e) {
  //       // ignore
  //     }
  //     setCurrentIndex(newIndex);
  //     setPosition(0);

  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 400,
  //       useNativeDriver: true,
  //     }).start();
  //   });
  // };

  return (
    <View style={styles.container}>
      <Animated.View style={{ width: "100%", height: videoHeight, opacity: fadeAnim }}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrls[currentIndex] }}
          style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
          resizeMode="contain"
          shouldPlay={isPlaying}
          isMuted={isMuted}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onLoadStart={() => setIsLoading(true)}
          onLoad={handleOnLoad}
          onError={() => setIsLoading(false)}
        />

        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        <View style={{position: "absolute",width: "100%",height: "100%",flexDirection: "row",}}>
          <TouchableWithoutFeedback onPress={() => handleTapArea("left")}>
            <View style={{ width: "50%", height: "100%" }} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => handleTapArea("right")}>
            <View style={{ width: "50%", height: "100%" }} />
          </TouchableWithoutFeedback>
        </View>
      </Animated.View>

      {/* Controls */}
      <Animated.View
        style={[styles.controlsContainer, { opacity: controlOpacity,bottom: isFullScreen ? 10 : 70, // normal me 80px upar, fullscreen me 10px niche
 }]}
      >
        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#1EB1FC"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#1EB1FC"
            onSlidingComplete={async (val) => {
              if (videoRef.current) await videoRef.current.setPositionAsync(val);
            }}
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Buttons */}
    <View style={[styles.controls, dynamicControls]}>
      {/* <TouchableOpacity onPress={() => changeVideo(false)} style={styles.iconButton}>
        <Ionicons name="play-skip-back" size={30} color="#fff" />
      </TouchableOpacity> */}

      <TouchableOpacity onPress={skipBackward} style={styles.iconButton}>
        <Ionicons name="play-back" size={30} color="#fff" />
      </TouchableOpacity>

      <Animated.View style={{ transform: [{ scale: playScale }] }}>
        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
        <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={64} color="#1EB1FC"/>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity onPress={skipForward} style={styles.iconButton}>
        <Ionicons name="play-forward" size={30} color="#fff" />
      </TouchableOpacity>

      {/* <TouchableOpacity onPress={() => changeVideo(true)} style={styles.iconButton}>
        <Ionicons name="play-skip-forward" size={30} color="#fff" />
      </TouchableOpacity> */}

      <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
        <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={32} color="#fff"/>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => (isFullScreen ? exitFullScreen() : enterFullScreen())} style={styles.iconButton}>
        <Ionicons name={isFullScreen ? "contract" : "expand"} size={34} color="#fff"/>
      </TouchableOpacity>
  </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  controlsContainer: { position: "absolute",  width: "100%" },
  sliderContainer: {flexDirection: "row",alignItems: "center",paddingHorizontal: moderateScale(15),backgroundColor: "rgba(0,0,0,0.5)",},
  slider: { flex: 1, marginHorizontal: moderateScale(5) },
  timeText: { color: "#fff", width: 50, textAlign: "center" },
  controls: {flexDirection: "row",justifyContent: "space-around",alignItems: "center",backgroundColor: "rgba(0,0,0,0.6)"},
  iconButton: { paddingHorizontal: moderateScale(4),},
  playButton: { marginHorizontal: moderateScale(6) },
  loaderContainer: {position: "absolute",top: 0,left: 0,right: 0,bottom: 0,justifyContent: "center",alignItems: "center",backgroundColor: "rgba(0,0,0,0.25)",zIndex: 2},
});