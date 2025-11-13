import { View, StyleSheet } from "react-native";
import shuffle from "@/util/shuffle";
import { Graph2D } from "@/components/graph";
import BST from "@/components/bst";
import { Canvas } from "@react-three/fiber/native";

const values = shuffle(Array.from({ length: 10 }, (_, i) => i + 1));
const bst = BST();
const { nodes: vertices, links: edges } = bst.makeGraph(values);

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
        <Graph2D
          vertices={vertices}
          edges={edges}
          position={{ x: 0, y: 0, z: 0 }}
        />
      </Canvas>
    </View>
  );
}
