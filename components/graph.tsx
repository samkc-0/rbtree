import { useState } from "react";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { VertexType, EdgeType } from "@/types/graph";

const BASE_RADIUS = 4;

type GraphProps = {
  vertices: VertexType[];
  edges: EdgeType[];
  position: { x: number; y: number; z: number };
};

function Vertex2D({
  x,
  y,
  z,
  value,
  nodeColor = "black",
  textColor = "white",
}: Omit<VertexType, "uuid">) {
  const r = value + BASE_RADIUS;
  return (
    <mesh position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[r, r + 1, 2]} />
      <meshBasicMaterial color={nodeColor} />
    </mesh>
  );
}

type LineProps = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color?: string;
};

function Line({ start, end, color = "hotpink" }: LineProps) {
  const ref = useRef<any>(undefined);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.geometry.setFromPoints([start, end]);
  });
  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color={color} />
    </line>
  );
}

export function Graph2D(props: GraphProps) {
  const [vertices, setVertices] = useState<VertexType[]>(props.vertices);
  const [edges, setEdges] = useState<EdgeType[]>(props.edges);
  const { position } = props;
  return (
    <group>
      {vertices.map((v, i) => (
        <group key={v.uuid || i}>
          <Vertex2D
            x={v.x}
            y={v.y}
            z={props.position.z}
            value={v.value}
            nodeColor={v.nodeColor}
            textColor={v.textColor}
          />
        </group>
      ))}

      {edges.map((e, i) => {
        console.log(e);
        const source = vertices.find((v) => v.uuid === e.source);
        if (!source) return;
        const target = vertices.find((v) => v.uuid === e.target)!;
        if (!target) return;
        const start = new THREE.Vector3(source.x, source.y, position.z);
        const end = new THREE.Vector3(target.x, target.y, position.z);
        return (
          <object3D key={e.uuid || i}>
            <Line start={start} end={end} color={e.color} />
          </object3D>
        );
      })}
    </group>
  );
}
