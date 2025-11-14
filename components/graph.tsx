import { useState } from "react";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { VertexType, EdgeType } from "@/types/graph";

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
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[value, 32, 32]} />
      <meshBasicMaterial color={nodeColor} />
    </mesh>
  );
}

function Edge({ source, target }: Omit<EdgeType, "uuid">) {
  const ref = useRef<any>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.geometry.setFromPoints(
        [source, target].map(
          (point) => new THREE.Vector3(point.x, point.y, point.z),
        ),
      );
    }
  });

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="hotpink" />
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

      {edges.map((e, i) => (
        <object3D key={e.uuid || i}>
          <Edge source={e.source} target={e.target} color={e.color} />
        </object3D>
      ))}
    </group>
  );
}
