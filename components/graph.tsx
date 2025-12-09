import { Vector3, Mesh, Object3D, Plane } from "three";
import type { VertexType, EdgeType } from "@/types/graph";
import { Line } from "@react-three/drei/native";
import { useFrame } from "@react-three/fiber/native";
import { useRef, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useGraph } from "@/stores/use-graph";

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
  uuid,
  nodeColor = "black",
  textColor = "white",
}: VertexType) {
  const r = value + BASE_RADIUS;
  const [color, setColor] = useState<string>(nodeColor);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const floorPlane = useRef<Plane>(new Plane(new Vector3(0, 0, 1), 0));
  const planeIntersectPoint = useRef<Vector3>(new Vector3());
  const ref = useRef<Object3D>(null!);

  const { translateVertex, setVertexPosition } = useGraph();

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    console.log(`pointer down on vertex ${uuid}`);
    setIsDragging(true);
    setColor("silver");
    if (!event.target) return;
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    console.log(`pointer up on vertex ${uuid}`);
    setIsDragging(false);
    setColor(nodeColor);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    event.ray.intersectPlane(floorPlane.current, planeIntersectPoint.current);
    const dx = planeIntersectPoint.current.x - x;
    const dy = planeIntersectPoint.current.y - y;
    setVertexPosition(
      uuid,
      planeIntersectPoint.current.x,
      planeIntersectPoint.current.y,
      z,
    );
  };

  return (
    <object3D
      ref={ref}
      onPointerMove={handlePointerMove}
      position={[x, y, z]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
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
          uuid={v.uuid}
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
