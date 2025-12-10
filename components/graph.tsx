import { Vector3, Mesh, Object3D, Plane } from "three";
import type { VertexType, EdgeType } from "@/types/graph";
import { Line } from "@react-three/drei/native";
import { useFrame, useThree } from "@react-three/fiber/native";
import { useRef, useState } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useGraph } from "@/stores/use-graph";

const BASE_RADIUS = 6;
const YANK_THRESHOLD = 50; // Distance to drag before yanking
const REATTACH_THRESHOLD = 15; // Distance to another vertex to reattach

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
  const [dragDistance, setDragDistance] = useState<number>(0);
  const dragStartPos = useRef<Vector3>(new Vector3(x, y, z));
  const floorPlane = useRef<Plane>(new Plane(new Vector3(0, 0, 1), 0));
  const planeIntersectPoint = useRef<Vector3>(new Vector3());
  const ref = useRef<Object3D>(null!);

  const {
    setVertexPosition,
    yankVertex,
    reattachVertex,
    isVertexYanked,
    vertices,
    edges,
  } = useGraph();

  const isYanked = isVertexYanked(uuid);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    //event.stopPropagation();
    console.log(`pointer down on vertex ${uuid}`);
    setIsDragging(true);
    setColor("silver");
    setDragDistance(0);
    dragStartPos.current.set(x, y, z);
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    //event.stopPropagation();
    console.log(`pointer up on vertex ${uuid}`);
    setIsDragging(false);
    setColor(isYanked ? "orange" : nodeColor);

    // Check if we should reattach to a nearby vertex
    if (isYanked) {
      const nearbyVertex = vertices.find((v) => {
        if (v.uuid === uuid) return false;
        const distance = Math.sqrt(Math.pow(v.x - x, 2) + Math.pow(v.y - y, 2));
        return distance < REATTACH_THRESHOLD;
      });

      if (nearbyVertex) {
        console.log(`Reattaching ${uuid} to ${nearbyVertex.uuid}`);
        reattachVertex(uuid, nearbyVertex.uuid);
        setColor(nodeColor);
      }
    }
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    //event.stopPropagation();

    event.ray.intersectPlane(floorPlane.current, planeIntersectPoint.current);

    // Calculate distance from drag start
    const distance = dragStartPos.current.distanceTo(
      planeIntersectPoint.current,
    );
    setDragDistance(distance);

    // Yank if dragged beyond threshold and not already yanked
    if (distance > YANK_THRESHOLD && !isYanked) {
      console.log(`Yanking vertex ${uuid}`);
      yankVertex(uuid);
      setColor("orange");
    }

    setVertexPosition(
      uuid,
      planeIntersectPoint.current.x,
      planeIntersectPoint.current.y,
      z,
    );
  };

  // Visual indicator for yanked vertices
  const finalColor = isYanked ? "orange" : color;
  const zOffset = isYanked ? 10 : 0; // Lift yanked vertices up

  return (
    <object3D
      ref={ref}
      onPointerMove={handlePointerMove}
      position={[x, y, z + zOffset]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMissed={handlePointerUp}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 5]} />
        <meshBasicMaterial color={finalColor} />
      </mesh>
      {/* Optional: Add a ring to show reattach range when yanked */}
      {isYanked && isDragging && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -3]}>
          <ringGeometry
            args={[REATTACH_THRESHOLD - 2, REATTACH_THRESHOLD, 32]}
          />
          <meshBasicMaterial color="lightblue" transparent opacity={0.3} />
        </mesh>
      )}
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
        if (!source) throw new Error(`badly formed edge: ${e}`);

        const target = vertices.find((v) => v.uuid === e.target)!;
        if (!target) throw new Error(`badly formed edge: ${e}`);

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

