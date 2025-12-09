// stores/use-graph.ts
import { create } from "zustand";
import type { GraphType, VertexType, EdgeType } from "@/types/graph";

interface GraphState {
  vertices: VertexType[];
  edges: EdgeType[];

  // Actions
  setGraph: (graph: GraphType) => void;
  translateVertex: (uuid: string, dx: number, dy: number, dz?: number) => void;
  setVertexPosition: (uuid: string, x: number, y: number, z?: number) => void;
  getVertex: (uuid: string) => VertexType | undefined;
  getEdgesForVertex: (uuid: string) => EdgeType[];
}

export const useGraph = create<GraphState>((set, get) => ({
  vertices: [],
  edges: [],

  setGraph: (graph) => {
    set({
      vertices: graph.vertices,
      edges: graph.edges,
    });
  },

  translateVertex: (uuid, dx, dy, dz = 0) => {
    set((state) => ({
      vertices: state.vertices.map((vertex) =>
        vertex.uuid === uuid
          ? {
              ...vertex,
              x: vertex.x + dx,
              y: vertex.y + dy,
              z: vertex.z + dz,
            }
          : vertex,
      ),
    }));
  },

  setVertexPosition: (uuid, x, y, z) => {
    set((state) => ({
      vertices: state.vertices.map((vertex) =>
        vertex.uuid === uuid
          ? {
              ...vertex,
              x,
              y,
              z: z ?? vertex.z,
            }
          : vertex,
      ),
    }));
  },

  getVertex: (uuid) => {
    return get().vertices.find((v) => v.uuid === uuid);
  },

  getEdgesForVertex: (uuid) => {
    return get().edges.filter((e) => e.source === uuid || e.target === uuid);
  },
}));
