// stores/use-graph.ts
import { create } from "zustand";
import type { GraphType, VertexType, EdgeType } from "@/types/graph";

type GraphState = {
  vertices: VertexType[];
  edges: EdgeType[];
  setGraph: (graph: GraphType) => void;
  translate: (uuid: string, dx: number, dy: number, dz?: number) => void;
  updateVertex: (uuid: string, updates: Partial<VertexType>) => void;
  getVertex: (uuid: string) => VertexType | undefined;
};

export const useGraph = create<GraphState>((set, get) => ({
  vertices: [],
  edges: [],

  setGraph: (graph: GraphType) => {
    set({ vertices: graph.vertices, edges: graph.edges });
  },

  translate: (uuid: string, dx: number, dy: number, dz: number = 0) => {
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

  updateVertex: (uuid: string, updates: Partial<VertexType>) => {
    set((state) => ({
      vertices: state.vertices.map((vertex) =>
        vertex.uuid === uuid ? { ...vertex, ...updates } : vertex,
      ),
    }));
  },

  getVertex: (uuid: string) => {
    return get().vertices.find((v) => v.uuid === uuid);
  },
}));
