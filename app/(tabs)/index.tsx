import { View, StyleSheet } from "react-native";
import { Graph2D } from "@/components/graph";
import { Canvas } from "@react-three/fiber/native";
import { useMemo } from "react";
import { useWindowSize } from "@/hooks/use-window-size";
import { OrthographicCamera, Bounds } from "@react-three/drei/native";
import { useGraph } from "@/stores/use-graph";

import shuffle from "@/util/shuffle";
import BinarySearchTree from "@/util/bst";
import spaceGraph from "@/util/separate-vertices";

const values = shuffle(Array.from({ length: 10 }, (_, i) => i + 1));

export default function Index() {
  const size = useWindowSize();
  // when does ready get updated again though?
  const graph = useMemo(() => {
    if (size.width == undefined || size.height == undefined) return undefined;
    let graph = BinarySearchTree().makeGraph(values);
    graph.vertices = spaceGraph(graph, size.width, size.height);
    return graph;
  }, [size.width, size.height, values]);

  if (!graph) return undefined;
  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <OrthographicCamera
          makeDefault
          zoom={50}
          top={size.height / 2}
          bottom={-size.height / 2}
          left={-size.width / 2}
          right={size.width / 2}
          near={1}
          far={2000}
          position={[0, 0, 200]}
        />
        <Bounds fit clip observe margin={1.2} maxDuration={0}>
          <Graph2D
            vertices={graph.vertices}
            edges={graph.edges}
            position={{ x: 0, y: 0, z: 0 }}
          />
        </Bounds>
        <color attach="background" args={["#f0f0f0"]} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});
