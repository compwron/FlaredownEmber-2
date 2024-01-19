import React from "react";
import { StyleSheet, KeyboardAvoidingView, View } from "react-native";

import Footer from "./Footer";

export default function Background({ navigation, children }) {
  return (
    <View style={styles.background}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {children}
        <Footer navigation={navigation} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    // backgroundColor: Theme.colors.background,
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
