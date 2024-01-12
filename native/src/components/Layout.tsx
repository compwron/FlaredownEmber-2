import React from "react";
import {
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";

import Footer from "./Footer";
import { Theme } from "../Theme";

export default function Background({ navigation, children }) {
  return (
    <ImageBackground
      source={require("../../assets/empty.png")}
      resizeMode="repeat"
      style={styles.background}
    >
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {children}
        <Footer navigation={navigation} />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
