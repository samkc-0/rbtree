import { useState, useMemo } from "react";
import useWindowSize  from "@/hooks/use-window-size";

type VertexType = {
  uuid: string;
  x: number;
  y: number;
  z: number;
  value: number;
  nodeColor?: string;
  textColor?: string;
};

type EdgeType = {
  uuid: string;
  source: VertexType;
  target: VertexType;
  color?: string;
};
type GraphProps = {
  vertices: VertexType[];
  edges: EdgeType[];
  position: { x: number; y: number; z: number };
};

export function Graph2D(props: GraphProps) {
  const { width, height } = useWindowSize();
  const graph = useMemo(() => {
  const [vertices, setVertices] = useState<VertexType[]>(props.vertices);
  const [edges, setEdges] = useState<EdgeType[]>(props.edges);
  const { position } = props;
  return <group position={[position.x, position.y, position.z]}>
    {vertices.map((v) => {
      return <Vertex2D
        key={v.uuid}
        x={v.x}
        y={v.y}
        z={props.position.z}
        value={v.value}
        backgroundColor={v.nodeColor}
        color={v.textColor}
      />;
    })}
    {edges.map((e) => {
    return <Edge key={e.uuid} source={e.source} target={e.target} color={e.color} />;
    })}
  </group>;
}


function Vertex2D({ x, y, z, value, nodeColor = "black", textColor = "white" }: VertexType) {
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[value, 32, 32]} />
      <meshStandardMaterial color={backgroundColor} />
      <meshBasicMaterial attach="material" color={color} />
    </mesh>
  );
}

function Edge({ source, target, color = "black" }: EdgeType) {
  return (
    <line>
      <lineGeometry args={[source, target]} />
      <lineBasicMaterial attach="material" color={color} />
    </line>
  );
}
