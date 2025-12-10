// stores/use-graph.ts
import { create } from "zustand";
import type { GraphType, VertexType, EdgeType } from "@/types/graph";

interface GraphState {
  vertices: VertexType[];
  edges: EdgeType[];
  yankedVertexId: string | null;
  // Stores the edges that were connected to the yanked vertex
  disconnectedEdges: EdgeType[];

  // Actions
  setGraph: (graph: GraphType) => void;
  translateVertex: (uuid: string, dx: number, dy: number, dz?: number) => void;
  setVertexPosition: (uuid: string, x: number, y: number, z?: number) => void;
  getVertex: (uuid: string) => VertexType | undefined;
  getEdgesForVertex: (uuid: string) => EdgeType[];
  
  // Yank actions
  yankVertex: (uuid: string) => void;
  attachVertex: (targetUuid: string, asChild: "left" | "right") => void;
  cancelYank: () => void;
  isYanked: (uuid: string) => boolean;
  canAttachTo: (uuid: string) => boolean;
}

export const useGraph = create<GraphState>((set, get) => ({
  vertices: [],
  edges: [],
  yankedVertexId: null,
  disconnectedEdges: [],

  setGraph: (graph) => {
    set({
      vertices: graph.vertices,
      edges: graph.edges,
      yankedVertexId: null,
      disconnectedEdges: [],
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
    const state = get();
    
    // Can't yank if something is already yanked
    if (state.yankedVertexId !== null) return;
    
    // Find all edges connected to this vertex
    const connectedEdges = state.edges.filter(
      (e) => e.source === uuid || e.target === uuid
    );
    
    // Remove those edges from the graph, store them separately
    set({
      yankedVertexId: uuid,
      disconnectedEdges: connectedEdges,
      edges: state.edges.filter(
        (e) => e.source !== uuid && e.target !== uuid
      ),
    });
  },

  attachVertex: (targetUuid, asChild) => {
    const state = get();
    const yankedId = state.yankedVertexId;
    
    if (yankedId === null) return;
    if (yankedId === targetUuid) return;
    
    // Create new edge: target becomes parent of yanked vertex
    const newEdge: EdgeType = {
      uuid: `edge-${targetUuid}-${yankedId}-${asChild}`,
      source: targetUuid,
      target: yankedId,
    };
    
    // Get all descendants of the yanked vertex from disconnected edges
    const descendantEdges = getDescendantEdges(
      yankedId,
      state.disconnectedEdges
    );
    
    set({
      yankedVertexId: null,
      disconnectedEdges: [],
      edges: [...state.edges, newEdge, ...descendantEdges],
    });
  },

  cancelYank: () => {
    const state = get();
    
    // Restore the disconnected edges
    set({
      yankedVertexId: null,
      edges: [...state.edges, ...state.disconnectedEdges],
      disconnectedEdges: [],
    });
  },

  isYanked: (uuid) => {
    const state = get();
    if (state.yankedVertexId === null) return false;
    
    // Check if this vertex is the yanked one or a descendant
    if (uuid === state.yankedVertexId) return true;
    
    // Check if it's a descendant of the yanked vertex
    return isDescendantOf(uuid, state.yankedVertexId, state.disconnectedEdges);
  },

  canAttachTo: (uuid) => {
    const state = get();
    
    // Can't attach if nothing is yanked
    if (state.yankedVertexId === null) return false;
    
    // Can't attach to itself
    if (uuid === state.yankedVertexId) return false;
    
    // Can't attach to a descendant of the yanked vertex
    if (isDescendantOf(uuid, state.yankedVertexId, state.disconnectedEdges)) {
      return false;
    }
    
    return true;
  },
}));

// Helper: Check if childId is a descendant of parentId given a set of edges
function isDescendantOf(
  childId: string,
  parentId: string,
  edges: EdgeType[]
): boolean {
  const childrenOfParent = edges.filter((e) => e.source === parentId);
  
  for (const edge of childrenOfParent) {
    if (edge.target === childId) return true;
    if (isDescendantOf(childId, edge.target, edges)) return true;
  }
  
  return false;
}

// Helper: Get all edges that form the subtree rooted at parentId
function getDescendantEdges(parentId: string, edges: EdgeType[]): EdgeType[] {
  const result: EdgeType[] = [];
  const childEdges = edges.filter((e) => e.source === parentId);
  
  for (const edge of childEdges) {
    result.push(edge);
    result.push(...getDescendantEdges(edge.target, edges));
  }
  
  return result;
}