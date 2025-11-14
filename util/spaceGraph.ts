import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3";
import type { GraphType } from "@/types/graph";

export default function spaceGraph(
  graph: GraphType,
  width: number,
  height: number,
  distance: number,
): GraphType {
  const { vertices, edges } = graph;
  const sim = forceSimulation(vertices as any)
    .force(
      "link",
      forceLink(edges as any)
        .id((d: any) => d.uuid)
        .distance(distance),
    )
    .force("charge", forceManyBody().strength(-120))
    .force("center", forceCenter(width / 2, height / 2))
    .stop();

  for (let i = 0; i < 300; i++) sim.tick();
  return { vertices, edges };
}
