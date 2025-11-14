import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3";
import type { GraphType, VertexType } from "@/types/graph";

export default function spaceGraph(
  graph: GraphType,
  width: number,
  height: number,
  distance: number,
): VertexType[] {
  let { vertices } = graph;
  const sim = forceSimulation(vertices as any)
    .force("charge", forceManyBody().strength(-120))
    .force("center", forceCenter(width / 2, height / 2))
    .stop();

  for (let i = 0; i < 300; i++) sim.tick();

  // nomalize to three js
  const X = vertices.map(({ x }) => x);
  const Y = vertices.map(({ y }) => y);

  const left = Math.min(...X);
  const right = Math.max(...X);
  const top = Math.min(...Y);
  const bottom = Math.max(...Y);

  const dimensions = {
    width: right - left || 1,
    height: bottom - top || 1,
    max: 0,
  };
  dimensions.max = Math.max(dimensions.width, dimensions.height);

  // center in d3 space
  const origin = {
    x: (left + right) / 2,
    y: (top + bottom) / 2,
  };

  const radius = 100; // 3D graph lives within [-5, 5]
  const scale = (2 * radius) / dimensions.max;

  vertices.forEach((v) => {
    const normalized = {
      x: (v.x - origin.x) * scale,
      y: (v.y - origin.y) * scale,
    };

    // flip y because d3 origin is top left, three is bottom left
    v.x = normalized.x;
    v.y = -normalized.y;
  });

  return vertices;
}
