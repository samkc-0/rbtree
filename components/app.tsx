import { View, Dimensions } from "react-native";
import { useRef, useEffect, useMemo, useState } from "react";
import BST from "./bst";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import shuffle from "@/util/shuffle";
import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3";
import "./app.css";
import Svg, { G, Line, Circle, Text as SvgText } from "react-native-svg";

/*
const { makeGraph, uuid } = BST();

const values = Array.from({ length: 10 }, (_, i) => i);
const graph = makeGraph(shuffle(values));

function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

export function setupApp() {
  let selectedNode = null;
  let timeout = null;

  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
  let link = svg
    .selectAll(".link")
    .data(graph.links)
    .join("line")
    .classed("link", true);
  function getNode() {
    return svg
      .selectAll(".node")
      .data(graph.nodes)
      .join((enter) => {
        const g = enter.append("g").attr("class", "node");
        g.append("circle").attr("r", (d) => d.value + RADIUS);
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .text((d) => d.value ?? "");
        return g;
      })
      .classed("red", (d) => d.red)
      .classed("selected", (d) => d.id === selectedNode?.id);
  }
  let node = getNode();

  const simulation = d3
    .forceSimulation()
    .nodes(graph.nodes)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force(
      "link",
      d3
        .forceLink(graph.links)
        .id((d) => d.id)
        .distance(200),
    )
    .stop();
  for (let i = 0; i < 300; i++) simulation.tick();
  tick();

  const drag = d3.drag().on("start", dragstart).on("drag", dragged);

  node
    .call(drag)
    .on("dblclick", toggleRed)
    .on("mouseover", hover)
    .on("mouseout", unhover)
    .on("click", addLink);

  link.on("dblclick", cut);
  function cut(_, l) {
    graph.links = graph.links.filter(({ id }) => l.id !== id);
    refreshLinks();
  }
  function addLink(_, d) {
    if (selectedNode) {
      if (linkExists(selectedNode.id, d.id)) {
        deselect();
        return;
      }
      console.log(`... linked ${selectedNode.id} to ${d.id}.`);
      const newLink = {
        id: uuid.gen(),
        source: selectedNode.id,
        target: d.id,
      };
      graph.links = [...graph.links, newLink];
      deselect();
      timeout && clearTimeout(timeout);
      refreshLinks();
      return;
    }
    console.log(`Adding link from ${d.id}...`);
    select(d);
    timeout = setTimeout(() => {
      deselect();
    }, 2000);
  }
  function select(d) {
    selectedNode = d;
    node = getNode();
  }
  function deselect() {
    selectedNode = null;
    node = getNode();
  }

  function linkExists(source, target) {
    const sid = typeof source === "object" ? source.id : source;
    const tid = typeof target === "object" ? target.id : target;
    const exists = graph.links.some(
      (l) =>
        (l.source.id === sid && l.target.id === tid) ||
        (l.source.id === tid && l.target.id === sid),
    );
    if (exists) {
      console.log(`Link already exists: ${sid} -> ${tid}. Cancelled.`);
    }
    return exists;
  }

  function tick() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  function toggleRed(_, d) {
    d.red = !d.red;
    d3.select(this).classed("red", (d) => d.red);
  }

  function hover(_, d) {
    d3.select(this).classed("hover", true);
  }

  function unhover(_, d) {
    d3.select(this).classed("hover", false);
  }

  function dragstart() {
    return;
  }

  function dragged(event, d) {
    d.x = clamp(event.x, 0, width);
    d.y = clamp(event.y, 0, height);
    tick();
  }

  function refreshLinks() {
    link = svg
      .selectAll(".link")
      .data(graph.links, (d) => d.id)
      .join(
        (enter) => enter.append("line").classed("link", true).on("click", cut),
        (update) => update,
        (exit) => exit.remove(),
      );
    link.lower();
    simulation.force("link").links(graph.links);
    tick();
  }

  return svg;
}

*/
type Props = { values: number[] };

const bst = BST();

const width = 640;
const height = 480;
const radius = 24;

function useWindowSize() {
  const [size, setSize] = useState(Dimensions.get("window"));
  useEffect(() => {
    const onChange = ({ window }) => {
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
                <Circle cx={d.x!} cy={d.y!} r={d.value + radius} fill="black" />
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

/*
export default function RedBlackTrees({}) {
  const ref = useRef(null);

  useEffect(() => {
    const svgRBTree = setupApp();
    ref.current.appendChild(svgRBTree.node());
    return () => svgRBTree.remove();
  }, []);

  return <svg width={"100%"} height={"100%"} ref={ref}></svg>;
}
*/
