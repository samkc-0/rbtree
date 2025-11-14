import { View, StyleSheet } from "react-native";
import { Graph2D } from "@/components/graph";
import { Canvas } from "@react-three/fiber/native";
import { useMemo } from "react";
import { useWindowSize } from "../hooks/use-window-size";
import { OrbitControls } from "@react-three/drei/native";

import shuffle from "@/util/shuffle";
import BinarySearchTree from "@/util/bst";
import spaceGraph from "@/util/separate-vertices";

const values = shuffle(Array.from({ length: 10 }, (_, i) => i + 1));

export default function Index() {
  const { width, height } = useWindowSize();
  const { vertices, edges } = useMemo(() => {
    let graph = BinarySearchTree().makeGraph(values);
    graph.vertices = spaceGraph(graph, width, height, 80);
    console.log(graph);
    return graph;
  }, []);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} camera={{ position: [0, 0, 200], fov: 75 }}>
        <Graph2D
          vertices={vertices}
          edges={edges}
          position={{ x: 0, y: 0, z: 0 }}
        />
        <OrbitControls />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lime",
  },
  canvas: {
    flex: 1,
  },
});
