import { Graph } from "@/components/app";
import { View, StyleSheet } from "react-native";
import shuffle from "@/util/shuffle";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const values = shuffle(Array.from({ length: 10 }, (_, i) => i + 1));
import { Canvas } from "@react-three/fiber/native";
import { OrbitControls } from "@react-three/drei/native";

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <Graph3D />
    </View>
  );
}

export function Graph3D() {
  return (
    <Canvas style={styles.canvas} camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight />
      <directionalLight position={[5, 5, 5]} />
      <Box />
      {/* OrbitControls may or may not work depending on your setup; 
   gestures are a bit different on native */}
      <OrbitControls />
    </Canvas>
  );
}

function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="orange" />
    </mesh>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  canvas: {
    flex: 1,
  },
});
