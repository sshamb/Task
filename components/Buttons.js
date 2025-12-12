import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function Buttons({
  title = "Click Me",
  functions,
  background = "#faf0e6",
  textColor = "#000",
  radius = 12,
  padding = 12,
  width = "60%",
  style,
  textStyle
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: background, borderRadius: radius, padding: padding, width: width },
        style
      ]}
      activeOpacity={0.8}
      onPress={functions}
    >
      <Text style={[styles.buttonText, { color: textColor }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    elevation: 3.1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  }
});
