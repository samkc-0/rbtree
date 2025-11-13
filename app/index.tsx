import { View, StyleSheet } from "react-native";
import shuffle from "@/util/shuffle";
import { Graph2D } from "@/components/graph";
import BST from "@/components/bst";

const values = shuffle(Array.from({ length: 10 }, (_, i) => i + 1));
const bst = BST();
const { nodes: vertices, links: edges } = bst.makeGraph(values);

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <Graph2D vertices={vertices} edges={edges} />
    </View>
  );
}
