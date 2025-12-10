// stores/use-graph.ts
import { create } from "zustand";
import type { GraphType, VertexType, EdgeType } from "@/types/graph";

interface GraphState {
  vertices: VertexType[];
  edges: EdgeType[];
  detachedEdges: Map<string, EdgeType[]>; // Store detached edges by vertex uuid
  
  // Actions
  setGraph: (graph: GraphType) => void;
  translateVertex: (uuid: string, dx: number, dy: number, dz?: number) => void;
  setVertexPosition: (uuid: string, x: number, y: number, z?: number) => void;
  getVertex: (uuid: string) => VertexType | undefined;
  getEdgesForVertex: (uuid: string) => EdgeType[];
  
  // Yank & Reattach
  yankVertex: (uuid: string) => void;
  reattachVertex: (uuid: string, newParentUuid: string) => void;
  isVertexYanked: (uuid: string) => boolean;
}

export const useGraph = create<GraphState>((set, get) => ({
  vertices: [],
  edges: [],
  detachedEdges: new Map(),

  setGraph: (graph) => {
    set({
      vertices: graph.vertices,
      edges: graph.edges,
      detachedEdges: new Map(),
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
          : vertex
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
          : vertex
      ),
    }));
  },

  getVertex: (uuid) => {
    return get().vertices.find((v) => v.uuid === uuid);
  },

  getEdgesForVertex: (uuid) => {
    return get().edges.filter((e) => e.source === uuid || e.target === uuid);
  },

  yankVertex: (uuid) => {
    set((state) => {
      // Find all edges connected to this vertex and its descendants
      const getDescendants = (vertexUuid: string): string[] => {
        const children = state.edges
          .filter((e) => e.source === vertexUuid)
          .map((e) => e.target);
        
        return [
          vertexUuid,
          ...children.flatMap((child) => getDescendants(child)),
        ];
      };

      const affectedVertices = getDescendants(uuid);
      
      // Separate edges into those we keep vs those we detach
      const edgesToDetach = state.edges.filter((e) =>
        // Detach the edge connecting to parent (where this vertex is target)
        e.target === uuid ||
        // Keep all edges within the yanked subtree
        false
      );

      const remainingEdges = state.edges.filter((e) =>
        !edgesToDetach.includes(e)
      );

      // Store detached edges
      const newDetachedEdges = new Map(state.detachedEdges);
      newDetachedEdges.set(uuid, edgesToDetach);

      return {
        edges: remainingEdges,
        detachedEdges: newDetachedEdges,
      };
    });
  },

  reattachVertex: (uuid, newParentUuid) => {
    set((state) => {
      const detachedEdges = state.detachedEdges.get(uuid);
      
      if (!detachedEdges) {
        console.warn(`No detached edges found for vertex ${uuid}`);
        return state;
      }

      // Create new edge from new parent to this vertex
      const newEdge: EdgeType = {
        uuid: `edge-${newParentUuid}-${uuid}-${Date.now()}`,
        source: newParentUuid,
        target: uuid,
        color: detachedEdges[0]?.color, // Preserve original edge color if any
      };

      // Remove from detached edges map
      const newDetachedEdges = new Map(state.detachedEdges);
      newDetachedEdges.delete(uuid);

      return {
        edges: [...state.edges, newEdge],
        detachedEdges: newDetachedEdges,
      };
    });
  },

  isVertexYanked: (uuid) => {
    return get().detachedEdges.has(uuid);
  },
}));