import { View, StyleSheet } from "react-native";
import { Graph2D } from "@/components/graph";
import { Canvas } from "@react-three/fiber/native";
import { useMemo } from "react";
import { useWindowSize } from "../hooks/use-window-size";

import shuffle from "@/util/shuffle";
import BinarySearchTree from "@/util/bst";
import spaceGraph from "@/util/spaceGraph";

const values = shuffle(Array.from({ length: 10 }, (_, i) => i + 1));

export default function Index() {
  const { width, height } = useWindowSize();
  const { vertices, edges } = useMemo(() => {
    let graph = BinarySearchTree().makeGraph(values);
    graph = spaceGraph(graph, width, height, 80);
    console.log(graph);
    return graph;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
        <Graph2D
          vertices={vertices}
          edges={edges}
          position={{ x: 0, y: 0, z: -5 }}
        />
      </Canvas>
    </View>
  );
}
