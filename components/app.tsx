import { View, Dimensions } from "react-native";
import { useEffect, useMemo, useState } from "react";
import BST from "./bst";
import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3";
import "./app.css";
import Svg, { G, Line, Circle, Text as SvgText } from "react-native-svg";

type Props = { values: number[] };

const bst = BST();

const baseNodeRadius = 24;

function useWindowSize() {
  const [size, setSize] = useState(Dimensions.get("window"));
  useEffect(() => {
    const onChange = ({ window }: any) => {
      setSize(window);
    };
    const sub = Dimensions.addEventListener("change", onChange);
    return () => sub?.remove();
  }, []);
  return size;
}

export function Graph({ values }: Props) {
  const { width, height } = useWindowSize();
  const { nodes, links } = useMemo(() => {
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

  return (
    <View>
      <Svg width={width} height={height}>
        <G>
          {/* Links */}
          {links.map(({ id, source, target }) => {
            const s = nodes.find((n) => n.id === source.id || n.id === source);
            const t = nodes.find((n) => n.id === target.id || n.id === target);
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
          {nodes.map((d) => {
            return (
              <G key={d.id}>
                <Circle
                  cx={d.x!}
                  cy={d.y!}
                  r={d.value + baseNodeRadius}
                  fill="black"
                />
                <SvgText
                  x={d.x!}
                  y={d.y!}
                  fontSize={24}
                  textAnchor="middle"
                  alignmentBaseline="central"
                  fill="white"
                  fontFamily="sans-serif"
                >
                  {d.value}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}
