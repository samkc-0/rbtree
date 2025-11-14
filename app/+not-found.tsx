import { View, Text, StyleSheet } from "react-native";
import { Stack, Link } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.text}>(not found)</Text>
        <Link href="/" style={styles.link}>
          go home
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
  },
  link: {
    textDecorationLine: "underline",
  },
});
