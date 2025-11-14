export type VertexType = {
  uuid: string;
  x: number;
  y: number;
  z: number;
  value: number;
  nodeColor?: string;
  textColor?: string;
};

export type EdgeType = {
  uuid: string;
  source: string;
  target: string;
  color?: string;
};

export type GraphType = {
  vertices: VertexType[];
  edges: EdgeType[];
};
