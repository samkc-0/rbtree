import { Vector3 } from "three";
import type { VertexType, EdgeType } from "@/types/graph";
import { Line } from "@react-three/drei/native";
import { useState } from "react";

const BASE_RADIUS = 6;

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
  const [color, setColor] = useState<string>(nodeColor);
  return (
    <object3D position={[x, y, z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 5]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </object3D>
  );
}

export function Graph2D({ vertices, edges, position }: GraphProps) {
  return (
    <group>
      {vertices.map((v) => (
        <Vertex2D
          key={v.uuid}
          x={v.x}
          y={v.y}
          z={position.z}
          value={v.value}
          nodeColor={v.nodeColor}
          textColor={v.textColor}
        />
      ))}

      {edges.map((e) => {
        const source = vertices.find((v) => v.uuid === e.source);
        if (!source) throw new Error(`bady formed edge: ${e}`);

        const target = vertices.find((v) => v.uuid === e.target)!;
        if (!target) throw new Error(`bady formed edge: ${e}`);

        const start = new Vector3(source.x, source.y, position.z);
        const end = new Vector3(target.x, target.y, position.z);

        return (
          <Line
            key={e.uuid}
            points={[start, end]}
            color={"black"}
            lineWidth={5}
          />
        );
      })}
    </group>
  );
}
