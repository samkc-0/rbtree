import { View, Dimensions } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { G, Line } from "react-native-svg";
import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3";
import Vertex from "@/components/vertex";
import BST from "./bst";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import useWindowSize from "@/hooks/use-window-size";
import { scheduleOnRN } from "react-native-worklets";

const bst = BST();

const baseRadius = 24;

type Props = {
  values: number[];
};

export function Graph({ values }: Props) {
  const { width, height } = useWindowSize();
  const graph = useMemo(() => {
    let { nodes, links } = bst.makeGraph(values);
    const sim = forceSimulation(nodes as any)
      .force(
        "link",
        forceLink(links as any)
          .id((d: any) => d.id)
          .distance(80),
      )
      .force("charge", forceManyBody().strength(-120))
      .force("center", forceCenter(width / 2, height / 2))
      .stop();

    for (let i = 0; i < 300; i++) sim.tick();
    return { nodes, links };
  }, []);
  const [nodes, setNodes] = useState(graph.nodes);
  const [links, setLinks] = useState(graph.links);
  const [draggingNode, setDraggingNode] = useState<{ id: number } | undefined>(
    undefined,
  );
  const onDrag = Gesture.Pan()
    .onStart((e) => {
      // work out which *svg circle* is being dragged
    })
    .onUpdate((e) => {
      // update the *svg circle position.
    })
    .onEnd(() => {
      // update the *data*
    });
  return (
    <GestureDetector gesture={onDrag}>
      <View>
        <Svg width={width} height={height}>
          <G>
            {/* Links */}
            {links.map(({ id, source, target }) => {
              const s = nodes.find(
                (n) => n.id === source.id || n.id === source,
              );
              const t = nodes.find(
                (n) => n.id === target.id || n.id === target,
              );
              if (!s || !t) return null;
              return (
                <Line
                  key={id}
                  x1={s.x!}
                  y1={s.y!}
                  x2={t.x!}
                  y2={t.y!}
                  stroke="#999"
                  strokeOpacity={0.7}
                  strokeWidth={4}
                />
              );
            })}
            {/* Nodes */}
            {nodes.map(({ id, x, y, value }) => (
              <Vertex key={id} x={x!} y={y!} value={value} />
            ))}
          </G>
        </Svg>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hitbox: {
    position: "absolute",
    height: 120,
    width: 120,
    backgroundColor: "#b58df1",
    borderRadius: 20,
    marginBottom: 30,
  },
});

type Point = Required<{ x: number; y: number }>;

function distance(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
